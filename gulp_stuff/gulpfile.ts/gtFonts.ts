"use strict";

import oGulp from "gulp";
import oNewer from "gulp-newer";

export default function fpFontTask(){
  return oGulp.src("dev/fonts/*.*")
    .pipe(oNewer({dest:"test/fonts/"}))
    .pipe(oGulp.dest("test/fonts/"));
};
