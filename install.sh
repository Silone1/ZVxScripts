#!/bin/sh
if ! test -d "$1"
then
    exec echo Provide a directory to install to, e.g.: ./install.sh ../pokemon-online/bin
else
    install_to=$1
    echo Installing to $install_to
    cp -f `pwd`/scripts.js ${install_to}
    cp -f `pwd`/COPYING ${install_to}/ZSCRIPTS_COPYING
    if test -h ${install_to}/js_modules
    then
        rm ${install_to}/js_modules
    else
        if test -d ${install_to}/js_modules
        then
            echo wtf error
            exit
        fi
    fi
    ln -s `pwd`/js_modules ${install_to}/js_modules
    if ! test -d ${install_to}/js_databases
    then
        mkdir ${install_to}/js_databases
        
    fi
    echo NOTE Symbolic linked js_modules
fi
