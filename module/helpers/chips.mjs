import { Deck } from './deck.mjs';

export class Chips {
  static type = {
    NoChip: 0,
    White: 1,
    Red: 2,
    Blue: 3,
    Green: 5,
    TemporaryGreen: 5,
  };

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
}
