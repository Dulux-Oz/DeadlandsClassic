import { SocketError } from './socket-error.mjs';

export class SocketUnregisteredHandlerError extends SocketError {
  constructor(...args) {
    super(...args);
    this.name = 'SocketUnregisteredHandlerError';
  }
}
