"use strict";

import {bIsProd} from "./index";
import oFS from "fs";
import oGulp from "gulp";
import oGulpIf from "gulp-if";
import oHTMLLint from "gulp-htmlhint";
import oMinHTML from "gulp-htmlmin";
import oNewer from "gulp-newer";
import oSourceMaps from "gulp-sourcemaps";

const oHTMLMinOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeEmptyElements: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  sortAttributes: true,
  sortClassName: true,
  useShortDoctype: true
};

export default function fpHTMLTask(){
  return oGulp.src(["dev/common_pages/*.html","!dev/common_pages/email_template_*.html"])
    .pipe(oNewer({dest:"test/common_pages"}))
    .pipe(oGulpIf(!bIsProd,oSourceMaps.init()))
    .pipe(oHTMLLint(".htmlhintrc"))
    .pipe(oHTMLLint.reporter())
    .pipe(oHTMLLint.failOnError({suppress: true}))
    .pipe(oGulp.src("dev/common_pages/email_template_*.html"))
    .pipe(oNewer({dest:"test/common_pages"}))
    .pipe(oMinHTML(oHTMLMinOptions))
    .pipe(oGulpIf(!bIsProd,oSourceMaps.write("../maps")))
    .pipe(oGulp.dest("test/common_pages"));
}
