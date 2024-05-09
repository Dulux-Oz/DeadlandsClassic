export async function preloadTemplates() {
  const templateDir = 'systems/deadlands-classic/templates/';
  const sPrePath = `${templateDir}actor-sheet/`;
  const createActorPath = `${templateDir}char-create/`;
  const modifyActorPath = `${templateDir}char-modify/`;
  const aTemplatePaths = [
    `${sPrePath}aptitudes.html`,
    `${sPrePath}biodata.html`,
    `${sPrePath}combat.html`,
    `${sPrePath}chips.html`,
    `${sPrePath}edges.html`,
    `${sPrePath}gear.html`,
    `${sPrePath}main.html`,
    `${sPrePath}spells.html`,

    `${templateDir}sidebar/combat-tracker.html`,

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
