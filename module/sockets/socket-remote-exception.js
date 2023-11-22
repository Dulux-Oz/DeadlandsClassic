import { SocketError } from './socket-error.mjs';

export class SocketRemoteException extends SocketError {
  constructor(...args) {
    super(...args);
    this.name = 'SocketRemoteException';
  }
}
