"use strict";

import {bIsProd} from "./index";
import oChalk from "chalk";
import oESLint from "gulp-eslint-new";
import oFS from "fs";
import oGulp from "gulp";
import oGulpIf from "gulp-if";
import oHeader from "gulp-header";
import oNewer from "gulp-newer";
import oSourceMaps from "gulp-sourcemaps";
import oTS from "gulp-typescript";

const oTSOptions = {
  allowUnreachableCode: false,
  allowUnusedLabels: false,
  esModuleInterop: true,
  exactOptionalPropertyTypes: true,
  forceConsistentCasingInFileNames: true,
  lib: ["es2021","dom"],
  module: "commonjs",
  noFallthroughCasesInSwitch: true,
  noImplicitOverride: true,
  noImplicitReturns: true,
  noPropertyAccessFromIndexSignature: true,
  noUncheckedIndexedAccess: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  removeComments: true,
  skipLibCheck: true,
  strictNullChecks: true,
  strict: true,
  target: "es2021"
};

export default oGulp.parallel(
  fpPHPTask(""),
  fpPHPTask("common_pages/"),
  fpPHPTask("scripts/common/"),
  fpPHPTask("scripts/peregrineit/"),
  fpTSTask("scripts/common/"),
  fpTSTask("scripts/peregrineit/")
);

function fpPHPTask(sDir:string){
  return async function(){
    return oGulp.src("dev/"+sDir+"*.php")
      .pipe(oNewer({dest:"test/"+sDir}))
      .pipe(oGulp.dest("test/"+sDir));
  };
};

function fpTSTask(sDir:string){
  return async function(){
    return oGulp.src("dev/"+sDir+"*.ts")
      .pipe(oNewer({dest:"test/"+sDir}))
      .pipe(oGulpIf(!bIsProd,oSourceMaps.init()))
      .pipe(oESLint(".eslintrc.json"))
      .pipe(oESLint.format())
      .pipe(oESLint.results(oResults => {
        console.log(oChalk.green(`Total Flies 'ESLinted' (${sDir}): ${oResults.length}`));
        if (oResults.warningCount !== 0){
          console.log(oChalk.yellow(`Total ESLint Warnings (${sDir}): ${oResults.warningCount} (${oResults.fixableWarningCount} fixable)`));
        };
        if (oResults.errorCount !== 0){
          console.log(oChalk.red(`Total ESLint Errors (${sDir}): ${oResults.errorCount} (${oResults.fixableErrorCount} fixable, ${oResults.fatalErrorCount} fatal)`));
        };
      }))
      .pipe(oTS(oTSOptions))
      .pipe(oGulpIf(!bIsProd,oSourceMaps.write("../../maps")))
      .pipe(oGulp.dest("test/"+sDir));
  };
};
