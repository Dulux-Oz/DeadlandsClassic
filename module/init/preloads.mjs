export async function preloadTemplates() {
  const sPrePath = `systems/deadlands-classic/templates/actor-sheet/`;
  const aTemplatePaths = [
    `${sPrePath}aptitudes.html`,
    `${sPrePath}biodata.html`,
    `${sPrePath}combat.html`,
    `${sPrePath}chips.html`,
    `${sPrePath}edges.html`,
    `${sPrePath}gear.html`,
    `${sPrePath}main.html`,
    `${sPrePath}spells.html`,
    'systems/deadlands-classic/templates/sidebar/combat-tracker.html',
  ];
  return loadTemplates(aTemplatePaths);
}
