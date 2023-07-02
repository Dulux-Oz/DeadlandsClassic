
"use strict";

//Temporary Setting for debugging
CONFIG.debug.hooks = true;

// Remove Comment and activate next line for Production
//  CONFIG.debug.hooks = false;
Hooks.once("init",fpOnInit);
Hooks.once("setup",fpOnSetup);
Hooks.once("ready",fpOnReady);

function fpCreateNamespace() {
  if (!Array.isArray(globalThis.game.deadlands_classic)) {
    game.deadlands_classic = {};
  }
  return;
};

function fpOnInit() {
console.log("Deadlands Classic | Initalising");
  fpCreateNamespace();
//  EXTERNAL.fpRegisterDataModel()???;
  fpRegisterDataModel();
  return;
};

function fpOnReady() {
console.log("Deadlands Classic | Readying");
  return;
}

function fpOnSetup() {
console.log("Deadlands Classic | Setting Up");
// I think this next line goes here in this function, but maybe not - MJB - 20230702
  fpCreateGameOptions();
  return;
}


// Functions following this comment should probably be put in one or more classes / modules / whatevers and placed in different files. IE How do you boys want to arrange things. - MJB - 20230702

function fpRegisterDataModel() {}
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

function fpCreateGameOptions() {
  // We'll need this fuction sooner or later - MJB - 20230702
}
