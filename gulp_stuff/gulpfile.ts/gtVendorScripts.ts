"use strict";

import oGulp from "gulp";
import oNewer from "gulp-newer";

export default function fpVendorScriptsTask(){
  return oGulp.src("dev/scripts/vendor/*")
    .pipe(oNewer({dest:"test/scripts/vendor/"}))
    .pipe(oGulp.dest("test/scripts/vendor/"));
};
