/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
import * as aptUtils from '../helpers/aptitude-utilities.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ManageConcentrations extends HandlebarsApplicationMixin(
  ApplicationV2
) {
  static DEFAULT_OPTIONS = {
    actions: {
      addConcentration: this._addConcentration,
      removeConcentration: this._removeConcentration,
    },
    classes: ['sheet', 'dlc'],
    tag: 'form',
    form: {
      closeOnSubmit: true,
      submitOnChange: false,
      resizable: true,
    },
    position: {
      height: 500,
    },
    window: {
      icon: '',
      title: '',
      resizable: true,
    },
  };

  static PARTS = {
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    weirdPart: {
      template:
        'systems/deadlands-classic/templates/concentrations/weird-west.hbs',
      scrollable: [''],
    },
    hoePart: {
      template:
        'systems/deadlands-classic/templates/concentrations/hell-on-earth.hbs',
      scrollable: [''],
    },
    lostPart: {
      template:
        'systems/deadlands-classic/templates/concentrations/lost-colony.hbs',
      scrollable: [''],
    },
  };

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'hoePart':
      case 'lostPart':
      case 'weirdPart':
        context.tab = context.tabs[partId];
        break;
      default:
    }
    return context;
  }

  /**
   * Generates the data for the generic tab navigation template
   * @param {string[]} parts An array of named template parts to render
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getTabs(parts) {
    // If you have sub-tabs this is necessary to change
    const tabGroup = 'primary';

    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'weirdPart';

    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'DLC.tab.',
      };

      switch (partId) {
        case 'tabs':
          return tabs;

        case 'hoePart':
          tab.id = 'hoePart';
          tab.label += 'hell-on-earth';
          break;
        case 'lostPart':
          tab.id = 'lostPart';
          tab.label += 'lost-colony';
          break;
        case 'weirdPart':
          tab.id = 'weirdPart';
          tab.label += 'weird-west';
          break;
        default:
      }

      tab.active = this.tabGroups[tabGroup] === tab.id;
      if (tab.active) tab.cssClass = 'active';

      // eslint-disable-next-line no-param-reassign
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(options) {
    let context = await super._prepareContext(options);

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
      tabs: this._getTabs(options.parts),
      weird,
      hell,
      lost,
    });

    return context;
  }

  /* -------------------------------------------- */

  static async _addConcentration(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const entry = btn.closest('.concentration-entry');

    const { id, worldId, world } = entry.dataset;

    const concData = game.settings.get(
      'deadlands-classic',
      'extraConcentrations'
    );
    const settingData = concData.toObject();
    const processedid = worldId.split(' ').join('');

    const conc = document.getElementsByName(processedid)[0].value;

    settingData[id][world].push(conc);
    settingData[id][world].sort();

    await game.settings.set(
      'deadlands-classic',
      'extraConcentrations',
      settingData
    );

    this.render();
  }

  // eslint-disable-next-line class-methods-use-this
  static async _removeConcentration(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const entry = btn.closest('.concentration-entry');

    const { id, world } = entry.dataset;

    const concData = game.settings.get(
      'deadlands-classic',
      'extraConcentrations'
    );

    const settingData = concData.toObject();
    let item = 0;

    ({ item } = btn.dataset);
    settingData[id][world].splice(item, 1);

    await game.settings.set(
      'deadlands-classic',
      'extraConcentrations',
      settingData
    );

    this.render();
  }
}
