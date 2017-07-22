#!/bin/bash -ev

pushd ./installs
wget --quiet https://services.gradle.org/distributions/gradle-2.10-bin.zip
unzip gradle-2.10-bin.zip

wget --quiet http://dl.google.com/android/android-sdk_r24.4.1-linux.tgz
tar -xvf android-sdk_r24.4.1-linux.tgz
popd
