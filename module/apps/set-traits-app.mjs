/* eslint-disable no-underscore-dangle */
import { dlcConfig } from '../config.mjs';
import { TraitCards } from '../helpers/traitcards.mjs';

export class SetTraitsApp extends DocumentSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      height: 500,
      width: 550,
      template:
        'systems/deadlands-classic/templates/char-create/trait-app.html',
      dragDrop: [
        { dragSelector: '.traitOptionItem', dropSelector: '.traitInput' },
      ],
      closeOnSubmit: true,
      submitOnClose: false,
      submitOnChange: false,
      resizable: true,
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  get title() {
    return this.actor.isToken ? `[Token] ${this.actor.name}` : this.actor.name;
  }

  /* -------------------------------------------- */

  /**
   * A convenience reference to the Actor document
   * @type {Actor}
   */
  get actor() {
    return this.object;
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /** @inheritdoc */
  async close(options) {
    this.options.token = null;
    return super.close(options);
  }

  /* -------------------------------------------- */

  /** @override */
  async getData(options) {
    const context = super.getData(options);

    const actData = { ...this.actor };

    const traitCards = TraitCards.fromString(this.actor.system.cards);
    context.cards = traitCards.cards;

    if (this.actor.SettingTraits === undefined) {
      this.actor.SettingTraits = true;

      // Create and initialise Form traits
      // prettier-ignore
      this.actor.UpdatingTraits = {
        Cognition:  this.actor.system.Cognition.card   ?? 12,
        Deftness:   this.actor.system.Deftness.card    ?? 12,
        Knowledge:  this.actor.system.Knowledge.card   ?? 12,
        Mien:       this.actor.system.Mien.card        ?? 12,
        Nimbleness: this.actor.system.Nimbleness.card  ?? 12,
        Quickness:  this.actor.system.Quickness.card   ?? 12,
        Smarts:     this.actor.system.Smarts.card      ?? 12,
        Spirit:     this.actor.system.Spirit.card      ?? 12,
        Strength:   this.actor.system.Strength.card    ?? 12,
        Vigor:      this.actor.system.Vigor.card       ?? 12,
      };

      // make sure the backup for custom exists and is populated with sane values.
      this.actor.customTraits = { ...this.actor.UpdatingTraits };

      this.actor.archtypeSelected = 'custom';

      this.checkConsistency(this.actor.UpdatingTraits);
    }

    // prettier-ignore
    context.traits = {
      Cognition:  context.cards[this.actor.UpdatingTraits.Cognition],
      Deftness:   context.cards[this.actor.UpdatingTraits.Deftness],
      Knowledge:  context.cards[this.actor.UpdatingTraits.Knowledge],
      Mien:       context.cards[this.actor.UpdatingTraits.Mien],
      Nimbleness: context.cards[this.actor.UpdatingTraits.Nimbleness],
      Quickness:  context.cards[this.actor.UpdatingTraits.Quickness],
      Smarts:     context.cards[this.actor.UpdatingTraits.Smarts],
      Spirit:     context.cards[this.actor.UpdatingTraits.Spirit],
      Strength:   context.cards[this.actor.UpdatingTraits.Strength],
      Vigor:      context.cards[this.actor.UpdatingTraits.Vigor],
    };

    context.traitsChosen = this.actor.allTraitsChosen;
    context.mandatoryUsed = this.actor.allMandatoryUsed;
    context.validForm = context.traitsChosen && context.mandatoryUsed;

    context.optionObj = dlcConfig.archtypeChoices;

    context.archtypeSelected = this.actor.archtypeSelected;

    return context;
  }

  /* -------------------------------------------- */

  checkConsistency(data) {
    const newVals = {};

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key of Object.keys(this.actor.UpdatingTraits)) {
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
    const mandatory = TraitCards.fromString(this.actor.system.cards)?.mandatory;

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
          this.actor.UpdatingTraits[key] = i;

          // If more than one trait has been assigned the same card number
        } else {
          for (let j = 0; j < newVals[i].length; j += 1) {
            const key = newVals[i][j];

            // if this is new, update the form's source data
            if (this.actor.UpdatingTraits[key] !== i) {
              this.actor.UpdatingTraits[key] = i;

              // otherwise clear the existing value (it has been set)
            } else {
              this.actor.UpdatingTraits[key] = 12;
            }
          }
        }
      }
    }

    this.actor.allTraitsChosen = cardsUsed === 10;
    this.actor.allMandatoryUsed = mandatoryUsed === mandatory;
  }

  traitsFromArchtype(data) {
    if (data.archtypeSelected === 'custom') {
      this.actor.UpdatingTraits = { ...this.actor.customTraits };
    } else {
      // If we're moving from custom, store the current data
      if (this.actor.archtypeSelected === 'custom') {
        this.actor.customTraits = { ...this.actor.UpdatingTraits };
      }

      const traitCards = TraitCards.fromString(this.actor.system.cards);
      const priorityList = dlcConfig.archtypes[data.archtypeSelected].traits;

      priorityList.forEach((element, rank) => {
        this.actor.UpdatingTraits[element] = traitCards.rankToIndex(rank);
      });
    }

    this.actor.archtypeSelected = data.archtypeSelected;
  }

  /**
   * Handle changes to an input element, submitting the form if options.submitOnChange is true.
   * Do not preventDefault in this handler as other interactions on the form may also be occurring.
   * @param {Event} event  The initial change event
   * @protected
   */
  // eslint-disable-next-line class-methods-use-this
  async _onChangeInput(event) {
    // Do not fire change listeners for form inputs inside text editors.
    if (event.currentTarget.closest('.editor')) return;

    const data = this._getSubmitData();

    if (data.archtypeSelected !== this.actor.archtypeSelected) {
      this.traitsFromArchtype(data);
      this.checkConsistency(this.actor.UpdatingTraits);
    } else {
      this.checkConsistency(data);
    }

    this.render();
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    html.on('change', 'input,select,textarea', this._onChangeInput.bind(this));
  }

  /**
   * This method is called upon form submission after form data is validated
   * @param {Event} event       The initial triggering submission event
   * @param {object} formData   The object of validated form data with which to update the object
   * @returns {Promise}         A Promise which resolves once the update operation has completed
   * @abstract
   */
  async _updateObject(event, formData) {
    const traitCards = TraitCards.fromString(this.actor.system.cards);

    const updateData = this.actor.toObject();
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
      const index = this.actor.UpdatingTraits[trait];
      const card = traitCards.cardByIndex(index);

      updateData.system[trait].card = index;
      updateData.system[trait].startRanks = card.dieNum;
      updateData.system[trait].startDieSize = card.die;
      updateData.system[trait].ranks = card.dieNum;
      updateData.system[trait].dieSize = card.die;
    });

    this.actor.SettingTraits = undefined;
    this.actor.UpdatingTraits = {};
    this.actor.customTraits = { ...this.actor.UpdatingTraits };
    this.actor.archtypeSelected = undefined;

    this.actor.update(updateData);
  }

  _canDragStart(selector) {
    return this.isEditable;
  }

  _canDragDrop(selector) {
    return this.isEditable;
  }

  // eslint-disable-next-line class-methods-use-this
  _onDragStart(event) {
    const target = event.currentTarget;
    const li = target.closest('.traitOptionItem');
    const { index } = li.dataset;

    const dragData = { type: 'TraitCard', index };

    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

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
    const target = event.currentTarget;
    const li = target.closest('.traitInput');
    const { trait } = li.dataset;
    const { index: strInx } = data;

    const index = Math.floor(strInx);

    // prettier-ignore
    const current = {
      Cognition:  this.actor.UpdatingTraits.Cognition,
      Deftness:   this.actor.UpdatingTraits.Deftness,
      Knowledge:  this.actor.UpdatingTraits.Knowledge,
      Mien:       this.actor.UpdatingTraits.Mien,
      Nimbleness: this.actor.UpdatingTraits.Nimbleness,
      Quickness:  this.actor.UpdatingTraits.Quickness,
      Smarts:     this.actor.UpdatingTraits.Smarts,
      Spirit:     this.actor.UpdatingTraits.Spirit,
      Strength:   this.actor.UpdatingTraits.Strength,
      Vigor:      this.actor.UpdatingTraits.Vigor,
    };

    current[trait] = index;

    this.checkConsistency(current);

    this.render();
  }
}
