/* eslint-disable no-console */
import { MessageTypes, RecipientTypes } from './dlc-socket-types.mjs';
import {
  executeLocal,
  isActiveGM,
  isResponseSenderValid,
  isResponsibleGM,
} from './dlc-socket-utils.mjs';
import { SocketInternalError } from './socket-error-internal.mjs';
import { SocketInvalidUserError } from './socket-error-invalid-user.mjs';
import { SocketNoGMConnectedError } from './socket-error-no-gm-connected.mjs';
import { SocketUnregisteredHandlerError } from './socket-error-unregistered-handler.mjs';
import { SocketRemoteException } from './socket-remote-exception.js';

export class DlcSocket {
  constructor(moduleName, moduleType) {
    this.functions = new Map();
    this.socketName = `${moduleType}.${moduleName}`;
    this.pendingRequests = new Map();
    game.socket.on(this.socketName, this.#onSocketReceived.bind(this));
  }

  register(name, func) {
    if (!(func instanceof Function)) {
      console.error(
        `DlcSocket | Cannot register non-function as socket handler for '${name}' for '${this.socketName}'.`
      );
      return;
    }
    if (this.functions.has(name)) {
      console.warn(
        `DlcSocket | Function '${name}' is already registered for '${this.socketName}'. Ignoring registration request.`
      );
      return;
    }
    this.functions.set(name, func);
  }

  async executeAsGM(handler, ...args) {
    const [name, func] = this.#resolveFunction(handler);

    if (game.user.isGM) {
      return executeLocal(func, ...args);
    }

    if (!game.users.find(isActiveGM)) {
      throw new SocketNoGMConnectedError(
        `Could not execute handler '${name}' (${func.name}) as GM, because no GM is connected.`
      );
    }

    return this.#sendRequest(name, args, RecipientTypes.One_GM);
  }

  async executeAsUser(handler, userId, ...args) {
    const [name, func] = this.#resolveFunction(handler);

    if (userId === game.userId) {
      return executeLocal(func, ...args);
    }

    const user = game.users.get(userId);

    if (!user) {
      throw new SocketInvalidUserError(`No user with id '${userId}' exists.`);
    }

    if (!user.active) {
      throw new SocketInvalidUserError(
        `User '${user.name}' (${userId}) is not connected.`
      );
    }

    return this.#sendRequest(name, args, [userId]);
  }

  async executeForAllGMs(handler, ...args) {
    const [name, func] = this.#resolveFunction(handler);

    this.#sendCommand(name, args, RecipientTypes.All_GMs);

    if (game.user.isGM) {
      try {
        executeLocal(func, ...args);
      } catch (e) {
        console.error(e);
      }
    }
  }

  async executeForOtherGMs(handler, ...args) {
    const [name, func] = this.#resolveFunction(handler);
    this.#sendCommand(name, args, RecipientTypes.All_GMs);
  }

  async executeForEveryone(handler, ...args) {
    const [name, func] = this.#resolveFunction(handler);

    this.#sendCommand(name, args, RecipientTypes.Everyone);

    try {
      executeLocal(func, ...args);
    } catch (e) {
      console.error(e);
    }
  }

  async executeForOthers(handler, ...args) {
    const [name, func] = this.#resolveFunction(handler);
    this.#sendCommand(name, args, RecipientTypes.Everyone);
  }

  async executeForUsers(handler, recipients, ...args) {
    if (!(recipients instanceof Array)) {
      throw new TypeError('Recipients parameter must be an array of user ids.');
    }

    const [name, func] = this.#resolveFunction(handler);
    const currentUserIndex = recipients.indexOf(game.userId);

    if (currentUserIndex >= 0) {
      recipients.splice(currentUserIndex, 1);
    }

    this.#sendCommand(name, args, recipients);

    if (currentUserIndex >= 0) {
      try {
        executeLocal(func, ...args);
      } catch (e) {
        console.error(e);
      }
    }
  }

  #sendRequest(handlerName, args, recipient) {
    const message = { handlerName, args, recipient };
    message.id = foundry.utils.randomID();
    message.type = MessageTypes.Request;

    const promise = new Promise((resolve, reject) => {
      this.pendingRequests.set(message.id, {
        handlerName,
        resolve,
        reject,
        recipient,
      });
    });

    game.socket.emit(this.socketName, message);
    return promise;
  }

