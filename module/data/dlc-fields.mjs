import { dlcConfig } from '../config.mjs';

const { fields } = foundry.data;

/* --------------------------------------------------- */
/* Basic building blocks
/* --------------------------------------------------- */

export const boolean = (label, initial = true, required = true) => ({
  [label]: new fields.BooleanField({
    initial,
    required,
  }),
});

export const dieSize = (label) => ({
  [label]: new fields.NumberField({
    initial: 2,
    required: true,
    integer: true,
    choices: [2, 3, 4, 5, 6], // x2 gives the number of sides
  }),
});

export const traitCard = (label) => ({
  [label]: new fields.NumberField({
    integer: true,
    required: false,
    min: 0,
    max: 11,
  }),
});

export const integer = (
  label,
  initial = 1,
  initialMin = 0,
  initialMax = 10,
  required = true,
  isInteger = true,
  ...options
) => ({
  [label]: new fields.NumberField({
    initial,
    required,
    integer: isInteger,
    min: initialMin,
    max: initialMax,
  }),
});

export const integerNoLimit = (
  label,
  initial = 1,
  required = true,
  isInteger = true,
  ...options
) => ({
  [label]: new fields.NumberField({
    initial,
    required,
    integer: isInteger,
  }),
});

export const integerNoMax = (
  label,
  initial = 1,
  initialMin = 0,
  required = true,
  isInteger = true,
  ...options
) => ({
  [label]: new fields.NumberField({
    initial,
    required,
    integer: isInteger,
    min: initialMin,
  }),
});

export const integerOptional = (label, ...options) => ({
  [label]: new fields.NumberField({
    required: false,
    integer: true,
  }),
});

export const integerStepped = (
  label,
  initial = 1,
  initialMin = 0,
  initialMax = 10,
  step = 1,
  required = true,
  isInteger = true,
  ...options
) => ({
  [label]: new fields.NumberField({
    initial,
    required,
    integer: isInteger,
    min: initialMin,
    max: initialMax,
    step,
  }),
});

export const valueType = (type) => ({
  valueType: new fields.StringField(
    { initial: type, choices: dlcConfig.valueType },
    { required: true }
  ),
});

/* --------------------------------------------------- */
/* Components
/* --------------------------------------------------- */

// A standard aptitude which has no concentrations
export const aptitude = (label, trait, defaultRanks) => ({
  [label]: new fields.SchemaField({
    ...valueType('aptitude'),
    ...integerNoMax('bountyRanks', 0, 0),
    ...integer('startRanks', 0, 0, 5 - defaultRanks),
    ...integerNoLimit('bountyAdjustment', 0),
    ...integer('defaultRanks', defaultRanks, 0, 5),
    trait: new fields.StringField({
      required: true,
      initial: trait,
      choices: dlcConfig.traits,
    }),
  }),
});

// An aptitude which need concentrations.
export const concentrationAptitude = (
  label,
  trait,
  defaultRanks,
  ...choices
) => ({
  [label]: new fields.SchemaField({
    ...valueType('aptitude'),
    ...integerNoMax('startConcentrations', 0, 0),
    ...integer('defaultRanks', defaultRanks, 0, 5),
    ...integer('startRanks', 0, 0, 5 - defaultRanks),
    ...integerNoMax('bountyRanks', 0, 0),
    ...integerNoLimit('bountyAdjustment', 0),
    trait: new fields.StringField({
      required: true,
      initial: trait,
      choices: dlcConfig.traits,
    }),
    concentrations: new fields.ArrayField(
      new fields.StringField({ choices }, { required: false })
    ),
  }),
});

// An aptitude which has a variable trait
export const variableAptitude = (label, defaultRanks) => ({
  [label]: new fields.SchemaField({
    ...valueType('aptitude'),
    ...integerNoMax('bountyRanks', 0, 0),
    ...integer('startRanks', 0, 0, 5 - defaultRanks),
    ...integerNoLimit('bountyAdjustment', 0),
    ...integer('defaultRanks', defaultRanks, 0, 5),
    traitIsVariable: new fields.BooleanField({ initial: true }),
    trait: new fields.StringField({
      required: true,
      initial: 'Spirit',
      choices: dlcConfig.traits,
    }),
  }),
});

/* --------------------------------------------------- */

// After d12, traits go to d12 + 2, d12 + 4, etc. The dieBoost is this plus
export const trait = (label) => ({
  [label]: new fields.SchemaField({
    ...valueType('trait'),

    ...traitCard('card'), // integer 0 .. 11, index from TraitCards, is optional in data, but not in completed char.

    // (cardDieSize + startDieSize + bountyDieSize) x2 is the number of sides - 4, 6, 8, etc.

    ...integer('cardRanks', 1, 1, 5), // will be derived from the 'card'
    ...dieSize('cardDieSize'),

    ...integer('startRanks', 0, 0, 4),
    ...integer('startDieSize', 0, 0, 4),

    ...integerNoMax('bountyRanks', 0, 0),
    ...integer('bountyDieSize', 0, 0, 4),

    ...integerNoLimit('bountyAdjustment', 0), // If the dieSize gets reduced, this accounts for the bounty

    ...integerNoMax('dieBoost', 0, 0, { step: 2 }),
  }),
});

/* --------------------------------------------------- */

// A record of the number of a given chip color
export const chip = (
  label,
  initial = 0,
  initialMin = 0,
  required = true,
  isInteger = true,
  ...options
) => ({
  [label]: new fields.NumberField({
    initial,
    required,
    integer: isInteger,
    min: initialMin,
  }),
});

/* --------------------------------------------------- */

// Which games modes is this used in
export const setting = () => ({
  setting: new fields.SchemaField({
    ...boolean('WastedWest', true),
    ...boolean('HellOnEarth', false),
    ...boolean('LostColony', false),
  }),
});

/* --------------------------------------------------- */

export const modLevel = (label) => ({
  [label]: new fields.SchemaField({
    ...boolean('active', false), // is this level active
    ...integerNoMax('cost', 3),
    ...integerNoMax('startCost', 1),
    text: new fields.HTMLField({ required: false }),
  }),
});

/* --------------------------------------------------- */

// The fields which are common to physical items i.e. not character modifications
export const itemCommonFields = () => ({
  ...setting(),
  description: new fields.HTMLField({ required: true, initial: '' }),
  notes: new fields.HTMLField({ required: false }),
  ...integerNoMax('price', 0), // in cents
});
