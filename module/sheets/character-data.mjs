export class cCharacterData extends foundry.abstract.DataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      oWind: new fields.SchemaField({
        nValue: new fields.NumberField({
          required: true,
          initial: 10,
          integer: true,
        }),
        nMin: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        nMax: new fields.NumberField({
          required: true,
          initial: 10,
          integer: true,
        }),
      }),
      oProficiencies: new fields.SchemaField({
        sWeapons: new fields.ArrayField(new fields.StringField()),
        sSkills: new fields.ArrayField(new fields.StringField()),
      }),
      oStrain: new fields.SchemaField({
        nValue: new fields.NumberField({
          required: true,
          initial: 10,
          integer: true,
        }),
        nMin: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        nMax: new fields.NumberField({
          required: true,
          initial: 10,
          integer: true,
        }),
      }),
      sBiography: new fields.HTMLField(),
      sNotes: new fields.HTMLField(),
    };
  }
}
