export class cTweakData extends foundry.abstract.DataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      bUsedInWW: new fields.BooleanField({ initial: true }),
      bUsedInHE: new fields.BooleanField({ initial: false }),
      bUsedInLC: new fields.BooleanField({ initial: false }),
      sDescription: new fields.HTMLField(),
    };
  }
}
