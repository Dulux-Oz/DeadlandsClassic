"use strict";

import oChalk from "chalk";
import oGulp from "gulp";
import oMocha from "gulp-mocha"

const oOpts = {};

export default async function gtTestTask(){
  return oGulp.src("mocha/*.test.ts",{read:false})
    .pipe(oMocha(oOpts))
    .on("error", function() {
      console.log(oChalk.red(`Test failed`));
    })
};
