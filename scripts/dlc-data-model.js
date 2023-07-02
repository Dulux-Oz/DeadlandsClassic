"use strict";

// The following comment block is for instructional / example purposes. It can be removed once we have theData Model (near) complete - MJB - 20230702
/*
class MyDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      requiredString: new fields.StringField({required: true, blank: false}),
      positiveInteger: new fields.NumberField({required: true, nullable: false, integer: true, positive: true}),
      stringArray: new fields.ArrayField(new fields.StringField()),
      innerSchema: new fields.SchemaField({
        innerBoolean: new fields.BooleanField({initial: false}),
        numberSet: new fields.SetField(new fields.NumberField({nullable: false, min: 0, max: 1}))
      })
    }
  }
}
*/

class cCharacterData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      oWind: new fields.SchemaField({
        nValue: new fields.NumberField({
          required: true,
          initial: 10,
          integer: true
        }),
        nMin: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        nMax: new fields.NumberField({
          required: true,
          initial: 10,
          integer: true
        })
      }),
      oProficiencies: new fields.SchemaField({
        sWeapons: new fields.ArrayField(new fields.StringField()),
        sSkills: new fields.ArrayField(new fields.StringField())
      })
      oStrain: new fields.SchemaField({
        nValue: new fields.NumberField({
          required: true,
          initial: 10,
          integer: true
        }),
        nMin: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        nMax: new fields.NumberField({
          required: true,
          initial: 10,
          integer: true
        })
      }),
      sNotes: new fields.HTMLField(),
    };
  }
}

class cEdgeData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      bUsedInWW: new fields.BooleanField({initial: true}),
      bUsedInHE: new fields.BooleanField({initial: false}),
      bUsedInLC: new fields.BooleanField({initial: false}),
      sDescription: new fields.HTMLField()
    };
  }
}

class cHindranceData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      bUsedInWW: new fields.BooleanField({initial: true}),
      bUsedInHE: new fields.BooleanField({initial: false}),
      bUsedInLC: new fields.BooleanField({initial: false}),
      sDescription: new fields.HTMLField()
    };
  }
}

class cNPCData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      bUsedInWW: new fields.BooleanField({initial: true}),
      bUsedInHE: new fields.BooleanField({initial: false}),
      bUsedInLC: new fields.BooleanField({initial: false}),
      sDescription: new fields.HTMLField()
    };
  }
}

class cWeaponData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      bUsedInWW: new fields.BooleanField({initial: true}),
      bUsedInHE: new fields.BooleanField({initial: false}),
      bUsedInLC: new fields.BooleanField({initial: false}),
      sDescription: new fields.HTMLField()
    };
  }
}

export const function fpRegisterDataModel() {
  CONFIG.Actor.systemDataModels.beast = cBeastData;
  CONFIG.Actor.systemDataModels.character = cCharacterData;
  CONFIG.Actor.systemDataModels.npc = cNPCData;
  CONFIG.Item.systemDataModels.career = cCareerData;
  CONFIG.Item.systemDataModels.careerrole = cCareerRoleData;
  CONFIG.Item.systemDataModels.mutation = cMutationData;
  CONFIG.Item.systemDataModels.province = cProvinceData;
  CONFIG.Item.systemDataModels.race = cRaceData;
  CONFIG.Item.systemDataModels.skill = cSkillData;
  CONFIG.Item.systemDataModels.subrace = cSubraceData;
  CONFIG.Item.systemDataModels.talent = cTalentData;
  CONFIG.Item.systemDataModels.trait = cTraitData;
  return;
}
