/* eslint-disable no-restricted-syntax */
import { dlcConstants } from '../constants.mjs';
import { DLCActorSheetBase } from './actor-sheet-base.mjs';

export class ActorSheetCreate extends DLCActorSheetBase {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['dlc', 'sheet', 'actor'],
      template:
        'systems/deadlands-classic/templates/char-create/character.html',
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

      const start = 1;
      const total = value.startRanks;

      const length = Math.max(0, total + 1 - start);

      // prettier-ignore
      const levelsToProcess = Array.from({ length }, (_, index) => start + index);

      // prettier-ignore
      let thisAptitudespoints =
        levelsToProcess.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      thisAptitudespoints += value.hasConcentrations
        ? Math.max(0, value.concentrations.length - 1) * 3
        : 0;

      // update the total for the actor
      totalPoints += thisAptitudespoints;

      aptitudes[key].aptitudePoints = thisAptitudespoints;
      aptitudes[key].next = total + 1;
      aptitudes[key].nextPoints = aptitudes[key].startRanks + 1;
      aptitudes[key].isNoRank =
        value.startRanks === 0 && value.bountyRanks === 0;
    }

    /*------------------------------------------------------------------------
    | First pass through the traits, calculate how many aptitude points
    | each has used, what the next level for it will be, how much that will
    | cost. Also calculate the aptitude points used total.
    +-----------------------------------------------------------------------*/

    for (const key of Object.keys(traits)) {
      const trait = traits[key];

      let length = trait.startDieSize;
      let start = trait.cardDieSize + 1;
      const sizeArray = Array.from({ length }, (_, index) => start + index);

      const dieSizePoints = sizeArray.reduce(
        (accumulator, currentValue) =>
          accumulator + dlcConstants.DieSizePointMultiplier * currentValue,
        0
      );

      length = trait.startRanks;
      start = trait.cardRanks + 1;
      const rankArray = Array.from({ length }, (_, index) => start + index);

      const dieRankPoints = rankArray.reduce(
        (accumulator, currentValue) =>
          accumulator + dlcConstants.DieRankPointMultiplier * currentValue,
        0
      );

      // Aptitude points are the points spent to improve this trait in the
      // character creation phase (most likely zero, it's very expensive).
      // Also, update the total aptitude points for the actor.

      const aptitudePoints = dieSizePoints + dieRankPoints;
      totalPoints += aptitudePoints;

      traits[key].aptitudePoints = aptitudePoints;
    }

    const pointsAvailable =
      (Cognition?.totalDieSize ?? 4) +
      (Knowledge?.totalDieSize ?? 4) +
      (Smarts?.totalDieSize ?? 4);

    const pointsRemaining = Math.max(0, pointsAvailable - totalPoints);

    /* ----------------------------------------------------------------------
    | Second pass through the aptitudes, now that we have a figure for
    | aptitude points remaining, set the "can we afford to improve this
    | aptitude" booleans.
    +----------------------------------------------------------------------*/

    for (const key of Object.keys(aptitudes)) {
      aptitudes[key].canAddConcentration =
        aptitudes[key].hasAvailable &&
        ((pointsRemaining >= 1 && aptitudes[key].startConcentrations === 0) ||
          pointsRemaining >= 3);

      const processedKey = key.split(' ').join('');
      aptitudes[key].choiceName = `${processedKey}Choice`;

      aptitudes[key].canImprove =
        aptitudes[key].startConcentrations !== 0 &&
        aptitudes[key].next <= 5 &&
        aptitudes[key].next <= pointsRemaining;
    }

    /*-----------------------------------------------------------------------
    | Second pass through the traits, calculate whether we can improve this
    | trait, set the can improve booleans for each trait.
    +----------------------------------------------------------------------*/

    // prettier-ignore
    for (const key of Object.keys(traits)) {
      const trait = traits[key];

      const dieSize = trait.cardDieSize + trait.startDieSize;
      const traitRank = trait.cardRanks + trait.startRanks;

      traits[key].dieSizeImprovementIsPossible = dieSize < dlcConstants.MaxDieSize;
      traits[key].dieRankImprovementIsPossible = traitRank < dlcConstants.MaxTraitRank;

      traits[key].nextDie     = dieSize + 1;
      traits[key].nextDieCost = traits[key].nextDie * dlcConstants.DieSizePointMultiplier;

      traits[key].nextRank     = traitRank + 1;
      traits[key].nextRankCost = traits[key].nextRank * dlcConstants.DieRankPointMultiplier;

      traits[key].canImproveDieSize =
        traits[key].dieSizeImprovementIsPossible &&
        traits[key].nextDieCost <= pointsRemaining;

      traits[key].canImproveTraitRank =
        traits[key].dieRankImprovementIsPossible &&
        traits[key].nextRankCost <= pointsRemaining;
    }

    context.pointsRemaining = pointsRemaining;
    context.showPointsRemaining = pointsRemaining > 0;
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

          if (
            actor.system[[id]].startRanks < 1 &&
            actor.system[[id]].defaultRanks < 1
          ) {
            actor.system[[id]].startRanks += 1;
          }

          actor.system[[id]].startConcentrations += 1;
          actor.system[[id]].concentrations.push(conc);
          await this.document.update(actor, {});
        }
        break;

      case 'improveAptitude':
        {
          const { id } = btn.dataset;
          actor.system[[id]].startRanks += 1;
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
          actor.system[[id]].startDieSize += 1;
          await this.document.update(actor, {});
        }
        break;

      case 'improveTraitRank':
        {
          const { id } = btn.dataset;
          actor.system[[id]].startRanks += 1;
          await this.document.update(actor, {});
        }
        break;

      default:
      // No default case is necessary
    }
  }
}
