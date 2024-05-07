export async function preloadTemplates() {
  const templateDir = 'systems/deadlands-classic/templates/';
  const sPrePath = `${templateDir}actor-sheet/`;
  const concentrationsPath = `${templateDir}concentrations/`;
  const createActorPath = `${templateDir}char-create/`;
  const modifyActorPath = `${templateDir}char-modify/`;
  const itemPath = `${templateDir}item/`;
  const aTemplatePaths = [
    `${sPrePath}aptitudes.html`,
    `${sPrePath}biodata.html`,
    `${sPrePath}chips.html`,
    `${sPrePath}combat.html`,
    `${sPrePath}edges.html`,
    `${sPrePath}gear.html`,
    `${sPrePath}pc-sheet.html`,
    `${sPrePath}spells.html`,
    `${sPrePath}traits.html`,

    `${templateDir}sidebar/combat-tracker.html`,

    `${concentrationsPath}concentrations.html`,
    `${concentrationsPath}hell-on-earth.html`,
    `${concentrationsPath}lost-colony.html`,
    `${concentrationsPath}weird-west.html`,

    `${createActorPath}aptitude.html`,
    `${createActorPath}edge.html`,
    `${createActorPath}trait.html`,
    `${createActorPath}character.html`,

    `${modifyActorPath}aptitude.html`,
    `${modifyActorPath}edge.html`,
    `${modifyActorPath}trait.html`,
    `${modifyActorPath}character.html`,

    `${itemPath}edit-edge-sheet.html`,
    `${itemPath}edit-gun-sheet.html`,
    `${itemPath}edit-other-ranged-sheet.html`,
    `${itemPath}edit-melee-sheet.html`,
    `${itemPath}edit-misc-item-sheet.html`,

    `${itemPath}show-edge-sheet.html`,
    `${itemPath}show-gun-sheet.html`,
    `${itemPath}show-other-ranged-sheet.html`,
    `${itemPath}show-melee-sheet.html`,
    `${itemPath}show-misc-item-sheet.html`,

    `${itemPath}blurb.html`,
    `${itemPath}configure.html`,
    `${itemPath}one.html`,
    `${itemPath}two.html`,
    `${itemPath}three.html`,
    `${itemPath}four.html`,
    `${itemPath}five.html`,
    `${itemPath}capstone.html`,
  ];
  return loadTemplates(aTemplatePaths);
}
