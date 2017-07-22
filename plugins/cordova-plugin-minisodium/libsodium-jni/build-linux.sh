#!/bin/bash -ev

./dependencies-linux.sh
./build.sh

./build-kaliumjni.sh
./build-libsodiumjni.sh
