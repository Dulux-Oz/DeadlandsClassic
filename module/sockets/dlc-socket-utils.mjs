import { RecipientTypes } from './dlc-socket-types.mjs';

export function executeLocal(func, ...args) {
  const socketdata = { userId: game.userId };
  return func.call({ socketdata }, ...args);
}

export function isActiveGM(user) {
  return user.active && user.isGM;
}

export function isResponsibleGM() {
  if (!game.user.isGM) return false;
  const connectedGMs = game.users.filter(isActiveGM);
  return !connectedGMs.some((other) => other.id < game.user.id);
}

export function isResponseSenderValid(senderId, recipients) {
  if (recipients === RecipientTypes.One_GM && game.users.get(senderId).isGM) {
    return true;
  }
  if (recipients instanceof Array && recipients.includes(senderId)) return true;
  return false;
}
