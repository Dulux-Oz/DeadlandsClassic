import { SocketError } from './socket-error.mjs';

export class SocketNoGMConnectedError extends SocketError {
  constructor(...args) {
    super(...args);
    this.name = 'SocketNoGMConnectedError';
  }
}
