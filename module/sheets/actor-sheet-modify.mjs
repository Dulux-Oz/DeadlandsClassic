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
      improveAptitude: this._improveAptitude,
      improveDieSize: this._improveDieSize,
      improveTraitRank: this._improveTraitRank,
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
    edges: {
      template: 'systems/deadlands-classic/templates/char-modify/edges.hbs',
      scrollable: [''],
    },
  };

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

      aptitudes[key].canRemoveRanks = aptitudes[key].startRanks > 0;

      const processedKey = key.split(' ').join('');
      aptitudes[key].choiceName = `${processedKey}Choice`;

      const totalConcentrations = aptitudes[key].hasConfigConcentrations
        ? aptitudes[key].concentrations.length
        : 0;

      aptitudes[key].canImprove =
        ((aptitudes[key].hasAvailable && totalConcentrations !== 0) ||
          !aptitudes[key].hasAvailable) &&
        aptitudes[key].nextBounty <= bountyRemaining;
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

      traits[key].canImproveDieSize =
        traits[key].dieSizeImprovementIsPossible &&
        traits[key].nextDieCost <= bountyRemaining;

      traits[key].canImproveTraitRank =
        traits[key].dieRankImprovementIsPossible &&
        traits[key].nextRankCost <= bountyRemaining;
    }

    context.bountyRemaining = bountyRemaining;
    context.showBountyRemaining = bountyRemaining > 0;

    context = foundry.utils.mergeObject(context, {
      tabs: this._getTabs(options.parts),
    });

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'aptitudes':
      case 'edges':
      case 'traits':
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
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'traits';

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
          tab.label += 'modify-aptitudes';
          break;
        case 'edges':
          tab.id = 'edges';
          tab.label += 'modify-edges';
          break;
        case 'traits':
          tab.id = 'traits';
          tab.label += 'modify-traits';
          break;
        default:
      }

      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      // eslint-disable-next-line no-param-reassign
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

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

  static async _improveAptitude(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    actor.system[[id]].bountyRanks += 1;
    await this.document.update(actor, {});
  }

  static async _improveDieSize(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    actor.system[[id]].bountyDieSize += 1;
    await this.document.update(actor, {});
  }

  static async _improveTraitRank(event, target) {
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

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    const processedId = id.split(' ').join('');
    const choice = document.getElementsByName(`${processedId}Choice`)[0];

    const conc = choice.value;

    await this.document.update(actor, {});
  }
}
