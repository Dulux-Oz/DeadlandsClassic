export function logCombatant(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  const combatant = combat.combatants.get(combatantId);
  // eslint-disable-next-line no-console
  console.log('Found ', combatant.name);
}

// Draw a card
export function socketDrawCard(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  return combat.draw(combatantId);
}

export function socketNextTurn(combatId) {
  const combat = game.combats.get(combatId);
  return combat.nextTurn();
}

export function socketSleeveHighest(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  return combat.sleeveHighest(combatantId);
}

export function socketToggleRedJoker(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  return combat.toggleRedJoker(combatantId);
}

export function socketToggleBlackJoker(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  return combat.toggleBlackJoker(combatantId);
}

export function socketToggleSleeved(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  return combat.toggleSleeved(combatantId);
}

export function socketToggleHostility(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  return combat.toggleHostility(combatantId);
}

export function socketVamoose(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  return combat.vamoose(combatantId);
}
