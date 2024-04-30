/**
 * Add chips TAB to sidebar
 *
 * @param {*} app
 * @param {*} html
 */
export function addChipTab(app, html) {
  if (!game.user.isGM) return;

  // Calculate new tab width
  html[0]
    .querySelector('#sidebar-tabs')
    .style.setProperty(
      '--sidebar-tab-width',
      `${Math.floor(
        parseInt(
          getComputedStyle(html[0]).getPropertyValue('--sidebar-width'),
          10
        ) /
          (document.querySelector('#sidebar-tabs').childElementCount + 1)
      )}px`
    );

  const tab = document.createElement('a');
  tab.classList.add('item');
  tab.dataset.tab = 'chips';
  tab.dataset.tooltip = 'Chip Manager';

  // Add a title if tooltips don't exist
  if (!('tooltip' in game)) tab.title = 'Chip Manager';

  // Add icon for tab
  const icon = document.createElement('i');
  icon.setAttribute('class', `fas fa-yin-yang`);
  tab.append(icon);

  // Add Chip Manager tab to sidebar before items if it's not already there
  if (!document.querySelector("#sidebar-tabs > [data-tab='chips']")) {
    document.querySelector("#sidebar-tabs > [data-tab='items']").before(tab);
  }

  // this template determines where the <section> for ChipManager is placed
  document
    .querySelector('template#items')
    .insertAdjacentHTML(
      'beforebegin',
      `<template class="tab" id="chips" data-tab="chips"></template>`
    );
  // end party tab
}
