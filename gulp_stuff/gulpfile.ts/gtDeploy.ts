"use strict";

//Testing
import oChalk from "chalk";

import oGulp from 'gulp';
import oSCP from 'gulp-scp3';

const oDestHost = {
  host: '10.0.1.46',
  username: 'gulpdeploy',
  password: 'q4kpl6S9DixfOdg3q6P4vrwXohtaRmsI',
  dest: ''
};

export default async function fpDeployTask(){
console.log(oChalk.yellow("Got to oDeploy Start"));
  fpDeployWebsite();
console.log(oChalk.yellowBright.bgRed("oDeploy NOT COMPLETE"));
console.log(oChalk.yellow("Got to oDeploy End"));
  return;
};

function fpDeployWebsite(){
  fpDeployDirectory("");
  fpDeployDirectory("common_pages");
  fpDeployDirectory("downloads/common");
  fpDeployDirectory("downloads/ShortSitename");
  fpDeployDirectory("fonts");
  fpDeployDirectory("images/common");
  fpDeployDirectory("images/ShortSitename");
  fpDeployDirectory("pdfs/common");
  fpDeployDirectory("pdfs/ShortSitename");
  fpDeployDirectory("scripts/common");
  fpDeployDirectory("scripts/ShortSitename");
  fpDeployDirectory("sites/FullSitename");
  fpDeployDirectory("styles");
  return;
};

function fpDeployDirectory(sDir){
  let sLocalDir = sDir;
  if (sLocalDir !== "") {
    sLocalDir = sDir+"/";
  };
//  oDestHost.dest = sDir;
return;
/*
  return oGulp.src("test/"sDir+"*.*")
    .pipe(oGulp.dest("prod/"+sDir))
    .pipe(oSCP(oDestHost))
    .on('error', function(err) {
      console.log(err);
    });
//*/
};//
