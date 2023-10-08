import { DlcSocketManager } from './dlc-socket-manager.js';

Hooks.once(
  'init',
  () => {
    window.socketlib = new DlcSocketManager();
    Hooks.callAll('socketlib.ready');
  },
  'WRAPPER'
);
