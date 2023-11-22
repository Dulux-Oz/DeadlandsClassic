import { SocketError } from './socket-error.mjs';

export class SocketInternalError extends SocketError {
  constructor(...args) {
    super(...args);
    this.name = 'SocketInternalError';
  }
}
