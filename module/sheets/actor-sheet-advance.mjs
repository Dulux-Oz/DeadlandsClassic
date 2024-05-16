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

  /** @override */
  async getData(options) {
    const context = await super.getData(options);

    const { aptitudes } = context;
    let bountyUsed = 0;

    /* First pass through the aptitudes, calculate how much bounty each has used,
       what the next level for it will be, how much that will cost. Also calculate
       the global bounty used total. */

    for (const key of Object.keys(aptitudes)) {
      const value = aptitudes[key];

      let concentrationAdjustment = 0;

      if (Object.prototype.hasOwnProperty.call(value, 'concentrations')) {
        //
        // First concentration is free.

        concentrationAdjustment = Math.max(0, value.concentrations.length - 1);
      }

      // Calculate bounty spent on this aptitude so far and the amount for its next improvement.
      const start = value.defaultRanks;
      const total = value.defaultRanks + value.startRanks;
      const next = total + 1;

      let aptitudeBounty = 0;
      let multiplier = start === 5 ? 2 : 1;

      for (let r = start + 1; r <= total; r += 1) {
        aptitudeBounty += r * multiplier;
        multiplier += r % 5 === 0 ? 1 : 0;
      }

      const nextBounty = next * multiplier;

      aptitudeBounty =
        aptitudeBounty - value.bountyAdjustment + concentrationAdjustment;

      // update the total for the actor
      bountyUsed += aptitudeBounty;

      aptitudes[key].aptitudeBounty = aptitudeBounty;
      aptitudes[key].next = next;
      aptitudes[key].nextBounty = nextBounty;
      aptitudes[key].start = start;
      aptitudes[key].total = total;
    }

    context.bountyUsed = bountyUsed;
    context.bountyRemaining = Math.max(
      0,
      this.actor.system.careerBounty - bountyUsed
    );

    /* Second pass through the aptitudes, now that we have a figure for
       bounty remaining, set the "can we afford to improve this
       aptitude" boolean. */

    for (const key of Object.keys(aptitudes)) {
      const value = aptitudes[key];

      value.canImprove = value.nextBounty <= context.bountyRemaining;
    }

    return context;
  }
}
