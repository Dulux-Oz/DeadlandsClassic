"use strict";

import oGulp from "gulp";
import oNewer from "gulp-newer";

export default oGulp.parallel(
  fpImageTask("gif","common"),
  fpImageTask("gif","peregrineit"),
  fpImageTask("ico","common"),
  fpImageTask("ico","peregrineit"),
  fpImageTask("jpg","common"),
  fpImageTask("jpg","peregrineit"),
  fpImageTask("png","common"),
  fpImageTask("png","peregrineit")
);

function fpImageTask(sExt:string,sDir:string){
  return async function(){
    let sLocalDir = sDir;
    if (sLocalDir !== "") {
      sLocalDir = sDir+"/";
    };
    return oGulp.src("dev/images/"+sLocalDir+"*."+sExt)
      .pipe(oNewer({dest:"test/images/"+sLocalDir}))
      .pipe(oGulp.dest("test/images/"+sLocalDir));
  };
};
