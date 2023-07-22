"use strict";

import {bIsProd} from "./index";
import oAutoPrefixer from "autoprefixer";
import oCSSNano from "cssnano";
import oFS from "fs";
import oGulp from "gulp";
import oGulpIf from "gulp-if";
import oLess from "gulp-less";
import oLessLint from "gulp-lesshint";
import oNewer from "gulp-newer";
import oPostCSS from "gulp-postcss";
import oSourceMaps from "gulp-sourcemaps";

const aPostCSSPlugins = [
  oAutoPrefixer({grid: "no-autoplace"}),
  oCSSNano()
];

export default function fpCSSTask(){
  return oGulp.src(["styles/*","!styles/colours*.less"])
    .pipe(oNewer({dest:"C:/FVTT_Data/Data/systems/deadlands-classic/styles",ext:".css"}))
    .pipe(oGulpIf(!bIsProd,oSourceMaps.init()))
    .pipe(oLessLint())
    .pipe(oLessLint.reporter())
    .pipe(oLessLint.failOnError())
    .pipe(oLessLint.failOnWarning())
    .pipe(oLess())
    .pipe(oPostCSS(aPostCSSPlugins))
    .pipe(oGulpIf(!bIsProd,oSourceMaps.write("../maps")))
    .pipe(oGulp.dest("C:/FVTT_Data/Data/systems/deadlands-classic/styles"));
};
