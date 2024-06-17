export async function preloadTemplates() {
  const templateDir = 'systems/deadlands-classic/templates/';
  const sPrePath = `${templateDir}actor-sheet/`;
  const concentrationsPath = `${templateDir}concentrations/`;
  const createActorPath = `${templateDir}char-create/`;
  const modifyActorPath = `${templateDir}char-modify/`;
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
  ];
  return loadTemplates(aTemplatePaths);
}
