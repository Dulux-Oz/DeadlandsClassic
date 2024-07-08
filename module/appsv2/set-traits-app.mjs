/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line max-classes-per-file
import { dlcConfig } from '../config.mjs';
import { TraitCards } from '../helpers/traitcards.mjs';

const { HandlebarsApplicationMixin } = foundry.applications.api;

const { sheets } = foundry.applications;

export class SetTraits extends HandlebarsApplicationMixin(sheets.ActorSheetV2) {
  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
  }

  static DEFAULT_OPTIONS = {
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: '.traitInput' }],
    tag: 'form',
    form: {
      closeOnSubmit: true,
      submitOnClose: false,
      submitOnChange: false,
      handler: SetTraits.formHandler,
    },
    scrollY: ['.directory-list'],
    window: {
      icon: '',
      title: '',
      resizable: true,
    },
  };

  static PARTS = {
    form: {
      template:
        'systems/deadlands-classic/templates/char-cards/trait-create.hbs',
      scrollable: [''],
    },
  };

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    const traitCards = TraitCards.fromString(this.document.system.cards);
    context.cards = traitCards.cards;

    if (this.document.SettingTraits === undefined) {
      this.document.SettingTraits = true;

      // Create and initialise Form traits
      // prettier-ignore
      this.document.UpdatingTraits = {
        Cognition:  this.document.system.Cognition.card   ?? 12,
        Deftness:   this.document.system.Deftness.card    ?? 12,
        Knowledge:  this.document.system.Knowledge.card   ?? 12,
        Mien:       this.document.system.Mien.card        ?? 12,
        Nimbleness: this.document.system.Nimbleness.card  ?? 12,
        Quickness:  this.document.system.Quickness.card   ?? 12,
        Smarts:     this.document.system.Smarts.card      ?? 12,
        Spirit:     this.document.system.Spirit.card      ?? 12,
        Strength:   this.document.system.Strength.card    ?? 12,
        Vigor:      this.document.system.Vigor.card       ?? 12,
      };

      // make sure the backup for custom exists and is populated with sane values.
      this.document.customTraits = { ...this.document.UpdatingTraits };

      this.document.archtypeSelected = 'custom';

      this.checkConsistency(this.document.UpdatingTraits);
    }

    // prettier-ignore
    context.traits = {
      Cognition:  context.cards[this.document.UpdatingTraits.Cognition],
      Deftness:   context.cards[this.document.UpdatingTraits.Deftness],
      Knowledge:  context.cards[this.document.UpdatingTraits.Knowledge],
      Mien:       context.cards[this.document.UpdatingTraits.Mien],
      Nimbleness: context.cards[this.document.UpdatingTraits.Nimbleness],
      Quickness:  context.cards[this.document.UpdatingTraits.Quickness],
      Smarts:     context.cards[this.document.UpdatingTraits.Smarts],
      Spirit:     context.cards[this.document.UpdatingTraits.Spirit],
      Strength:   context.cards[this.document.UpdatingTraits.Strength],
      Vigor:      context.cards[this.document.UpdatingTraits.Vigor],
    };

    context.traitsChosen = this.document.allTraitsChosen;
    context.mandatoryUsed = this.document.allMandatoryUsed;
    context.validForm = context.traitsChosen && context.mandatoryUsed;

    context.optionObj = dlcConfig.archtypeChoices;

    context.archtypeSelected = this.document.archtypeSelected;

    return context;
  }

  /* -------------------------------------------- */

  checkConsistency(data) {
    const newVals = {};

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key of Object.keys(this.document.UpdatingTraits)) {
      if (dlcConfig.traits.includes(key)) {
        const value = data[key];

        // 12 is the blank card
        if (value !== undefined && value >= 0 && value <= 12) {
          if (newVals[value] === undefined) {
            newVals[value] = [];
          }
          newVals[value].push(key);
        }
      }
    }

    // How many of the trait card must be used.
    const mandatory = TraitCards.fromString(
      this.document.system.cards
    )?.mandatory;

    let cardsUsed = 0;
    let mandatoryUsed = 0;

    // don't process 12 as it is the blank card.
    for (let i = 0; i < 12; i += 1) {
      if (newVals[i]?.length >= 1) {
        cardsUsed += 1;

        if (i < mandatory) {
          mandatoryUsed += 1;
        }

        if (newVals[i]?.length === 1) {
          const key = newVals[i][0];
          this.document.UpdatingTraits[key] = i;

          // If more than one trait has been assigned the same card number
        } else {
          for (let j = 0; j < newVals[i].length; j += 1) {
            const key = newVals[i][j];

            // if this is new, update the form's source data
            if (this.document.UpdatingTraits[key] !== i) {
              this.document.UpdatingTraits[key] = i;

              // otherwise clear the existing value (it has been set)
            } else {
              this.document.UpdatingTraits[key] = 12;
            }
          }
        }
      }
    }

    this.document.allTraitsChosen = cardsUsed === 10;
    this.document.allMandatoryUsed = mandatoryUsed === mandatory;
  }

  /**
   * This method sets the traits from the cars drawn and the archtype selected
   * @param {selected}   The archtype chosen
   */
  traitsFromArchtype(chosen) {
    if (chosen === 'custom') {
      this.document.UpdatingTraits = { ...this.document.customTraits };
    } else {
      // If we're moving from custom, store the current data
      if (this.document.archtypeSelected === 'custom') {
        this.document.customTraits = { ...this.document.UpdatingTraits };
      }

      const traitCards = TraitCards.fromString(this.document.system.cards);
      const priorityList = dlcConfig.archtypes[chosen].traits;

      priorityList.forEach((element, rank) => {
        this.document.UpdatingTraits[element] = traitCards.rankToIndex(rank);
      });
    }

    this.document.archtypeSelected = chosen;
  }

  /* --------------------------------------------
   * Add Listeners
   * -------------------------------------------- */

  /**
   * Process form submission for the sheet
   * @this {MyApplication}                      The handler is called with the application as its bound scope
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {FormDataExtended} formData           Processed data for the submitted form
   * @returns {Promise<void>}
   */
  static async formHandler(event, form, formData) {
    const traitCards = TraitCards.fromString(this.document.system.cards);

    const updateData = this.document.toObject();
    const traits = [
      'Cognition',
      'Deftness',
      'Knowledge',
      'Mien',
      'Nimbleness',
      'Quickness',
      'Smarts',
      'Spirit',
      'Strength',
      'Vigor',
    ];

    traits.forEach((trait) => {
      const index = this.document.UpdatingTraits[trait];
      const card = traitCards.cardByIndex(index);

      updateData.system[trait].card = index;

      updateData.system[trait].cardRanks = card.dieNum;
      updateData.system[trait].cardDieSize = Math.floor(card.die / 2); // store d4 as 2, d6 as 3, etc.

      updateData.system[trait].startRanks = 0;
      updateData.system[trait].startDieSize = 0;

      updateData.system[trait].bountyRanks = 0;
      updateData.system[trait].bountyDieSize = 0;
    });

    this.document.SettingTraits = undefined;
    this.document.UpdatingTraits = {};
    this.document.customTraits = { ...this.document.UpdatingTraits };
    this.document.archtypeSelected = undefined;

    this.document.update(updateData);
  }

  /* --------------------------------------------
   * Drag and Drop
   * -------------------------------------------- */

  _getCardTargets() {
    const traits = this.element.querySelectorAll('.traitInput');
    const data = {};

    for (const input of traits) {
      const { trait } = input.dataset;
      data[trait] = input.value;
    }

    return data;
  }

  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element));
    // You may want to add other special handling here
    // Foundry comes with a large number of utility classes, e.g. SearchFilter
    // That you may want to implement yourself.

    const selects = document.getElementsByTagName('select');

    const archypteSelected = selects[1];

    archypteSelected.addEventListener('change', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const selected = e.target.value;

      if (selected !== this.document.archtypeSelected) {
        this.traitsFromArchtype(selected);
        this.checkConsistency(this.document.UpdatingTraits);
      } else {
        this.checkConsistency(this._getCardTargets());
      }
      this.render();
    });
  }

  // ------------------------------------------------------------------------
  // The following pieces set up drag handling and are unlikely to need
  // modification
  // ------------------------------------------------------------------------

  /**
   * Returns an array of DragDrop instances
   * @type {DragDrop[]}
   */
  get dragDrop() {
    return this.#dragDrop;
  }

  // This is marked as private because there's no real need
  // for subclasses or external hooks to mess with it directly
  #dragDrop;

  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
   */
  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new DragDrop(d);
    });
  }

  _canDragStart(selector) {
    return this.isEditable;
  }

  _canDragDrop(selector) {
    return this.isEditable;
  }

  // eslint-disable-next-line class-methods-use-this
  _onDragStart(event) {
    const { target } = event;
    const li = target.closest('.traitOptionItem');
    const { index } = li.dataset;

    const dragData = { type: 'TraitCard', index };

    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  // eslint-disable-next-line class-methods-use-this
  _onDragOver(event) {}

  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);

    switch (data.type) {
      case 'TraitCard':
        this._onDropTraitCard(event, data);
        break;
      default:
    }
  }

  async _onDropTraitCard(event, data) {
    // Get the trait the card was dropped on
    const { target } = event;
    const li = target.closest('.traitInput');
    const { trait } = li.dataset;
    const { index: strInx } = data;

    const index = Math.floor(strInx);

    // prettier-ignore
    const current = {
      Cognition:  this.document.UpdatingTraits.Cognition,
      Deftness:   this.document.UpdatingTraits.Deftness,
      Knowledge:  this.document.UpdatingTraits.Knowledge,
      Mien:       this.document.UpdatingTraits.Mien,
      Nimbleness: this.document.UpdatingTraits.Nimbleness,
      Quickness:  this.document.UpdatingTraits.Quickness,
      Smarts:     this.document.UpdatingTraits.Smarts,
      Spirit:     this.document.UpdatingTraits.Spirit,
      Strength:   this.document.UpdatingTraits.Strength,
      Vigor:      this.document.UpdatingTraits.Vigor,
    };

    current[trait] = index;

    this.checkConsistency(current);

    this.render();
  }
}
