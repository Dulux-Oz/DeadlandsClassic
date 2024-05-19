/* eslint-disable no-underscore-dangle */
import * as aptUtils from '../helpers/aptitude-utilities.mjs';

function _makeSingle(world) {
  const { fields } = foundry.data;

  return {
    [world]: new fields.ArrayField(new fields.StringField({ required: false })),
  };
}

function _makeConcentrations() {
  const { fields } = foundry.data;

  const configConcentrations = aptUtils.getWorldConcentrationAptitudes();

  const concentrations = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(configConcentrations)) {
    let inner = {};
    if (value.WW) {
      inner = {
        ...inner,
        ..._makeSingle('WW'),
      };
    }
    if (value.HE) {
      inner = {
        ...inner,
        ..._makeSingle('HE'),
      };
    }
    if (value.LC) {
      inner = {
        ...inner,
        ..._makeSingle('LC'),
      };
    }
    concentrations[[key]] = new fields.SchemaField({ ...inner });
  }
  return concentrations;
}

export class ConcentrationDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const { fields } = foundry.data;

    return {
      ..._makeConcentrations(),
    };
  }
}
