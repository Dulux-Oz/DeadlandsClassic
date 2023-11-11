import { Chips } from '../helpers/chips.mjs';

function socketLogCombatant(combatId, combatantId, index) {
  const combat = game.combats.get(combatId);
  const combatant = combat.combatants.get(combatantId);
  // eslint-disable-next-line no-console
  console.log('Found ', combatant.name, ' ', index);
}

function socketDiscardCard(combatId, combatantId, index) {
  const combat = game.combats.get(combatId);
  const combatant = combat.combatants.get(combatantId);

  combatant.discardCard(index);
}

function socketDrawCard(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  return combat.draw(combatantId);
}

function socketNextTurn(combatId) {
  const combat = game.combats.get(combatId);
  return combat.nextTurn();
}

function socketSleeveHighest(combatId) {
  const combat = game.combats.get(combatId);
  return combat.sleeveHighest();
}

function socketToggleRedJoker(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  return combat.toggleRedJoker(combatantId);
}

function socketToggleBlackJoker(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  return combat.toggleBlackJoker(combatantId);
}

function socketToggleSleeved(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  return combat.toggleSleeved(combatantId);
}

function socketToggleHostility(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  return combat.toggleHostility(combatantId);
}

function socketUndiscardCard(combatId, combatantId, index) {
  const combat = game.combats.get(combatId);
  const combatant = combat.combatants.get(combatantId);

  combatant.undiscardCard(index);
}

function socketVamoose(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  return combat.vamoose(combatantId);
}

function socketDrawChipActor(actorId) {
  const chip = Chips.randomDraw(true);
  const actor = game.actors.get(actorId);

  actor.grantChip(chip);
}

function socketGrantChipActor(actorId, chip) {
  if (!(chip in Chips.type)) return;
  const actor = game.actors.get(actorId);

  actor.grantChip(chip);
}

function socketDrawChipMarshal() {
  const chip = Chips.randomDraw(false);

  const marshal = game.settings.get('deadlands-classic', 'marshall-chips');

  if (chip === Chips.type.White) {
    marshal.chips.white += 1;
  } else if (chip === Chips.type.Red) {
    marshal.chips.red += 1;
  } else if (chip === Chips.type.Blue) {
    marshal.chips.blue += 1;
  }

  game.settings.set('deadlands-classic', 'marshall-chips');
}

export function registerSocketFunctions(socket) {
  socket.register('socketLogCombatant', socketLogCombatant);
  socket.register('socketDiscardCard', socketDiscardCard);
  socket.register('socketDrawCard', socketDrawCard);
  socket.register('socketNextTurn', socketNextTurn);
  socket.register('socketSleeveHighest', socketSleeveHighest);
  socket.register('socketToggleBlackJoker', socketToggleBlackJoker);
  socket.register('socketToggleHostility', socketToggleHostility);
  socket.register('socketToggleRedJoker', socketToggleRedJoker);
  socket.register('socketToggleSleeved', socketToggleSleeved);
  socket.register('socketUndiscardCard', socketUndiscardCard);
  socket.register('socketVamoose', socketVamoose);
  socket.register('socketDrawChipActor', socketDrawChipActor);
  socket.register('socketGrantChipActor', socketGrantChipActor);
  socket.register('socketDrawChipMarshal', socketDrawChipMarshal);
}
