/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import { Chips } from '../helpers/chips.mjs';
import { DLCActorSheetBase } from './actor-sheet-base.mjs';

const { api } = foundry.applications;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export class DLCActorSheet extends api.HandlebarsApplicationMixin(
  DLCActorSheetBase
) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['dlc', 'sheet', 'actor'],
    position: {
      width: 840,
      height: 800,
    },
    window: {
      resizable: true,
    },
    actions: {
      consumeGreen: this._consumeGreen,
      convertBlue: this._convertBlue,
      convertGreen: this._convertGreen,
      convertRed: this._convertRed,
      convertTemporaryGreen: this._convertTemporaryGreen,
      convertWhite: this._convertWhite,
      drawOne: this._drawOne,
      drawThree: this._drawThree,
      useBlue: this._useBlue,
      useGreen: this._useGreen,
      useRed: this._useRed,
      useRedReroll: this._useRedReroll,
      useTemporaryGreen: this._useTemporaryGreen,
      useWhite: this._useWhite,
    },
    // Custom property that's merged into `this.options`
    form: {
      submitOnChange: true,
    },
  };

  /** @override */
  static PARTS = {
    header: {
      template: 'systems/deadlands-classic/templates/char-show/header.hbs',
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    traits: {
      template: 'systems/deadlands-classic/templates/char-show/traits.hbs',
      scrollable: [''],
    },
    aptitudes: {
      template: 'systems/deadlands-classic/templates/char-show/aptitudes.hbs',
      scrollable: [''],
    },
    combat: {
      template: 'systems/deadlands-classic/templates/char-show/combat.hbs',
      scrollable: [''],
    },
    chips: {
      template: 'systems/deadlands-classic/templates/char-show/chips.hbs',
      scrollable: [''],
    },
    edges: {
      template: 'systems/deadlands-classic/templates/char-show/edges.hbs',
      scrollable: [''],
    },
    gear: {
      template: 'systems/deadlands-classic/templates/char-show/gear.hbs',
      scrollable: [''],
    },
    spells: {
      template: 'systems/deadlands-classic/templates/char-show/spells.hbs',
      scrollable: [''],
    },
    biodata: {
      template: 'systems/deadlands-classic/templates/char-show/biodata.hbs',
      scrollable: [''],
    },
    biography: {
      template: 'systems/deadlands-classic/templates/char-show/biography.hbs',
      scrollable: [''],
    },
    notes: {
      template: 'systems/deadlands-classic/templates/char-show/notes.hbs',
      scrollable: [''],
    },
  };

  async _prepareContext(options) {
    let context = await super._prepareContext(options);

    context = foundry.utils.mergeObject(context, {
      tabs: this._getTabs(options.parts),
    });

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'aptitudes':
      case 'biodata':
      case 'chips':
      case 'combat':
      case 'edges':
      case 'gear':
      case 'spells':
      case 'traits':
        context.tab = context.tabs[partId];
        break;
      case 'biography':
        context.tab = context.tabs[partId];

        // Enrich biography info for display
        context.enrichedBiography = await TextEditor.enrichHTML(
          this.actor.system.biography,
          {
            // Whether to show secret blocks in the finished html
            secrets: this.document.isOwner,
            // Data to fill in for inline rolls
            rollData: this.actor.getRollData(),
            // Relative UUID resolution
            relativeTo: this.actor,
          }
        );
        break;
      case 'notes':
        context.tab = context.tabs[partId];

        // Enrich notes info for display
        context.enrichedNotes = await TextEditor.enrichHTML(
          this.actor.system.notes,
          {
            // Whether to show secret blocks in the finished html
            secrets: this.document.isOwner,
            // Data to fill in for inline rolls
            rollData: this.actor.getRollData(),
            // Relative UUID resolution
            relativeTo: this.actor,
          }
        );
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
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'aptitudes';

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
        case 'header':
        case 'tabs':
          return tabs;
        case 'aptitudes':
          tab.id = 'aptitudes';
          tab.label += 'aptitudes';
          break;
        case 'biodata':
          tab.id = 'biodata';
          tab.label += 'biodata';
          break;
        case 'chips':
          tab.id = 'chips';
          tab.label += 'chips';
          break;
        case 'combat':
          tab.id = 'combat';
          tab.label += 'combat';
          break;
        case 'edges':
          tab.id = 'edges';
          tab.label += 'edges';
          break;
        case 'gear':
          tab.id = 'gear';
          tab.label += 'gear';
          break;
        case 'spells':
          tab.id = 'spells';
          tab.label += 'spells';
          break;
        case 'traits':
          tab.id = 'traits';
          tab.label += 'traits';
          break;
        case 'biography':
          tab.id = 'biography';
          tab.label += 'biography';
          break;
        case 'notes':
          tab.id = 'notes';
          tab.label += 'notes';
          break;
        default:
      }

      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      // eslint-disable-next-line no-param-reassign
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  static async _useWhite(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketUseChipActor',
      this.document.id,
      Chips.type.White
    );
    this.render();
  }

  static async _useRedReroll(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketRedRerollActor',
      this.document.id
    );
    this.render();
  }

  static async _useRed(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketUseChipActor',
      this.document.id,
      Chips.type.Red
    );
    this.render();
  }

  static async _useBlue(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketUseChipActor',
      this.document.id,
      Chips.type.Blue
    );
    this.render();
  }

  static async _useGreen(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketUseChipActor',
      this.document.id,
      Chips.type.Green
    );
    this.render();
  }

  static async _useTemporaryGreen(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketUseChipActor',
      this.document.id,
      Chips.type.TemporaryGreen
    );
    this.render();
  }

  static async _convertWhite(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketConvertChipActor',
      this.document.id,
      Chips.type.White
    );
    this.render();
  }

  static async _convertRed(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketConvertChipActor',
      this.document.id,
      Chips.type.Red
    );
    this.render();
  }

  static async _convertBlue(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketConvertChipActor',
      this.document.id,
      Chips.type.Blue
    );
    this.render();
  }

  static async _convertGreen(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketConvertChipActor',
      this.document.id,
      Chips.type.Green
    );
    this.render();
  }

  static async _convertTemporaryGreen(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketConvertChipActor',
      this.document.id,
      Chips.type.TemporaryGreen
    );
    this.render();
  }

  static async _consumeGreen(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketConsumeGreenChipActor',
      this.document.id
    );
    this.render();
  }

  static async _drawOne(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketDrawChipActor',
      this.document.id,
      1
    );
    this.render();
  }

  static async _drawThree(event, target) {
    event.preventDefault();
    event.stopPropagation();
    await game['deadlands-classic'].socket.executeAsGM(
      'socketDrawChipActor',
      this.document.id,
      3
    );
    this.render();
  }
}
