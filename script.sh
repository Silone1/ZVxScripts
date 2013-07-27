#!/bin/sh

for iter in ./*.js
do
    sed 's/script\./this\.script\./g' "${iter}" > tmp && mv tmp "${iter}"
done
