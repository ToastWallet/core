[![Build Status](https://travis-ci.org/joshjdevl/libsodium-jni.svg)](https://travis-ci.org/joshjdevl/libsodium-jni)

# libsodium-jni - (Android) Java JNI binding to the Networking and Cryptography (NaCl) library 

A Java JNI binding (to allow for Java and Android integration) to [Networking and Cryptography](http://nacl.cr.yp.to/) library by [Daniel J. Bernstein](http://cr.yp.to/djb.html).

Credits to:
* [**Libsodium**](https://github.com/jedisct1/libsodium): author [Frank Denis](https://github.com/jedisct1) and [Contributors](https://github.com/jedisct1/libsodium/graphs/contributors)
* [**Kalium**](https://github.com/abstractj/kalium): author [abstractj](https://github.com/abstractj) and [Contributors](https://github.com/abstractj/kalium/graphs/contributors)
* [**Robosodium**](https://github.com/GerardSoleCa/Robosodium): author [GerardSoleCa](https://github.com/GerardSoleCa)
* [**libstodium**](https://github.com/ArteMisc/libstodium): author [ArteMisc](https://github.com/ArteMisc)


## Installation 

* Java package is under org.libsodium.jni

### Android Archive (AAR)
    <dependency>
        <groupId>com.github.joshjdevl.libsodiumjni</groupId>
        <artifactId>libsodium-jni-aar</artifactId>
        <version>1.0.2-SNAPSHOT</version>
        <type>aar</type>
    </dependency>

### Java Archive (JAR)

    <dependency>
        <groupId>com.github.joshjdevl.libsodiumjni</groupId>
        <artifactId>libsodium-jni</artifactId>
        <version>1.0.2-SNAPSHOT</version>
        <type>jar</type>
    </dependency>

### MacOS Installation

Install brew

Run [./build-mac.sh](build-mac.sh)

### Linux Installation

Run [./build-linux.sh](build-linux.sh)

###Docker Container

The docker container is available from [libsodium-jni](https://hub.docker.com/r/joshjdevl/libsodium-jni/) which is a Automated Build.

### Manual compilation and installation

Please refer to the [docker build](https://github.com/joshjdevl/libsodium-jni/blob/master/Dockerfile) for the commands used to build.
   
### Notes

[Docker container](https://hub.docker.com/r/joshjdevl/libsodium-jni/)


### Issues / Improvements / Help Seeked

libsodium-jni is a work in progress, feedback, bug reports and patches are always welcome.

Everything has been tested and working on ubuntu 12.04 32bit and 64 bit, macos, and Android

