export async function preloadTemplates() {
  const templateDir = 'systems/deadlands-classic/templates/';

  const concentrationsPath = `${templateDir}concentrations/`;

  const createActorPath = `${templateDir}char-create/`;
  const modifyActorPath = `${templateDir}char-modify/`;

  const v1createActorPath = `${templateDir}v1apps/char-create/`;
  const v1modifyActorPath = `${templateDir}v1apps/char-modify/`;
  const v1showActorPath = `${templateDir}v1apps/char-show/`;

  const aTemplatePaths = [
    `${templateDir}sidebar/combat-tracker.html`,

    `${concentrationsPath}concentrations.html`,
    `${concentrationsPath}hell-on-earth.html`,
    `${concentrationsPath}lost-colony.html`,
    `${concentrationsPath}weird-west.html`,

    // `${createActorPath}aptitude.html`,
    // `${createActorPath}edge.html`,
    // `${createActorPath}trait.html`,
    // `${createActorPath}character.html`,

    // `${modifyActorPath}aptitude.html`,
    // `${modifyActorPath}edge.html`,
    // `${modifyActorPath}trait.html`,
    // `${modifyActorPath}character.html`,

    `${v1createActorPath}aptitude.html`,
    `${v1createActorPath}edge.html`,
    `${v1createActorPath}trait.html`,
    `${v1createActorPath}character.html`,

    `${v1modifyActorPath}aptitude.html`,
    `${v1modifyActorPath}edge.html`,
    `${v1modifyActorPath}trait.html`,
    `${v1modifyActorPath}character.html`,

    `${v1showActorPath}aptitudes.html`,
    `${v1showActorPath}biodata.html`,
    `${v1showActorPath}chips.html`,
    `${v1showActorPath}combat.html`,
    `${v1showActorPath}edges.html`,
    `${v1showActorPath}gear.html`,
    `${v1showActorPath}character.html`,
    `${v1showActorPath}spells.html`,
    `${v1showActorPath}traits.html`,
  ];
  return loadTemplates(aTemplatePaths);
}
