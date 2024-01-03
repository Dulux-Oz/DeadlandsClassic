import { dlcConfig } from './config.mjs';

const { fields } = foundry.data;

/* --------------------------------------------------- */
/* Basic building blocks
/* --------------------------------------------------- */

export const dlcBoolean = (label, initial = true, required = true) => ({
  [label]: new fields.BooleanField({
    initial,
    required,
  }),
});

export const dlcConcentrations = (choices) => ({
  concentrations: new fields.ArrayField(
    new fields.StringField({ choices: [choices] }, { required: false })
  ),
});

export const dlcTraitDieSize = (label) => ({
  [label]: new fields.NumberField({
    initial: 4,
    required: true,
    integer: true,
    choices: [4, 6, 8, 10, 12],
  }),
});

export const dlcNumberComponent = (
  label,
  initial = 1,
  required = true,
  integer = true
) => ({
  [label]: new fields.NumberField({
    initial,
    required,
    integer,
  }),
});

export const dlcNumber = (
  label,
  initial = 1,
  initialMin = 0,
  initialMax = 10,
  required = true,
  integer = true,
  ...options
) => ({
  [label]: new fields.NumberField({
    initial,
    required,
    integer,
    min: initialMin,
    max: initialMax,
  }),
});

export const dlcNumberNoMax = (
  label,
  initial = 1,
  initialMin = 0,
  required = true,
  integer = true,
  ...options
) => ({
  [label]: new fields.NumberField({
    initial,
    required,
    integer,
    min: initialMin,
  }),
});

export const dlcNumberNoMin = (
  label,
  initial = 1,
  initialMax = 10,
  required = true,
  integer = true,
  ...options
) => ({
  [label]: new fields.NumberField({
    initial,
    required,
    integer,
    max: initialMax,
  }),
});

export const dlcNumberNoLimit = (
  label,
  initial = 1,
  required = true,
  integer = true,
  ...options
) => ({
  [label]: new fields.NumberField({
    initial,
    required,
    integer,
  }),
});

export const dlcValueType = (type) => ({
  valueType: new fields.StringField(
    { initial: type, choices: dlcConfig.valueType },
    { required: true }
  ),
});

/* --------------------------------------------------- */
/* Components
/* --------------------------------------------------- */

// Which games modes is this used in
export const dlcSetting = () => ({
  ...dlcBoolean('bUsedInWW'), // Wasted west
  ...dlcBoolean('bUsedInHE'), // Hell on Earth
  ...dlcBoolean('bUsedInLC'), // Lost Colony
});

// A standard aptitude which has no concentrations
export const dlcAptitude = (label, trait, defaultRanks) => ({
  [label]: new fields.SchemaField({
    ...dlcValueType('aptitude'),
    ...dlcNumberNoMax('ranks', 0, 0),
    ...dlcNumber('startRanks', 0, 0, 5 - defaultRanks),
    ...dlcNumberNoLimit('bountyAdjustment', 0),
    ...dlcNumber('defaultRanks', defaultRanks, 0, 5),
    trait: new fields.StringField({
      required: true,
      initial: trait,
      choices: dlcConfig.traits,
    }),
  }),
});

// An aptitude which need concentrations
export const dlcConcentrationAptitude = (
  label,
  trait,
  defaultRanks,
  ...concentrations
) => ({
  [label]: new fields.SchemaField({
    ...dlcValueType('aptitude'),
    ...dlcNumberNoMax('ranks', 0, 0),
    ...dlcNumber('startRanks', 0, 0, 5 - defaultRanks),
    ...dlcNumberNoLimit('bountyAdjustment', 0),
    ...dlcNumber('defaultRanks', defaultRanks, 0, 5),
    trait: new fields.StringField({
      required: true,
      initial: trait,
      choices: dlcConfig.traits,
    }),
    ...dlcConcentrations(concentrations, { required: true }),
  }),
});

// An aptitude which has a variable trait
export const dlcVariableAptitude = (label, defaultRanks) => ({
  [label]: new fields.SchemaField({
    ...dlcValueType('aptitude'),
    ...dlcNumberNoMax('ranks', 0, 0),
    ...dlcNumber('startRanks', 0, 0, 5 - defaultRanks),
    ...dlcNumberNoLimit('bountyAdjustment', 0),
    ...dlcNumber('defaultRanks', defaultRanks, 0, 5),
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
export const dlcTrait = (label) => ({
  [label]: new fields.SchemaField({
    ...dlcValueType('trait'),
    ...dlcNumberNoMax('ranks', 1, 0),
    ...dlcNumber('startRanks', 1, 1, 5),
    ...dlcNumberNoLimit('bountyAdjustment', 0),
    ...dlcTraitDieSize('dieSize'),
    ...dlcTraitDieSize('startDieSize'),
    ...dlcNumberNoMax('dieBoost', 0, 0, { step: 2 }),
  }),
});

/* --------------------------------------------------- */

// A record of the number of a given chip color
export const dlcChip = (
  label,
  initial = 0,
  initialMin = 0,
  required = true,
  integer = true,
  ...options
) => ({
  [label]: new fields.NumberField({
    initial,
    required,
    integer,
    min: initialMin,
  }),
});

/* --------------------------------------------------- */

export const dlcCharModLevel = () => ({
  new: fields.SchemaField({
    name: new fields.StringField({ required: true, blank: false }),
    ...dlcNumber('level', 1, 1, 5), // The level this represents
    effect: new fields.HTMLField(),
  }),
});

export const dlcCharMod = () => ({
  new: fields.SchemaField({
    name: new fields.StringField({ required: true, blank: false }),
    blurb: new fields.HTMLField(),
    capstone: new fields.HTMLField(),

    ...dlcNumberNoMax('level', 0, 0), // Current level
    ...dlcNumber('startLevel', 0, 0, 5), // start level
    ...dlcBoolean('hasCapstone', false),

    levels: new fields.SetField(dlcCharModLevel),
  }),
});

export const dlcCharModSingle = () => ({
  new: fields.SchemaField({
    name: new fields.StringField({ required: true, blank: false }),
    blurb: new fields.HTMLField(),
    effect: new fields.HTMLField(),

    ...dlcNumber('cost', 1, 1, 5), // start level
    ...dlcNumberNoMax('level', 0, 0), // Current level
    ...dlcNumber('startLevel', 0, 0, 5), // start level
  }),
});

export const dlcCharModSingleCapstone = () => ({
  new: fields.SchemaField({
    name: new fields.StringField({ required: true, blank: false }),
    blurb: new fields.HTMLField(),
    effect: new fields.HTMLField(),

    ...dlcNumber('cost', 1, 1, 5), // start level
    ...dlcNumberNoMax('level', 0, 0), // Current level
    ...dlcNumber('startLevel', 0, 0, 5), // start level

    ...dlcBoolean('hasCapstone', false),
    capstone: new fields.HTMLField(),
  }),
});
