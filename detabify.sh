#!/bin/sh

for iter in ./js_modules/*.js
do
    sed 's/\t/    /g' "${iter}" > filename.notabs && mv filename.notabs "${iter}"
done
