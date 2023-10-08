export class SocketError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'SocketError';
  }
}
