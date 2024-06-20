/* eslint-disable no-underscore-dangle */
import { SetTraitsApp } from '../apps/set-traits-app.mjs';
import { dlcConstants } from '../constants.mjs';
import { Chips } from '../helpers/chips.mjs';
import * as utility from '../helpers/dlc-utilities.mjs';
import { TraitCards } from '../helpers/traitcards.mjs';
import { ActorSheetAdvance } from '../sheets/actor-sheet-advance.mjs';
import { ActorSheetCreate } from '../sheets/actor-sheet-create.mjs';

export class DeadlandsActor extends Actor {
  constructor(data, context) {
    super(data, context);

    /* This will hold the application used when creating a DeadlandsActor */
    Object.defineProperty(this, '_charCreator', {
      value: null,
      writable: true,
      enumerable: false,
    });

    /* This will hold the application used when modifying a DeadlandsActor */
    Object.defineProperty(this, '_charModifier', {
      value: null,
      writable: true,
      enumerable: false,
    });

    /* This will hold the application used when setting the traits of a DeadlandsActor */
    Object.defineProperty(this, '_traitSetter', {
      value: null,
      writable: true,
      enumerable: false,
    });

    /* This data that needs to be persistent while selecting trait dice, but we don't want in the database. */
    Object.defineProperty(this, 'settingTraits', {
      value: null,
      writable: true,
      enumerable: false,
    });

    /* This data that needs to be persistent while selecting trait dice, but we don't want in the database. */
    Object.defineProperty(this, 'updatingTraits', {
      value: null,
      writable: true,
      enumerable: false,
    });

    this.UpdatingTraits = {};

    /* This data that needs to be persistent while selecting trait dice, but we don't want in the database. */
    Object.defineProperty(this, 'archtypeSelected', {
      value: null,
      writable: true,
      enumerable: false,
    });
  }

  /*-------------------------------------------------------------------------
  | Removing chips
  +------------------------------------------------------------------------*/

  _hasChip(chip) {
    return (
      (chip === Chips.type.White && this.system.white > 0) ||
      (chip === Chips.type.Red && this.system.red > 0) ||
      (chip === Chips.type.Blue && this.system.blue > 0) ||
      (chip === Chips.type.Green && this.system.green > 0) ||
      (chip === Chips.type.TemporaryGreen && this.system.temporaryGreen > 0)
    );
  }

  async _updateForChipRemoval(type, addBounty) {
    const actorData = this.toObject();

    if (type === Chips.type.White && actorData.system.white > 0) {
      actorData.system.white -= 1;
    } else if (type === Chips.type.Red && actorData.system.red > 0) {
      actorData.system.red -= 1;
    } else if (type === Chips.type.Blue && actorData.system.blue > 0) {
      actorData.system.blue -= 1;
    } else if (type === Chips.type.Green && actorData.system.green > 0) {
      actorData.system.green -= 1;
    } else if (
      type === Chips.type.TemporaryGreen &&
      actorData.system.temporaryGreen > 0
    ) {
      actorData.system.temporaryGreen -= 1;
    } else {
      // eslint-disable-next-line no-param-reassign
      addBounty = false;
    }

    if (addBounty) {
      actorData.system.careerBounty += type;
    }

    const updateOptions = {};
    return this.update(actorData, updateOptions);
  }

  _checkRemoval(chip, action, convert, reportAction) {
    const speaker = this.name;
    const title = this.name;
    let message = '';

    if (!this._hasChip(chip)) {
      const colour = Chips.getColour(chip);
      message = `${title} attempted to ${action} a ${colour} chip, but none was available.`;
    } else {
      this._updateForChipRemoval(chip, convert);

      const chipobject = Chips.addToChipCollection(chip, {
        white: 0,
        red: 0,
        blue: 0,
        green: 0,
        temporaryGreen: 0,
      });

      message = Chips.makeActorReport(reportAction, chipobject);
    }

    utility.chatMessage(speaker, title, message);
  }

  async useChip(chip) {
    this._checkRemoval(chip, 'use', false, 'Used');
  }

  async convertChip(chip) {
    this._checkRemoval(chip, 'convert', true, 'Converted');
  }

  /* -------------------------------------------- */
  /*  Adding chips                                */
  /* -------------------------------------------- */

