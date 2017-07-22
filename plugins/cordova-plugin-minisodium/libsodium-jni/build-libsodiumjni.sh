#!/bin/bash -ev

. ./setenv.sh

export ANDROID_HOME=$(dirname $(dirname $(which android)))
export ANDROID_SDK=$(dirname $(dirname $(which android)))
export ANDROID_NDK=/usr/lib/android-ndk
export ANDROID_NDK_HOME=/usr/lib/android-ndk

ndk-build
rm -rf src/main/jniLibs/
cp -R libs src/main/jniLibs
gradle build
