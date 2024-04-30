import { Chips } from '../helpers/chips.mjs';
import { NumberString } from '../helpers/number-string.mjs';

export class DeadlandsActor extends Actor {
  // eslint-disable-next-line no-useless-constructor
  constructor(data, context) {
    super(data, context);
  }

  async removeSingleChip(type, addBounty) {
    const actorData = this.system.toObject();

    let { white, red, blue, green, temporaryGreen, careerBounty } = actorData;

    if (type === Chips.type.White && white > 0) {
      white -= 1;
    } else if (type === Chips.type.Red && red > 0) {
      red -= 1;
    } else if (type === Chips.type.Blue && blue > 0) {
      blue -= 1;
    } else if (type === Chips.type.Green && green > 0) {
      green -= 1;
    } else if (type === Chips.type.TemporaryGreen && temporaryGreen > 0) {
      temporaryGreen -= 1;
    } else {
      // eslint-disable-next-line no-param-reassign
      addBounty = false;
    }

    if (addBounty) {
      careerBounty += type;
    }

    const data = { white, red, blue, green, temporaryGreen, careerBounty };

    const updateOptions = {};
    return this.update(data, updateOptions);
  }

  async useChip(type) {
    this.removeSingleChip(type, false);
  }

  async convertChip(type) {
    this.removeSingleChip(type, true);
  }

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

  async addChip(type) {
    // Convert a Chip if necessary to have 10 or fewer

    let { white, red, blue, green, temporaryGreen, careerBounty } = this.system;

    let convert = Chips.NoChip;

    const total = white + red + blue + green + temporaryGreen;

    if (total > 9) {
      if (white > 0) {
        convert = Chips.type.White;
        white -= 1;
      } else if (red > 0) {
        convert = Chips.type.Red;
        red -= 1;
      } else if (blue > 0) {
        convert = Chips.type.Blue;
        blue -= 1;
      } else if (temporaryGreen > 0) {
        convert = Chips.type.Green;
        green -= 1;
      } else {
        convert = Chips.type.TemporaryGreen;
        temporaryGreen -= 1;
      }

      careerBounty += convert;
    }

    if (type === Chips.type.White) {
      white += 1;
    } else if (type === Chips.type.Red) {
      red += 1;
    } else if (type === Chips.type.Blue) {
      blue += 1;
    } else if (type === Chips.type.Green) {
      green += 1;
    } else if (type === Chips.type.TemporaryGreen) {
      temporaryGreen += 1;
    }

    const data = { white, red, blue, green, temporaryGreen, careerBounty };

    const updateOptions = {};
    return this.update(data, updateOptions);
  }
}