  async addMultipleChips({
    white = 0,
    red = 0,
    blue = 0,
    green = 0,
    temporaryGreen = 0,
  } = {}) {
    // Chips being added
    const adding = {
      white,
      red,
      blue,
      green,
      temporaryGreen,
    };

    // How many chips are being added
    const totalAdding = white + red + blue + green + temporaryGreen;

    // If nothing to actually add
    if (totalAdding < 1) return '';

    const localAct = this.toObject();

    localAct.system.white += white;
    localAct.system.red += red;
    localAct.system.blue += blue;
    localAct.system.green += green;
    localAct.system.temporaryGreen += temporaryGreen;

    // How many total chips does this actor now have
    let total =
      localAct.system.white +
      localAct.system.red +
      localAct.system.blue +
      localAct.system.green +
      localAct.system.temporaryGreen;

    const converting = {
      white: 0,
      red: 0,
      blue: 0,
      green: 0,
      temporaryGreen: 0,
    };

    // Reduce the combined chip collection to total 10 or less. Populate converting with chips
    // to convert to bounty.

    while (total > 10) {
      if (localAct.system.white > 0) {
        localAct.system.careerBounty += dlcConstants.bountyWhite;
        localAct.system.white -= 1;
        converting.white += 1;
        total -= 1;
      } else if (localAct.system.red > 0) {
        localAct.system.careerBounty += dlcConstants.bountyRed;
        localAct.system.red -= 1;
        converting.red += 1;
        total -= 1;
      } else if (localAct.system.blue > 0) {
        localAct.system.careerBounty += dlcConstants.bountyBlue;
        localAct.system.blue -= 1;
        converting.blue += 1;
        total -= 1;
      } else if (localAct.system.green > 0) {
        localAct.system.careerBounty += dlcConstants.bountyGreen;
        localAct.system.green -= 1;
        converting.green += 1;
        total -= 1;
      } else if (localAct.system.temporaryGreen > 0) {
        localAct.system.careerBounty += dlcConstants.bountyGreen;
        localAct.system.temporaryGreen -= 1;
        converting.temporaryGreen += 1;
        total -= 1;
      }
    }

    // **********************************************************************
    // Got the adjustments

    // How many total chips (if any) are being converted
    const totalConverting =
      converting.white +
      converting.red +
      converting.blue +
      converting.green +
      converting.temporaryGreen;

    let chatStr = Chips.makeActorReport('Added', adding);

    if (totalConverting > 0) {
      chatStr += `${Chips.makeActorReport(
        '. Converted',
        converting
      )} to bounty.`;
    }

    this.update(localAct, {});
    return chatStr;
  }

  /* -------------------------------------------- */

  /* Lazily get a sheet that deals with initial character creation. */
  get createCharacter() {
    if (!this._charCreator) {
      this._charCreator = new ActorSheetCreate(this, {
        editable: this.isOwner,
      });
    }
    return this._charCreator;
  }

  /* Lazily get a sheet that deals with character advancement/modification. */
  get modifyCharacter() {
    if (!this._charModifier) {
      this._charModifier = new ActorSheetAdvance(this, {
        editable: this.isOwner,
      });
    }
    return this._charModifier;
  }

  /* Lazily get a sheet that deals with setting the character's traits. */
  get setTraits() {
    if (!this._traitSetter) {
      this._traitSetter = new SetTraitsApp(this, {
        editable: this.isOwner,
      });
    }
    return this._traitSetter;
  }

