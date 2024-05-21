/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
import * as aptUtils from '../helpers/aptitude-utilities.mjs';

/* --------------------------------------------------------------------------
 | The sidebar directory which organizes and displays world-level Combat
 |  documents.
 + -------------------------------------------------------------------    */

export class ManageConcentrations extends FormApplication {
  /** @inheritdoc */

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template:
        'systems/deadlands-classic/templates/concentrations/concentrations.html',
      width: 660,
      height: 800,
      closeOnSubmit: false,
      submitOnClose: false,
      submitOnChange: false,
      resizable: true,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'weird-west',
        },
      ],
    });
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /** @inheritdoc */
  async getData(options = {}) {
    let context = await super.getData(options);

    const concData = game.settings.get(
      'deadlands-classic',
      'extraConcentrations'
    );

    const weird = {};
    const hell = {};
    const lost = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(concData)) {
      const { WW, HE, LC } = concData[[key]];
      const processedKey = key.split(' ').join('');

      if (typeof WW !== 'undefined') {
        const config = aptUtils.getBaseConcentrations(key, 'WW');
        const processedWW = WW.reduce(
          (obj, conc) => ({
            ...obj,
            [conc]: conc,
          }),
          {}
        );
        weird[[key]] = {
          config,
          extra: processedWW,
          id: key,
          worldId: processedKey.concat('WW'),
          world: 'WW',
        };
      }

      if (typeof HE !== 'undefined') {
        const config = aptUtils.getBaseConcentrations(key, 'HE');
        const processedHE = HE.reduce(
          (obj, conc) => ({
            ...obj,
            [conc]: conc,
          }),
          {}
        );
        hell[[key]] = {
          config,
          extra: processedHE,
          id: key,
          worldId: processedKey.concat('HE'),
          world: 'HE',
        };
      }

      if (typeof LC !== 'undefined') {
        const config = aptUtils.getBaseConcentrations(key, 'LC');
        const processedLC = LC.reduce(
          (obj, conc) => ({
            ...obj,
            [conc]: conc,
          }),
          {}
        );
        lost[[key]] = {
          config,
          extra: processedLC,
          id: key,
          worldId: processedKey.concat('LC'),
          world: 'LC',
        };
      }
    }

    context = foundry.utils.mergeObject(context, {
      weird,
      hell,
      lost,
    });

    return context;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    // chip control
    html
      .find('.concentration-control')
      .click((event) => this.#onConcentrationControl(event));
  }

  // eslint-disable-next-line class-methods-use-this
  async #onConcentrationControl(event) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.currentTarget;
    const entry = btn.closest('.concentration-entry');

    const { id } = entry.dataset;
    const { worldId } = entry.dataset;
    const { world } = entry.dataset;

    const processedid = worldId.split(' ').join('');

    const concData = game.settings.get(
      'deadlands-classic',
      'extraConcentrations'
    );

    const settingData = concData.toObject();
    let choice = '';
    let conc = '';
    let item = 0;

    switch (btn.dataset.control) {
      case 'addConcentration':
        // eslint-disable-next-line prefer-destructuring
        choice = document.getElementsByName(processedid)[0];
        conc = choice.value;
        settingData[id][world].push(conc);
        settingData[id][world].sort();

        await game.settings.set(
          'deadlands-classic',
          'extraConcentrations',
          settingData
        );
        break;

      case 'removeConcentration':
        ({ item } = btn.dataset);
        settingData[id][world].splice(item, 1);

        await game.settings.set(
          'deadlands-classic',
          'extraConcentrations',
          settingData
        );
        break;
      default:
    }
    this.render();
  }
}
