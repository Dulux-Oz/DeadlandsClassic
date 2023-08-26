export async function fpPreloadTemplates() {
  const sPrePath = `systems/deadlands/templates/parts/dlc-`;
  const sCharSheetPath = `${sPrePath}character-sheet-`;
  const aTemplatePaths = [
    `${sCharSheetPath}aptitudes.html`,
    `${sCharSheetPath}biodata.html`,
    `${sCharSheetPath}combat.html`,
    `${sCharSheetPath}edges.html`,
    `${sCharSheetPath}gear.html`,
    `${sCharSheetPath}main.html`,
    `${sCharSheetPath}spells.html`,
  ];
  return loadTemplates(aTemplatePaths);
}
