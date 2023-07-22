"use strict";

import oCSS from "./gtCSS";
import oDel from "del";
import oFont from "./gtFonts";
import oGulp from "gulp";
import oHTML from "./gtHTML";
import oImages from "./gtImages";
import oScripts from "./gtScripts";
import oTests from "./gtTests";
import oVendor from "./gtVendorScripts";

export default oGulp.series(
  async () => oDel(["test"]),
  oGulp.parallel(
    oCSS,
    oFont,
    oHTML,
    oImages,
    oVendor,
    oGulp.series(
      oTests,
      oScripts
    )
  )
);
