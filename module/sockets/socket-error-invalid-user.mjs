import { SocketError } from './socket-error.mjs';

export class SocketInvalidUserError extends SocketError {
  constructor(...args) {
    super(...args);
    this.name = 'SocketInvalidUserError';
  }
}
