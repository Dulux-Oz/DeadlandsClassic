/* eslint-disable no-restricted-syntax */
import { dlcConstants } from '../constants.mjs';
import { DLCActorSheetBasev1 } from './actor-sheet-base-v1.mjs';

export class ActorSheetAdvancev1 extends DLCActorSheetBasev1 {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dlc', 'sheet', 'actor'],
      template:
        'systems/deadlands-classic/templates/v1apps/char-modify/character.html',
      width: 720,
      height: 800,
      closeOnSubmit: false,
      submitOnClose: false,
      submitOnChange: false,
      resizable: true,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'main',
        },
      ],
    });
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

  /** @override */
  async getData(options) {
    const context = await super.getData(options);

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
        ActorSheetAdvancev1.getConcentrationsAdjustment(value);

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
    const bountyRemaining = Math.max( 0, this.actor.system.careerBounty - context.bountyUsed);

    /* ----------------------------------------------------------------------
    | Second pass through the aptitudes, now that we have a figure for
    | bounty remaining, set the "can we afford to improve this
    | aptitude" booleans.
    +----------------------------------------------------------------------*/

    for (const key of Object.keys(aptitudes)) {
      const totalConcentrations = aptitudes[key].hasConfigConcentrations
        ? aptitudes[key].concentrations.length
        : 0;

      aptitudes[key].canAddConcentration =
        aptitudes[key].hasAvailable &&
        ((aptitudes[key].isNoRank && bountyRemaining >= 1) ||
          bountyRemaining >= 3);

      const processedKey = key.split(' ').join('');
      aptitudes[key].choiceName = `${processedKey}Choice`;

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
    return context;
  }

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.aptitude-control').click((ev) => this.#onAptitudeControl(ev));
    html.find('.trait-control').click((ev) => this.#onTraitControl(ev));
  }

  /**
   * Handle an aptitude improvement event
   * @private
   * @param {Event} event The originating mousedown event
   */
  async #onAptitudeControl(event) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.currentTarget;
    const actor = this.document.toObject(false);

    // eslint-disable-next-line default-case
    switch (btn.dataset.control) {
      case 'addConcentration':
        {
          const { id } = btn.dataset;

          const processedId = id.split(' ').join('');
          const choice = document.getElementsByName(`${processedId}Choice`)[0];

          const conc = choice.value;
          const isNoRank =
            actor.system[[id]].defaultRanks === 0 &&
            actor.system[[id]].startRanks === 0 &&
            actor.system[[id]].bountyRanks === 0;

          if (isNoRank) {
            actor.system[[id]].bountyRanks = 1;
          }

          actor.system[[id]].concentrations.push(conc);
          await this.document.update(actor, {});
        }
        break;

      case 'improveAptitude':
        {
          const { id } = btn.dataset;
          actor.system[[id]].bountyRanks += 1;
          await this.document.update(actor, {});
        }
        break;

      default:
      // No default case is necessary
    }
  }

  /**
   * Handle an aptitude improvement event
   * @private
   * @param {Event} event The originating mousedown event
   */
  async #onTraitControl(event) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.currentTarget;
    const actor = this.document.toObject(false);

    // eslint-disable-next-line default-case
    switch (btn.dataset.control) {
      case 'improveDieSize':
        {
          const { id } = btn.dataset;
          actor.system[[id]].bountyDieSize += 1;
          await this.document.update(actor, {});
        }
        break;

      case 'improveTraitRank':
        {
          const { id } = btn.dataset;
          actor.system[[id]].bountyRanks += 1;
          await this.document.update(actor, {});
        }
        break;

      default:
      // No default case is necessary
    }
  }
}
