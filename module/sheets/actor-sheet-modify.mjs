/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import { dlcConstants } from '../constants.mjs';
import { DLCActorSheetBase } from './actor-sheet-base.mjs';

const { api } = foundry.applications;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export class ActorSheetModify extends api.HandlebarsApplicationMixin(
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
      addConcentration: this._addConcentration,
      decreaseDieSize: this._decreaseDieSize,
      decreaseTraitRank: this._decreaseTraitRank,
      decreaseAptitude: this._decreaseAptitude,
      increaseAptitude: this._increaseAptitude,
      increaseDieSize: this._increaseDieSize,
      increaseTraitRank: this._increaseTraitRank,
      removeConcentration: this._removeConcentration,
    },
    // Custom property that's merged into `this.options`
    form: {
      closeOnSubmit: false,
      submitOnClose: false,
      submitOnChange: false,
      resizable: true,
    },
  };

  /** @override */
  static PARTS = {
    header: {
      template: 'systems/deadlands-classic/templates/char-modify/header.hbs',
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    traits: {
      template: 'systems/deadlands-classic/templates/char-modify/traits.hbs',
      scrollable: [''],
    },
    aptitudes: {
      template: 'systems/deadlands-classic/templates/char-modify/aptitudes.hbs',
      scrollable: [''],
    },
    charMod: {
      template: 'systems/deadlands-classic/templates/char-modify/charMod.hbs',
      scrollable: [''],
    },
    edges: {
      template: 'systems/deadlands-classic/templates/char-modify/edges.hbs',
      scrollable: [''],
    },
    hindrances: {
      template:
        'systems/deadlands-classic/templates/char-modify/hindrances.hbs',
      scrollable: [''],
    },
    spelllikes: {
      template:
        'systems/deadlands-classic/templates/char-modify/spelllikes.hbs',
      scrollable: [''],
    },
  };

  /**
   * Generates the data for the generic tab navigation template
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getTabs() {
    // Default tab for first time it's rendered this session
    if (!this.tabGroups.primary) this.tabGroups.primary = 'traits';

    const activateaptitudes = this.tabGroups.primary === 'aptitudes';
    const activatecharMod = this.tabGroups.primary === 'charMod';
    const activatetraits = this.tabGroups.primary === 'traits';

    const tabs = {
      traits: {
        cssClass: activatetraits ? 'active' : '',
        group: 'primary',
        id: 'traits',
        label: 'DLC.tab.create-traits',
      },
      aptitudes: {
        cssClass: activateaptitudes ? 'active' : '',
        group: 'primary',
        id: 'aptitudes',
        label: 'DLC.tab.create-aptitudes',
      },
      charMod: {
        cssClass: activatecharMod ? 'active' : '',
        group: 'primary',
        id: 'charMod',
        label: 'DLC.tab.create-charMod',
      },
    };

    return tabs;
  }

  /**
   * Generates the data for the secondary tab navigation template
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getSecondaryTabs() {
    // Default tab for first time it's rendered this session
    if (!this.tabGroups.secondary) this.tabGroups.secondary = 'edges';

    const activateedges =
      this.tabGroups.primary === 'charMod' &&
      this.tabGroups.secondary === 'edges';
    const activatehindrances =
      this.tabGroups.primary === 'charMod' &&
      this.tabGroups.secondary === 'hindrances';
    const activatespelllike =
      this.tabGroups.primary === 'charMod' &&
      this.tabGroups.secondary === 'spelllikes';

    const secondaryTabs = {
      edges: {
        cssClass: activateedges ? 'active' : '',
        group: 'secondary',
        id: 'edges',
        label: 'DLC.tab.create-edges',
      },
      hindrances: {
        cssClass: activatehindrances === 'hindrances' ? 'active' : '',
        group: 'secondary',
        id: 'hindrances',
        label: 'DLC.tab.create-hindrances',
      },
      spelllikes: {
        cssClass: activatespelllike ? 'active' : '',
        group: 'secondary',
        id: 'spelllikes',
        label: 'DLC.tab.create-spelllikes',
      },
    };

    return secondaryTabs;
  }

  // prettier-ignore
  changeTab(tab, group, { event, navElement, force = false, updatePosition = true } = {}) {
    if (group === 'primary' && tab === 'charMod') {
      const content = this.hasFrame
        ? this.element.querySelector('.window-content')
        : this.element;

        for (const section of content.querySelectorAll(`.tab[data-group="secondary"]`)) {
          section.classList.toggle('active', section.dataset.tab === this.tabGroups.secondary);
        }
    }

    super.changeTab(tab, group, { event, navElement, force, updatePosition });
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'aptitudes':
      case 'traits':
      case 'charMod':
        context.tab = context.tabs[partId];
        break;
      case 'edges':
      case 'hindrances':
      case 'spelllikes':
        context.tab = context.secondaryTabs[partId];
        break;
      default:
    }
    return context;
  }

  /*--------------------------------------------------------------------------
  | If the aptitude has any concentrations, calculate how much (if anything)
  | they cost in bounty.
  +-------------------------------------------------------------------------*/

  static getConcentrationsAdjustment(aptitude) {
    if (!aptitude.hasConcentrations) {
      return 0;
    }

    const { startConcentrations } = aptitude;
    const { length: totalConcentrations } = aptitude.concentrations;

    /*-----------------------------------------------------------------------
    | The first concentration is free, i.e. costs neither bounty nor aptitude
    | points. If there are any start concentrations then all of them are free
    | in terms of bounty cost.
    +-----------------------------------------------------------------------*/

    const adjustment = startConcentrations !== 0 ? startConcentrations : 1;

    // Concentrations (after the first) bought with bounty cost 3 each.
    return Math.max(0, totalConcentrations - adjustment) * 3;
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options);

    const { aptitudes, traits } = context;

    /*------------------------------------------------------------------------
    | First pass through the aptitudes, calculate how much bounty each has
    | used, what the next level for it will be, how much that will cost.
    | Also calculate the total global bounty used (context.bountyUsed).
    +-----------------------------------------------------------------------*/

    context.bountyUsed = 0;

    for (const key of Object.keys(aptitudes)) {
      const value = aptitudes[key];

      /*----------------------------------------------------------------------
      | Calculate bounty spent on this aptitude so far and the amount for its
      | next improvement.
      |
      | fromCreation: The number of ranks from the creation process. Note,
      |               for the bounty calculation we discount default ranks
      |               since they increase the rank without increasing the
      |               cost.
      |
      | start:        The number to start calculating from. Is one greater
      |               than the ranks from the character creation process.
      |
      | total:        The total number of ranks the character currently has.
      |
      | length:       How long to make the levels to process array.
      |
      | multiplier:   When the level being processed is a multiple of five
      |               then Increment the multiplier. 1–5 = 1; 6–10 = 2; 
      |               etc.
      +--------------------------------------------------------------------*/

      const fromCreation = value.startRanks;

      const start = fromCreation + 1;

      const length = value.bountyRanks;
      let multiplier = fromCreation === 5 ? 2 : 1;

      // prettier-ignore
      const levelsToProcess = Array.from({ length }, (_, index) => start + index);

      const bountyForRanks = levelsToProcess.reduce(
        (accumulator, currentValue) => {
          const accumulation = accumulator + currentValue * multiplier;
          multiplier += currentValue % 5 === 0 ? 1 : 0;
          return accumulation;
        },
        0
      );

      aptitudes[key].aptitudeBounty =
        bountyForRanks +
        value.bountyAdjustment +
        ActorSheetModify.getConcentrationsAdjustment(value);

      // update the total for the actor
      context.bountyUsed += aptitudes[key].aptitudeBounty;

      aptitudes[key].next = fromCreation + value.bountyRanks + 1;
      aptitudes[key].nextBounty = aptitudes[key].next * multiplier;
      aptitudes[key].isNoRank =
        value.startRanks === 0 && value.bountyRanks === 0;
    }

    /*------------------------------------------------------------------------
    | First pass through the traits, calculate how many bounty points
    | each has used, what the next level for it will be, how much that will
    | cost. Also calculate the bounty points used total.
    +-----------------------------------------------------------------------*/

    for (const key of Object.keys(traits)) {
      const trait = traits[key];

      let length = trait.bountyDieSize;
      let start = trait.cardDieSize + trait.startDieSize + 1;
      const sizeArray = Array.from({ length }, (_, index) => start + index);

      const dieSizePoints = sizeArray.reduce(
        (accumulator, currentValue) =>
          accumulator + dlcConstants.DieSizePointMultiplier * currentValue,
        0
      );

      length = trait.bountyRanks;
      start = trait.cardRanks + trait.startRanks + 1;
      const rankArray = Array.from({ length }, (_, index) => start + index);

      const dieRankPoints = rankArray.reduce(
        (accumulator, currentValue) =>
          accumulator + dlcConstants.DieRankPointMultiplier * currentValue,
        0
      );

      // Update the total bounty points for the actor.

      const bountyPoints = dieSizePoints + dieRankPoints;
      context.bountyUsed += bountyPoints;

      traits[key].bountyPoints = bountyPoints;
    }

    // prettier-ignore
    const bountyRemaining = Math.max( 0, this.document.system.careerBounty - context.bountyUsed);

    /* ----------------------------------------------------------------------
    | Second pass through the aptitudes, now that we have a figure for
    | bounty remaining, set the "can we afford to improve this
    | aptitude" booleans.
    +----------------------------------------------------------------------*/

    for (const key of Object.keys(aptitudes)) {
      aptitudes[key].label = key;

      aptitudes[key].canAddConcentration =
        aptitudes[key].hasAvailable &&
        ((aptitudes[key].isNoRank && bountyRemaining >= 1) ||
          bountyRemaining >= 3);

      aptitudes[key].canRemoveConcentration =
        aptitudes[key].hasConcentrations &&
        aptitudes[key].concentrations.length > 0 &&
        aptitudes[key].concentrations.length -
          aptitudes[key].startConcentrations >
          0;

      aptitudes[key].canRemoveRanks = aptitudes[key].bountyRanks > 0;

      const processedKey = key.split(' ').join('');
      aptitudes[key].choiceName = `${processedKey}Choice`;

      const totalConcentrations = aptitudes[key].hasConfigConcentrations
        ? aptitudes[key].concentrations.length
        : 0;

      aptitudes[key].canIncreaseAptitudeRank =
        ((aptitudes[key].hasAvailable && totalConcentrations !== 0) ||
          !aptitudes[key].hasAvailable) &&
        aptitudes[key].nextBounty <= bountyRemaining;

      aptitudes[key].canDecreaseAptitudeRank = aptitudes[key].bountyRanks > 0;
    }

    /*-----------------------------------------------------------------------
    | Second pass through the traits, calculate whether we can improve this
    | trait, set the can improve booleans for each trait.
    +----------------------------------------------------------------------*/

    // prettier-ignore
    for (const key of Object.keys(traits)) {
      const trait = traits[key];

      const dieSize = trait.cardDieSize + trait.startDieSize + trait.bountyDieSize;
      const traitRank = trait.cardRanks + trait.startRanks + trait.bountyRanks;

      traits[key].dieSizeImprovementIsPossible = dieSize < dlcConstants.MaxDieSize;
      traits[key].dieRankImprovementIsPossible = traitRank < dlcConstants.MaxTraitRank;

      traits[key].dieSizeRegressionIsPossible = trait.bountyDieSize > 0;
      traits[key].dieRankRegressionIsPossible = trait.bountyRanks   > 0;

      traits[key].nextDie     = dieSize + 1;
      traits[key].nextDieCost = traits[key].nextDie * dlcConstants.DieSizePointMultiplier;

      traits[key].nextRank     = traitRank + 1;
      traits[key].nextRankCost = traits[key].nextRank * dlcConstants.DieRankPointMultiplier;

      traits[key].canIncreaseDieSize =
        traits[key].dieSizeImprovementIsPossible &&
        traits[key].nextDieCost <= bountyRemaining;

      traits[key].canDecreaseDieSize =
        traits[key].dieSizeRegressionIsPossible;

      traits[key].canIncreaseTraitRank =
        traits[key].dieRankImprovementIsPossible &&
        traits[key].nextRankCost <= bountyRemaining;

      traits[key].canDecreaseTraitRank =
        traits[key].dieRankRegressionIsPossible;
    }

    context.bountyRemaining = bountyRemaining;
    context.showBountyRemaining = bountyRemaining > 0;

    context = foundry.utils.mergeObject(context, {
      tabs: this._getTabs(options.parts),
      secondaryTabs: this._getSecondaryTabs(),
    });

    return context;
  }

  /* ----------------------------------------------------------------------*/
  /* Actions                                                               */
  /* ----------------------------------------------------------------------*/

  static async _addConcentration(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    const processedId = id.split(' ').join('');
    const choice = document.getElementsByName(`${processedId}Choice`)[0];

    const conc = choice.value;

    if (
      actor.system[[id]].defaultRanks < 1 &&
      actor.system[[id]].startRanks < 1 &&
      actor.system[[id]].bountyRanks < 1
    ) {
      actor.system[[id]].bountyRanks += 1;
    }

    actor.system[[id]].concentrations.push(conc);
    await this.document.update(actor, {});
  }

  static async _decreaseAptitude(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    actor.system[[id]].bountyRanks -= 1;
    await this.document.update(actor, {});
  }

  static async _decreaseDieSize(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    actor.system[[id]].bountyDieSize -= 1;
    await this.document.update(actor, {});
  }

  static async _decreaseTraitRank(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    actor.system[[id]].bountyRanks -= 1;
    await this.document.update(actor, {});
  }

  static async _increaseAptitude(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    actor.system[[id]].bountyRanks += 1;
    await this.document.update(actor, {});
  }

  static async _increaseDieSize(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    actor.system[[id]].bountyDieSize += 1;
    await this.document.update(actor, {});
  }

  static async _increaseTraitRank(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    actor.system[[id]].bountyRanks += 1;
    await this.document.update(actor, {});
  }

  static async _removeConcentration(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const actor = this.document.toObject(false);

    const btn = event.target;
    const { id, item } = btn.dataset;

    actor.system[[id]].concentrations.splice(item, 1);

    await this.document.update(actor, {});
  }
}
