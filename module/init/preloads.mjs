export async function preloadTemplates() {
  const templateDir = 'systems/deadlands-classic/templates/';

  const aTemplatePaths = [`${templateDir}sidebar/combat-tracker.html`];

  return loadTemplates(aTemplatePaths);
}
