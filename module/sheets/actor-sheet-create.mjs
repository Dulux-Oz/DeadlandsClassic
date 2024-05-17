/* eslint-disable no-restricted-syntax */
import { DLCActorSheetBase } from './actor-sheet-base.mjs';

export class ActorSheetCreate extends DLCActorSheetBase {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dlc', 'sheet', 'actor'],
      template:
        'systems/deadlands-classic/templates/char-create/character.html',
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

    const { aptitudes, traits } = context;
    const { Cognition, Knowledge, Smarts } = traits;

    let totalPoints = 0;

    /*------------------------------------------------------------------------
    | First pass through the aptitudes, calculate how many aptitude points
    | each has used, what the next level for it will be, how much that will
    | cost. Also calculate the aptitude points used total. 
    +-----------------------------------------------------------------------*/

    for (const key of Object.keys(aptitudes)) {
      const value = aptitudes[key];

      const start = value.defaultRanks + 1;
      const total = value.defaultRanks + value.startRanks;

      const length = Math.max(0, total - start);

      // prettier-ignore
      const levelsToProcess = Array.from({ length }, (_, index) => start + index);

      // prettier-ignore
      let thisAptitudespoints =
        levelsToProcess.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      // prettier-ignore
      thisAptitudespoints += value.hasConcentrations
        ? Math.max(0, value.concentrations.length - 1) * 3
        : 0;

      // update the total for the actor
      totalPoints += thisAptitudespoints;

      aptitudes[key].aptitudePoints = thisAptitudespoints;
      aptitudes[key].next = total + 1;
    }

    const pointsAvailable =
      (Cognition?.dieSize ?? 4) +
      (Knowledge?.dieSize ?? 4) +
      (Smarts?.dieSize ?? 4);

    const pointsRemaining = Math.max(0, pointsAvailable - totalPoints);

    /* ----------------------------------------------------------------------
    | Second pass through the aptitudes, now that we have a figure for
    | aptitude points remaining, set the "can we afford to improve this
    | aptitude" booleans.
    +----------------------------------------------------------------------*/

    for (const key of Object.keys(aptitudes)) {
      aptitudes[key].canAddConcentration =
        aptitudes[key].hasAvailable && pointsRemaining >= 3;
      aptitudes[key].canImprove =
        aptitudes[key].next <= 5 && aptitudes[key].next <= pointsRemaining;
    }

    return context;
  }
}
