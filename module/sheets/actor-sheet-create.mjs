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
export class ActorSheetCreate extends api.HandlebarsApplicationMixin(
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
      template: 'systems/deadlands-classic/templates/char-create/header.hbs',
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    traits: {
      template: 'systems/deadlands-classic/templates/char-create/traits.hbs',
      scrollable: [''],
    },
    aptitudes: {
      template: 'systems/deadlands-classic/templates/char-create/aptitudes.hbs',
      scrollable: [''],
    },
    charMod: {
      template: 'systems/deadlands-classic/templates/char-create/charMod.hbs',
      scrollable: [''],
    },
    edges: {
      template: 'systems/deadlands-classic/templates/char-create/edges.hbs',
      scrollable: [''],
    },
    hindrances: {
      template:
        'systems/deadlands-classic/templates/char-create/hindrances.hbs',
      scrollable: [''],
    },
    spelllikes: {
      template:
        'systems/deadlands-classic/templates/char-create/spelllikes.hbs',
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

  async _prepareContext(options) {
    let context = await super._prepareContext(options);

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
      aptitudes[key].label = key;

      aptitudes[key].canAddConcentration =
        aptitudes[key].hasAvailable &&
        ((pointsRemaining >= 1 && aptitudes[key].startConcentrations === 0) ||
          pointsRemaining >= 3);

      aptitudes[key].canRemoveConcentration =
        aptitudes[key].startConcentrations > 0;

      aptitudes[key].canRemoveRanks = aptitudes[key].startRanks > 0;

      const processedKey = key.split(' ').join('');
      aptitudes[key].choiceName = `${processedKey}Choice`;

      aptitudes[key].canIncreaseAptitudeRank =
        aptitudes[key].startConcentrations !== 0 &&
        aptitudes[key].next <= 5 &&
        aptitudes[key].next <= pointsRemaining;

      aptitudes[key].canDecreaseAptitudeRank = aptitudes[key].startRanks > 0;
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

      traits[key].dieSizeRegressionIsPossible = trait.startDieSize > 0;
      traits[key].dieRankRegressionIsPossible = trait.startRanks   > 0;

      traits[key].nextDie     = dieSize + 1;
      traits[key].nextDieCost = traits[key].nextDie * dlcConstants.DieSizePointMultiplier;

      traits[key].nextRank     = traitRank + 1;
      traits[key].nextRankCost = traits[key].nextRank * dlcConstants.DieRankPointMultiplier;

      traits[key].canIncreaseDieSize =
        traits[key].dieSizeImprovementIsPossible &&
        traits[key].nextDieCost <= pointsRemaining;

      traits[key].canDecreaseDieSize =
        traits[key].dieSizeRegressionIsPossible;

      traits[key].canIncreaseTraitRank =
        traits[key].dieRankImprovementIsPossible &&
        traits[key].nextRankCost <= pointsRemaining;

      traits[key].canDecreaseTraitRank =
        traits[key].dieRankRegressionIsPossible;
    }

    context.pointsRemaining = pointsRemaining;
    context.showPointsRemaining = pointsRemaining > 0;

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
      actor.system[[id]].startRanks < 1 &&
      actor.system[[id]].defaultRanks < 1
    ) {
      actor.system[[id]].startRanks += 1;
    }

    actor.system[[id]].startConcentrations += 1;
    actor.system[[id]].concentrations.push(conc);
    await this.document.update(actor, {});
  }

  static async _decreaseAptitude(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    actor.system[[id]].startRanks -= 1;
    await this.document.update(actor, {});
  }

  static async _decreaseDieSize(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    actor.system[[id]].startDieSize -= 1;
    await this.document.update(actor, {});
  }

  static async _decreaseTraitRank(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    actor.system[[id]].startRanks -= 1;
    await this.document.update(actor, {});
  }

  static async _increaseAptitude(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    actor.system[[id]].startRanks += 1;
    await this.document.update(actor, {});
  }

  static async _increaseDieSize(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    actor.system[[id]].startDieSize += 1;
    await this.document.update(actor, {});
  }

  static async _increaseTraitRank(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.target;
    const actor = this.document.toObject(false);
    const { id } = btn.dataset;

    actor.system[[id]].startRanks += 1;
    await this.document.update(actor, {});
  }

  static async _removeConcentration(event, target) {
    event.preventDefault();
    event.stopPropagation();

    const actor = this.document.toObject(false);

    const btn = event.target;
    const { id, item } = btn.dataset;

    actor.system[[id]].startConcentrations -= 1;
    actor.system[[id]].concentrations.splice(item, 1);

    await this.document.update(actor, {});
  }
}
