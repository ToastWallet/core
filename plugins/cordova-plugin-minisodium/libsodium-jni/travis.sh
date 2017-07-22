#!/bin/bash -ev

if [[ $TRAVIS_OS_NAME == 'osx' ]]; then
    #./build-mac.sh > /dev/null
    ./dependencies-mac.sh > /dev/null
    ./build.sh > /dev/null
    ./build-kaliumjni.sh > /dev/null
else
    ./build-linux.sh > /dev/null
fi
