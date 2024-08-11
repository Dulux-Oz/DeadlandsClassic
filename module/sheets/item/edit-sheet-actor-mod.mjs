/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */

import { dlcConfig } from '../../config.mjs';

const { api, sheets } = foundry.applications;

export class ActorModSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['dlc', 'sheet', 'item'],
    position: {
      width: 840,
      height: 800,
    },
    window: {
      resizable: true,
    },
    actions: {},
    form: {
      handler: this.#onSubmitActorModForm,
      submitOnChange: true,
    },
  };

  /** @override */
  static PARTS = {
    header: {
      template: 'systems/deadlands-classic/templates/actor-mod-edit/header.hbs',
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },

    configure: {
      template:
        'systems/deadlands-classic/templates/actor-mod-edit/configure.hbs',
    },
    blurb: {
      template: 'systems/deadlands-classic/templates/actor-mod-edit/blurb.hbs',
      scrollable: [''],
    },

    one: {
      template: 'systems/deadlands-classic/templates/actor-mod-edit/one.hbs',
      scrollable: [''],
    },
    two: {
      template: 'systems/deadlands-classic/templates/actor-mod-edit/two.hbs',
      scrollable: [''],
    },
    three: {
      template: 'systems/deadlands-classic/templates/actor-mod-edit/three.hbs',
      scrollable: [''],
    },
    four: {
      template: 'systems/deadlands-classic/templates/actor-mod-edit/four.hbs',
      scrollable: [''],
    },
    five: {
      template: 'systems/deadlands-classic/templates/actor-mod-edit/five.hbs',
      scrollable: [''],
    },
    capstone: {
      template:
        'systems/deadlands-classic/templates/actor-mod-edit/capstone.hbs',
      scrollable: [''],
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);

    // Not all parts always render
    options.parts = ['header', 'tabs', 'configure', 'blurb'];

    // Add any active sub-parts
    if (this.document.system.one.active) {
      options.parts.push('one');
    }
    if (this.document.system.two.active) {
      options.parts.push('two');
    }
    if (this.document.system.three.active) {
      options.parts.push('three');
    }
    if (this.document.system.four.active) {
      options.parts.push('four');
    }
    if (this.document.system.five.active) {
      options.parts.push('five');
    }
    if (this.document.system.capstone.active) {
      options.parts.push('capstone');
    }
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
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'configure';

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
        // Neither header nor tabs should be a selectable tab
        case 'header':
        case 'tabs':
          return tabs;

        case 'blurb':
          tab.id = 'blurb';
          tab.label += 'blurb';
          break;
        case 'capstone':
          tab.id = 'capstone';
          tab.label += 'capstone';
          break;
        case 'configure':
          tab.id = 'configure';
          tab.label += 'configure';
          break;

        case 'one':
          tab.id = 'one';
          tab.label += 'one';
          break;
        case 'two':
          tab.id = 'two';
          tab.label += 'two';
          break;
        case 'three':
          tab.id = 'three';
          tab.label += 'three';
          break;
        case 'four':
          tab.id = 'four';
          tab.label += 'four';
          break;
        case 'five':
          tab.id = 'five';
          tab.label += 'five';
          break;

        default:
      }

      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      // eslint-disable-next-line no-param-reassign
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  async _prepareContext(options) {
    const { isEditable } = this;

    const { grantsArcane, isArcane } = this.document.system;
    const showArcaneType = !!(grantsArcane || isArcane);

    const context = {
      cssClass: isEditable ? 'editable' : 'locked',
      editable: isEditable,
      limited: this.document.limited,
      name: this.document.name,
      options: this.options,
      owner: this.document.isOwner,
      system: this.item.system,
      title: this.title,
      img: this.document.img,
      showArcaneType,
      tabs: this._getTabs(options.parts),
      optionObj: dlcConfig.arcaneLabel,
    };

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'configure':
        context.tab = context.tabs[partId];
        break;

      case 'blurb':
        context.tab = context.tabs[partId];
        context.blurb = {
          field: this.document.system.schema.getField('blurb'),
          enriched: await TextEditor.enrichHTML(this.item.system.blurb, {
            async: true,
          }),
          value: this.document.system.blurb,
        };
        break;

      case 'one':
        context.tab = context.tabs[partId];
        context.one = {
          field: this.document.system.schema.getField('one.text'),
          enriched: await TextEditor.enrichHTML(this.item.system.one.text, {
            async: true,
          }),
          value: this.document.system.one.text,
        };
        break;

      case 'two':
        context.tab = context.tabs[partId];
        context.two = {
          field: this.document.system.schema.getField('two.text'),
          enriched: await TextEditor.enrichHTML(this.item.system.two.text, {
            async: true,
          }),
          value: this.document.system.two.text,
        };
        break;

      case 'three':
        context.tab = context.tabs[partId];
        context.three = {
          field: this.document.system.schema.getField('three.text'),
          enriched: await TextEditor.enrichHTML(this.item.system.three.text, {
            async: true,
          }),
          value: this.document.system.three.text,
        };
        break;

      case 'four':
        context.tab = context.tabs[partId];
        context.four = {
          field: this.document.system.schema.getField('four.text'),
          enriched: await TextEditor.enrichHTML(this.item.system.four.text, {
            async: true,
          }),
          value: this.document.system.four.text,
        };
        break;

      case 'five':
        context.tab = context.tabs[partId];
        context.five = {
          field: this.document.system.schema.getField('five.text'),
          enriched: await TextEditor.enrichHTML(this.item.system.five.text, {
            async: true,
          }),
          value: this.document.system.five.text,
        };
        break;

      case 'capstone':
        context.tab = context.tabs[partId];
        context.capstone = {
          field: this.document.system.schema.getField('capstone.text'),
          enriched: await TextEditor.enrichHTML(
            this.item.system.capstone.text,
            {
              async: true,
            }
          ),
          value: this.document.system.capstone.text,
        };
        break;

      default:
    }
    return context;
  }

  /**
   * Process form submission for the sheet, removing overrides created by active effects
   * @this {NewDlcActorSheet}                The handler is called with the application as its bound scope
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {FormDataExtended} formData           Processed data for the submitted form
   * @returns {Promise<void>}
   */
  static async #onSubmitActorModForm(event, form, formData) {
    const submitData = this._prepareSubmitData(event, form, formData);
    // const overrides = foundry.utils.flattenObject(this.actor.overrides);
    // for (const k of Object.keys(overrides)) delete submitData[k];
    await this.document.update(submitData);
  }
}
