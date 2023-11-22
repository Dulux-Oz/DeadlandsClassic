/* eslint-disable no-console */
import { DlcSocket } from './dlc-socket.mjs';

export class DlcSocketManager {
  constructor() {
    this.modules = new Map();
    this.system = undefined;
  }

  registerModule(moduleName) {
    const existingSocket = this.modules.get(moduleName);

    if (existingSocket) {
      return existingSocket;
    }

    const module = game.modules.get(moduleName);

    if (!module?.active) {
      console.error(
        `DlcSocketManager | Someone tried to register module '${moduleName}', ` +
          `but no module with that name is active. As a result the registration request has been ignored.`
      );

      return undefined;
    }

    if (!module.socket) {
      console.error(
        `DlcSocketManager | Failed to register socket for module '${moduleName}'. Please set '"socket":true' ` +
          `in your manifset and restart foundry (you need to reload your world - simply reloading your browser won't do).`
      );

      return undefined;
    }

    const newSocket = new DlcSocket(moduleName, 'module');
    this.modules.set(moduleName, newSocket);
    return newSocket;
  }

  registerSystem(systemId) {
    if (game.system.id !== systemId) {
      console.error(
        `DlcSocketManager | Someone tried to register system '${systemId}', but that system isn't active. ` +
          `As a result the registration request has been ignored.`
      );

      return undefined;
    }

    const existingSocket = this.system;

    if (existingSocket) {
      return existingSocket;
    }

    if (!game.system.socket) {
      console.error(
        `DlcSocketManager | Failed to register socket for system '${systemId}'. Please set '"socket":true' ` +
          `in your manifest and restart foundry (you need to reload your world - simply reloading your browser won't do).`
      );
    }

    const newSocket = new DlcSocket(systemId, 'system');
    this.system = newSocket;
    return newSocket;
  }
}
