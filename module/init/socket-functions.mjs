export function logCombatant(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  const combatant = combat.combatants.get(combatantId);
  // eslint-disable-next-line no-console
  console.log('Found ', combatant.name);
}

// Draw a card
export function socketDrawCard(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  const combatant = combat.combatants.get(combatantId);

  return combatant.draw(1);
}

// End combatant's turn
export function socketNextTurn(combatId) {
  const combat = game.combats.get(combatId);

  return combat.nextTurn();
}

// Sleeve the highest card
export function socketSleeveHighest(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  const combatant = combat.combatants.get(combatantId);
  return combatant.sleeveHighest();
}

// Toggle the use joker
export function socketToggleRedJoker(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  const combatant = combat.combatants.get(combatantId);
  return combatant.toggleRedJoker();
}

// Toggle the use joker
export function socketToggleBlackJoker(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  const combatant = combat.combatants.get(combatantId);
  return combatant.toggleBlackJoker();
}

export function socketToggleSleeved(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  const combatant = combat.combatants.get(combatantId);
  return combatant.toggleSleeved();
}

export function socketToggleHostility(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  const combatant = combat.combatants.get(combatantId);

  return combatant.toggleHostility();
}

export function socketVamoose(combatId, combatantId) {
  const combat = game.combats.get(combatId);
  const combatant = combat.combatants.get(combatantId);

  return combatant.vamoose();
}