  _preCreate(data, options, user) {
    // eslint-disable-next-line no-undef
    super._preCreate(data, options, user);

    if (this.system.cards === null || this.system.cards === undefined) {
      const cardString = TraitCards.makeNewCardString();
      this.updateSource({ 'system.cards': cardString });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  #limitTraitDice(changes, trait) {
    const changeTrait = changes.traitKeys[trait];
    const { cardDieSize, bountyDieSize } = changeTrait;
    let { startDieSize } = changeTrait;

    if (cardDieSize + startDieSize > dlcConstants.MaxDieSize) {
      const startDieMod = cardDieSize + startDieSize - dlcConstants.MaxDieSize;
      changeTrait.startDieSize -= startDieMod;
    }

    ({ startDieSize } = changeTrait);

    const fullSize = cardDieSize + startDieSize + bountyDieSize;

    if (fullSize > dlcConstants.MaxDieSize) {
      const dieSizeMod = fullSize - dlcConstants.MaxDieSize;
      changeTrait.bountyDieSize -= dieSizeMod;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  #limitTraitRanks(changes, trait) {
    const changeTrait = changes.traitKeys[trait];
    const { cardRanks, bountyRanks } = changeTrait;
    let { startRanks } = changeTrait;

    // Limit card plus start to max ranks, prioritise card
    if (cardRanks + startRanks > dlcConstants.MaxTraitRank) {
      const startRanksMod = cardRanks + startRanks - dlcConstants.MaxTraitRank;
      changeTrait.startRanks -= startRanksMod;
    }

    ({ startRanks } = changeTrait);

    const fullRanks = cardRanks + startRanks + bountyRanks;

    // Limit card plus start plus bounty to max ranks, prioritise card then start
    if (fullRanks > dlcConstants.MaxTraitRank) {
      const ranksMod = fullRanks - dlcConstants.MaxTraitRank;
      changeTrait.bountyRanks -= ranksMod;
    }
  }

  /* Checks that traits have not exceeded the allowable limits for ranks and die size.
  |  Edits the data being written to the database if they have */

  // _preUpdate(changes, options, user) {
  //   // eslint-disable-next-line no-restricted-syntax
  //   for (const trait of dlcConfig.traits) {
  //     const changeTrait = changes.traitKeys[trait];
  //     const { cardDieSize, startDieSize, dieSize } = changeTrait;

  //     // Limit card plus start to max die size, prioritise card
  //     if (cardDieSize + startDieSize + dieSize > dlcConstants.MaxDieSize) {
  //       this.#limitTraitDice(changes, trait);
  //     }

  //     const { cardRanks, startRanks, bountyRanks } = changeTrait;

  //     // Limit card plus start plus bounty to max die size, prioritise card then start
  //     if (cardRanks + startRanks + bountyRanks > dlcConstants.MaxTraitRank) {
  //       this.#limitTraitRanks(changes, trait);
  //     }
  //   }
  // }

  #isTrait(trait) {
    // eslint-disable-next-line no-prototype-builtins
    return this.traitKeys.hasOwnProperty(trait);
  }

  /*-------------------------------------------------------------------------
  | (cardDieSize + startDieSize + bountyDieSize) x2 is the number of sides
  | - 4, 6, 8, etc.  die boost x 2 is added, but only when 12 is reached
  +----------------------------------------------------------------------- */

  dieSize(trait) {
    if (!this.#isTrait(trait)) return 0;

    const tr = this.system[trait];

    let size = tr.cardDieSize + tr.startDieSize + tr.bountyDieSize;
    size *= dlcConstants.DieSizeBaseMultiplier;

    if (size === 12 && tr.dieBoost > 0) {
      const boost = tr.dieBoost * dlcConstants.DieSizeBaseMultiplier;
      return `${size} + ${boost}`;
    }
    return size;
  }

  /* ------------------------------------------------------------------------
  | Document preparation
  +---------------------------------------------------------------------- */

  // prepareBaseData() {}

  prepareDerivedData() {
    const keys = Object.keys(this.system);

    const validChips = {
      white: 0,
      red: 0,
      blue: 0,
      green: 0,
      temporaryGreen: 0,
    };

    const validWoundLocations = {
      head: true,
      guts: true,
      'left arm': true,
      'right arm': true,
      'left leg': true,
      'right leg': true,
    };

    this.traitKeys = {};
    this.aptitudeKeys = {};
    this.chipKeys = {};
    this.locationKeys = {};
    this.unclassifiedKeys = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const key of keys.values()) {
      if (Object.prototype.hasOwnProperty.call(this.system, key)) {
        const slot = this.system[key];
        if (Object.prototype.hasOwnProperty.call(slot, 'valueType')) {
          switch (slot.valueType) {
            case 'trait':
              this.traitKeys[key] = key;
              break;
            case 'aptitude':
              this.aptitudeKeys[key] = key;
              break;
            default:
          }
        } else if (key in validChips) {
          this.chipKeys[key] = key;
        } else if (key in validWoundLocations) {
          this.locationKeys[key] = key;
        } else {
          this.unclassifiedKeys[key] = key;
        }
      }
    }
  }
}
