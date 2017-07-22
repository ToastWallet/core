#!/bin/bash

export GRADLE_OPTS=-Dorg.gradle.native=false

if uname -a | grep -q -i darwin; then
    export JAVA_HOME=$(/usr/libexec/java_home)
    export ANDROID_NDK=/usr/local/opt/android-ndk
    export ANDROID_NDK_HOME=/usr/local/opt/android-ndk
    export ANDROID_SDK=/usr/local/opt/android-sdk
    export ANDROID_HOME=/usr/local/opt/android-sdk
else
    export NDK_ROOT=`pwd`/installs/android-ndk-r10e
    export PATH=`pwd`/installs/gradle-2.10/bin:`pwd`/installs/android-sdk-linux/tools:`pwd`/installs/android-toolchain/bin:${NDK_ROOT}:$PATH
    export PATH=${NDK_ROOT}:$PATH
    export JAVA_HOME=/usr/lib/jvm/java-8-oracle
    export ANDROID_NDK_HOME=${NDK_ROOT}
    export ANDROID_HOME=`pwd`/installs/android-sdk-linux
fi

