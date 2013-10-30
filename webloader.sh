#!/bin/bash

#git log | grep 'commit' -m 1 | nodejs -e "process.stdout.write(require('fs').readFileSync('/dev/stdin').toString().replace(/^commit (.+)[\r\n]+$/,'\$1'));" > ./bin/commit-stable

#echo -n / > bin/slash
#echo -n https://raw.github.com/ArchZombie/ZVxScripts/ > bin/basepath
#cat bin/basepath bin/commit-stable bin/slash > bin/baseurl
git ls-files js_modules/* > bin/filelist

cd tools
nodejs packager.js
cd ../

git commit bin -m 'Package version update'
git push
