import { dlcConfig } from './config.mjs';

const { fields } = foundry.data;

export const dlcSetting = () => ({
  bUsedInWW: new fields.BooleanField({ initial: true }),
  bUsedInHE: new fields.BooleanField({ initial: false }),
  bUsedInLC: new fields.BooleanField({ initial: false }),
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
  ...options
) => ({
  [label]: new fields.SchemaField({
    ...dlcNumberComponent('value', initial, { options }),
    ...dlcNumberComponent('min', initialMin),
    ...dlcNumberComponent('max', initialMax),
  }),
});

export const dlcNumberNoMax = (
  label,
  initial = 1,
  initialMin = 0,
  ...options
) => ({
  [label]: new fields.SchemaField({
    ...dlcNumberComponent('value', initial, { options }),
    ...dlcNumberComponent('min', initialMin),
  }),
});

export const dlcNumberNoMin = (
  label,
  initial = 1,
  initialMax = 10,
  ...options
) => ({
  [label]: new fields.SchemaField({
    ...dlcNumberComponent('value', initial, { options }),
    ...dlcNumberComponent('max', initialMax),
  }),
});

export const dlcNumberNoLimit = (label, initial = 1, ...options) => ({
  [label]: new fields.SchemaField({
    ...dlcNumberComponent('value', initial, { options }),
  }),
});

export const dlcValueType = (type) => ({
  valueType: new fields.StringField(
    { initial: type, choices: dlcConfig.valueType },
    { required: true }
  ),
});

// An standard aptitude which has no concentrations
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

export const dlcChip = (label) => ({
  [label]: new fields.SchemaField({
    ...dlcValueType('chip'),
    value: new fields.NumberField({
      required: true,
      initial: 0,
      integer: true,
    }),
    min: new fields.NumberField({
      required: true,
      initial: 0,
      integer: true,
    }),
  }),
});
