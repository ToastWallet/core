#!/bin/bash -ev

./dependencies-mac.sh 

./build.sh

./build-kaliumjni.sh
./build-libsodiumjni.sh
