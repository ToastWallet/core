#!/bin/bash -ev

brew install libtool autoconf automake swig android-sdk android-ndk gradle libsodium maven

./update-android.sh
