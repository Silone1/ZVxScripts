#!/bin/sh

for iter in ./js_modules/*.js
do
    grep -q 'LEGAL NOTICE' $iter
    if [ $? -eq 0 ]
    then
        true
    else
        echo Update $iter
        cat copyright_template.txt $iter > tmp && mv tmp $iter
    fi
done
