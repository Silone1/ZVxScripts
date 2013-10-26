var fs = require('fs');

var flist = fs.readFileSync(process.cwd() +"/../bin/filelist").toString().split(/\n/g);
var fdata = new Object;

for (var x in flist) if(flist[x])
    try
    {
        fdata[flist[x]] = fs.readFileSync(process.cwd() + "/../" + flist[x]).toString();
    }catch(e) {console.log("e  " + e);
              console.log(process.cwd() + "/../" + flist[x]);
              }

var fdout = "";


var output =
    "(function () {\n"+
    "    try{sys.rm('js_modules');}catch(_){}\n" +
    "    sys.mkdir('js_modules');\n" +
    "    var fdata = " + JSON.stringify(fdata, 1, " ") +";\n"+
    "    for (var x in fdata) sys.write(x, fdata[x]);\n"+
    "    return sys.exec('js_modules/main.js');\n" +
    "})();";

fs.writeFileSync(process.cwd() + "/../bin/package.js", output);
