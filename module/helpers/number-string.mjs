export class NumberString {
  static digit = [
    '',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
  ];

  static teens = [
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ];

  static tens = [
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ];

  static makeString(num) {
    let n = Number(num);

    // Only handles numbers between zero and nine hundred and ninety nine
    if (Number.isNaN(n) || n < 0 || n > 999) return 'Out of range';

    n = Math.floor(n);

    // don't put this at the end
    if (n === 0) return 'Zero';

    let retVal = '';

    if (n > 99) {
      retVal += this.digit[Math.trunc(n / 100)];
      retVal += ' Hundred';
      n %= 100;
      if (n > 0) {
        retVal += ' and ';
      }
    }
    if (n > 19) {
      retVal += this.tens[Math.trunc(n / 10 - 2)];
      n %= 10;
      if (n > 0) {
        retVal += ' ';
      }
    }
    if (n > 9) {
      retVal += this.teens[n - 10];
    } else {
      retVal += this.digit[n];
    }

    return retVal;
  }
}
