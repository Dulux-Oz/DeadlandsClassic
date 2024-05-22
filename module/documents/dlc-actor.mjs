/* eslint-disable no-underscore-dangle */
import { SetTraitsApp } from '../apps/set-traits-app.mjs';
import { Chips } from '../helpers/chips.mjs';
import * as utility from '../helpers/dlc-utilities.mjs';
import { NumberString } from '../helpers/number-string.mjs';
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

  /* -------------------------------------------- */
  /*  Removing chips                              */
  /* -------------------------------------------- */

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

      message = DeadlandsActor.#makeReport(reportAction, chipobject);
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
  /*  Making report strings                       */
  /* -------------------------------------------- */

  static #makeSub(count, string) {
    const suffix = count > 1 ? 's' : '';
    const num = NumberString.makeString(count);
    return count < 1 ? '' : num + string + suffix;
  }

  static #makeReport(action, chips) {
    const strings = [];

    let str = DeadlandsActor.#makeSub(
      chips.temporaryGreen,
      ' temporary green chip'
    );
    if (str !== '') strings.push(str);

    str = DeadlandsActor.#makeSub(chips.green, ' green chip');
    if (str !== '') strings.push(str);

    str = DeadlandsActor.#makeSub(chips.blue, ' blue chip');
    if (str !== '') strings.push(str);

    str = DeadlandsActor.#makeSub(chips.red, ' red chip');
    if (str !== '') strings.push(str);

    str = DeadlandsActor.#makeSub(chips.white, ' white chip');
    if (str !== '') strings.push(str);

    let report = `${action} `;
    let added = false;

    while (strings.length > 1) {
      if (added) report += ', ';
      report += strings.shift();
      added = true;
    }

    report += added ? ' and ' : '';
    report += strings.shift();

    return report;
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
        localAct.system.careerBounty += 1;
        localAct.system.white -= 1;
        converting.white += 1;
        total -= 1;
      } else if (localAct.system.red > 0) {
        localAct.system.careerBounty += 2;
        localAct.system.red -= 1;
        converting.red += 1;
        total -= 1;
      } else if (localAct.system.blue > 0) {
        localAct.system.careerBounty += 3;
        localAct.system.blue -= 1;
        converting.blue += 1;
        total -= 1;
      } else if (localAct.system.green > 0) {
        localAct.system.careerBounty += 5;
        localAct.system.green -= 1;
        converting.green += 1;
        total -= 1;
      } else if (localAct.system.temporaryGreen > 0) {
        localAct.system.careerBounty += 5;
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

    let chatStr = DeadlandsActor.#makeReport('Added', adding);

    if (totalConverting > 0) {
      chatStr += `${DeadlandsActor.#makeReport(
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
}
