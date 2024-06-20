import { Deck } from './deck.mjs';
import { NumberString } from './number-string.mjs';

export class Chips {
  static type = {
    NoChip: 0,
    White: 1,
    Red: 2,
    Blue: 3,
    Green: 5,
    TemporaryGreen: 5,
  };

  static colour = {
    NoChip: 'None',
    White: 'white',
    Red: 'red',
    Blue: 'blue',
    Green: 'green',
    TemporaryGreen: 'temporary green',
  };

  static getColour(type) {
    const key = Object.keys(Chips.type).find(
      (searchKey) => Chips.type[searchKey] === type
    );

    return this.colour[key];
  }

  // Choose a randomn chip from those available in the pot. The Marshall can't get green
  // chips, so we need to distinguish if those are avaialble.
  static randomDraw(includeGreen) {
    const { white, red, blue, green } = game.chips.available;

    const available = white + red + blue + (includeGreen ? green : 0);
    const picked = Deck.getRandomInteger(1, available);

    let pick = Chips.type.NoChip;

    if (picked <= white) {
      pick = Chips.type.White;
      game.chips.available.white -= 1;
    } else if (picked <= white + red) {
      game.chips.available.red -= 1;
      pick = Chips.type.Red;
    } else if (picked <= white + red + blue) {
      game.chips.available.blue -= 1;
      pick = Chips.type.Blue;
    } else if (includeGreen) {
      game.chips.available.green -= 1;
      pick = Chips.type.Green;
    }

    return pick;
  }

  static addToChipCollection(chip, collection) {
    const newCollection = foundry.utils.deepClone(collection);
    switch (chip) {
      case Chips.type.White:
        newCollection.white += 1;
        break;
      case Chips.type.Red:
        newCollection.red += 1;
        break;
      case Chips.type.Blue:
        newCollection.blue += 1;
        break;
      case Chips.type.Green:
        newCollection.green += 1;
        break;
      case Chips.type.TemporaryGreen:
        newCollection.temporaryGreen += 1;
        break;
      default:
    }
    return newCollection;
  }

  static buildCurrentChipPool() {
    const isPc = game.actors.filter((actor) => actor.system.hasChips);

    const maxWhite = game.settings.get('deadlands-classic', 'white-chips');
    const maxRed = game.settings.get('deadlands-classic', 'red-chips');
    const maxBlue = game.settings.get('deadlands-classic', 'blue-chips');
    const maxGreen = game.settings.get('deadlands-classic', 'green-chips');

    const marshal = game.settings.get('deadlands-classic', 'marshal-chips');

    let { white, red, blue } = marshal.chips;
    let green = 0;

    // eslint-disable-next-line no-restricted-syntax
    for (const actor of Object.values(isPc)) {
      white += actor.system.white;
      red += actor.system.red;
      blue += actor.system.blue;
      green += actor.system.green;
    }

    white = Math.max(0, maxWhite - white);
    red = Math.max(0, maxRed - red);
    blue = Math.max(0, maxBlue - blue);
    green = Math.max(0, maxGreen - green);

    game.chips.available = { white, red, blue, green };
  }

  /* -------------------------------------------- */
  /*  Making report strings                       */
  /* -------------------------------------------- */

  static makeSubReport(count, string) {
    const suffix = count > 1 ? 's' : '';
    const num = NumberString.makeString(count);
    return count < 1 ? '' : num + string + suffix;
  }

  static makeActorReport(action, chips) {
    const strings = [];

    let str = Chips.makeSubReport(
      chips.temporaryGreen,
      ' temporary green chip'
    );
    if (str !== '') strings.push(str);

    str = Chips.makeSubReport(chips.green, ' green chip');
    if (str !== '') strings.push(str);

    str = Chips.makeSubReport(chips.blue, ' blue chip');
    if (str !== '') strings.push(str);

    str = Chips.makeSubReport(chips.red, ' red chip');
    if (str !== '') strings.push(str);

    str = Chips.makeSubReport(chips.white, ' white chip');
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

  static makeMarshalReport(action, chips) {
    const strings = [];

    let str = Chips.makeSubReport(chips.blue, ' blue chip');
    if (str !== '') strings.push(str);

    str = Chips.makeSubReport(chips.red, ' red chip');
    if (str !== '') strings.push(str);

    str = Chips.makeSubReport(chips.white, ' white chip');
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
}
