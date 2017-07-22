#!/bin/bash

. ./setenv.sh

pushd jni
./compile.sh
popd

mvn -q clean install
./singleTest.sh
