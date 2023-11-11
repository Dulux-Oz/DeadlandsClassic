import { Chips } from '../helpers/chips.mjs';

export class DeadlandsActor extends Actor {
  // eslint-disable-next-line no-useless-constructor
  constructor(data, context) {
    super(data, context);
  }

  async removeChip(type, addBounty) {
    let { white, red, blue, green, temporaryGreen, careerBounty } = this.system;

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
    this.removeChip(type, false);
  }

  async convertChip(type) {
    this.removeChip(type, true);
  }

  async grantChip(type) {
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
