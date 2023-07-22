"use strict";

import oCSS from "./gtCSS";
import oGulp from "gulp";
import oHTML from "./gtHTML";
import oImages from "./gtImages";
import oScripts from "./gtScripts";
import oTests from "./gtTests";

const aImageFiles = [
  "dev/images/**/*.gif",
  "dev/images/**/*.ico",
  "dev/images/**/*.jpg",
  "dev/images/**/*.png"
];
const aScriptFiles = [
  "dev/*.php",
  "dev/common_pages/*.php",
  "dev/scripts/**/*.php",
  "dev/*.ts",
  "dev/scripts/**/*.ts",
  "mocha/**/*.test.ts"
];
const nPortNumber = 8000+Math.floor(Math.random()*1000)

export default async function fpWatchTask(){
  oWebServer.create("Test_Server");
  oPHP.server({
    base:'test',
    port:nPortNumber
  });
  oWebServer.init({proxy:"localhost:"+nPortNumber.toString()});
  oGulp.watch("dev/common_pages/*.html",oGulp.parallel(oHTML));
  oGulp.watch("dev/pdfs/**/*",oGulp.parallel(oPDF));
  oGulp.watch("dev/robots.txt",oGulp.parallel(oRobot));
  oGulp.watch(aImageFiles,oGulp.parallel(oImages));
  oGulp.watch("dev/styles/*",oGulp.parallel(oCSS));
  oGulp.watch(
    aScriptFiles,
    oGulp.parallel(
      oGulp.series(
        oTests,
        oScripts
      )
    )
  );
  oGulp.watch("test/**/*",).on("change",oWebServer.reload);
  return;
};
