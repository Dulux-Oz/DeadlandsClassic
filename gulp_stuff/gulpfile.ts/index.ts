"use strict";

import oBuild from "./gtBuild";
//import oDel from "del";
//import oDeploy from "./gtDeploy";
import oGulp from "gulp";
import oWatch from "./gtWatch";

export let bIsProd = false;

export default oGulp.series(
  oBuild,
  oWatch
);

/*
export const deploy = oGulp.series(
  async () => {bIsProd = true;},
  async () => oDel(["prod"]),
  oBuild,
  oDeploy
);
*/