  #sendCommand(handlerName, args, recipient) {
    const message = { handlerName, args, recipient };
    message.type = MessageTypes.Command;
    game.socket.emit(this.socketName, message);
  }

  #sendResult(id, result) {
    const message = { id, result };
    message.type = MessageTypes.Result;
    game.socket.emit(this.socketName, message);
  }

  #sendError(id, type) {
    const message = { id, type };
    message.userId = game.userId;
    game.socket.emit(this.socketName, message);
  }

  #resolveFunction(func) {
    if (func instanceof Function) {
      const entry = Array.from(this.functions.entries()).find(
        ([key, val]) => val === func
      );
      if (!entry)
        throw new SocketUnregisteredHandlerError(
          `Function '${func.name}' has not been registered as a socket handler.`
        );
      return [entry[0], func];
    }

    const fn = this.functions.get(func);
    if (!fn)
      throw new SocketUnregisteredHandlerError(
        `No socket handler with the name '${func}' has been registered.`
      );
    return [func, fn];
  }

  #onSocketReceived(message, senderId) {
    if (
      message.type === MessageTypes.Command ||
      message.type === MessageTypes.Request
    ) {
      this.#handleRequest(message, senderId);
    } else {
      this.#handleResponse(message, senderId);
    }
  }

  async #handleRequest(message, senderId) {
    const { handlerName, args, recipient, id, type } = message;

    // Check if we're the recipient of the received message. If not, return early.
    if (recipient instanceof Array) {
      if (!recipient.includes(game.userId)) return;
    } else {
      switch (recipient) {
        case RecipientTypes.One_GM:
          if (!isResponsibleGM()) {
            return;
          }
          break;

        case RecipientTypes.All_GMs:
          if (!game.user.isGM) {
            return;
          }
          break;

        case RecipientTypes.Everyone:
          break;

        default:
          console.error(
            `Unkown recipient '${recipient}' when trying to execute '${handlerName}' for '${this.socketName}'. ` +
              `This should never happen. If you see this message, please open an issue in the bug tracker of the DlcSocket repository.`
          );
          return;
      }
    }

    let name;
    let func;

    try {
      [name, func] = this.#resolveFunction(handlerName);
    } catch (e) {
      if (
        e instanceof SocketUnregisteredHandlerError &&
        type === MessageTypes.Request
      ) {
        this.#sendError(id, MessageTypes.Unregistered);
      }
      throw e;
    }

    const socketdata = { socketdata: { userId: senderId } };

    if (type === MessageTypes.Command) {
      func.call(socketdata, ...args);
    } else {
      let result;

      try {
        result = await func.call(socketdata, ...args);
      } catch (e) {
        console.error(
          `An exception occured while executing handler '${name}'.`
        );
        this.#sendError(id, MessageTypes.Exception);
        throw e;
      }

      this.#sendResult(id, result);
    }
  }

  #handleResponse(message, senderId) {
    const { id, result, type } = message;

    const request = this.pendingRequests.get(id);

    if (!request) {
      return;
    }

    if (!isResponseSenderValid(senderId, request.recipient)) {
      console.warn(
        'DlcSocket | Dropped a response that was received from the wrong user. This means that either someone is ' +
          'inserting messages into the socket or this is a DlcSocket issue.'
      );
      console.info(senderId, request.recipient);
      return;
    }

    switch (type) {
      case MessageTypes.Result:
        request.resolve(result);
        break;

      case MessageTypes.Exception:
        request.reject(
          new SocketRemoteException(
            `An exception occured during remote execution of handler '${
              request.handlerName
            }'. Please see ${
              game.users.get(message.userId).name
            }'s error console for details.`
          )
        );
        break;

      case MessageTypes.Unregistered:
        request.reject(
          new SocketUnregisteredHandlerError(
            `Executing the handler '${
              request.handlerName
            }' has been refused by ${
              game.users.get(message.userId).name
            }'s client, because this handler hasn't been registered on that client.`
          )
        );
        break;

      default:
        request.reject(
          new SocketInternalError(
            `Unknown result type '${type}' for handler '${request.handlerName}'. This should never happen.`
          )
        );
        break;
    }

    this.pendingRequests.delete(id);
  }
}
