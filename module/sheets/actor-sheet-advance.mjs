/* eslint-disable no-restricted-syntax */
import { DLCActorSheetBase } from './actor-sheet-base.mjs';

export class ActorSheetAdvance extends DLCActorSheetBase {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dlc', 'sheet', 'actor'],
      template:
        'systems/deadlands-classic/templates/char-modify/character.html',
      width: 660,
      height: 800,
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

    const { aptitudes } = context;

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
      const total = fromCreation + value.ranks;

      const length = value.ranks;
      let multiplier = start === 5 ? 2 : 1;

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
        ActorSheetAdvance.getConcentrationsAdjustment(value);

      // update the total for the actor
      context.bountyUsed += aptitudes[key].aptitudeBounty;

      aptitudes[key].next = total + 1;
      aptitudes[key].nextBounty = aptitudes[key].next * multiplier;
      aptitudes[key].isNoRank = value.startRanks === 0 && value.ranks === 0;
    }

    // prettier-ignore
    context.bountyRemaining = Math.max( 0, this.actor.system.careerBounty - context.bountyUsed);

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
        ((aptitudes[key].isNoRank && context.bountyRemaining >= 1) ||
          context.bountyRemaining >= 3);

      aptitudes[key].canImprove =
        ((aptitudes[key].hasAvailable && totalConcentrations !== 0) ||
          !aptitudes[key].hasAvailable) &&
        aptitudes[key].nextBounty <= context.bountyRemaining;

      aptitudes[key].choiceName = `${key}Choice`;
    }

    context.showBountyRemaining = context.bountyRemaining > 0;
    return context;
  }

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    // chip control
    html.find('.aptitude-control').click((ev) => this.#onAptitudeControl(ev));
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
      case 'improveAptitude':
        {
          const { id } = btn.dataset;
          actor.system[[id]].ranks += 1;
          await this.document.update(actor, {});
        }
        break;

      case 'addConcentration':
        {
          const { id } = btn.dataset;
          const choice = document.getElementsByName(`${id}Choice`)[0];
          const conc = choice.value;
          const isNoRank =
            actor.system[[id]].ranks === 0 &&
            actor.system[[id]].startRanks === 0;

          if (isNoRank) {
            actor.system[[id]].ranks = 1;
          }

          actor.system[[id]].concentrations.push(conc);
          await this.document.update(actor, {});
        }
        break;
    }
  }
}
