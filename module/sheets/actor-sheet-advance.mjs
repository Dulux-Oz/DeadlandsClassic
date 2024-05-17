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
      | fromCreation: The number of ranks from the creation process.
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

      const fromCreation = value.defaultRanks + value.startRanks;

      const start = fromCreation + 1;
      const total = fromCreation + value.ranks;

      const length = Math.max(0, total - fromCreation);
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
    }

    // prettier-ignore
    context.bountyRemaining = Math.max( 0, this.actor.system.careerBounty - context.bountyUsed);

    /* ----------------------------------------------------------------------
    | Second pass through the aptitudes, now that we have a figure for
    | bounty remaining, set the "can we afford to improve this
    | aptitude" booleans.
    +----------------------------------------------------------------------*/

    for (const key of Object.keys(aptitudes)) {
      aptitudes[key].canAddConcentration =
        aptitudes[key].hasAvailable && context.bountyRemaining >= 3;
      aptitudes[key].canImprove =
        aptitudes[key].nextBounty <= context.bountyRemaining;
    }

    return context;
  }
}
