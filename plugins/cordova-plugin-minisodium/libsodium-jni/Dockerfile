FROM ubuntu:precise
MAINTAINER joshjdevl < joshjdevl [at] gmail {dot} com>
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get install -y sudo
WORKDIR /installs/libsodium-jni
ADD . /installs/libsodium-jni
ADD settings.xml ~/.m2/settings.xml

RUN ./build-linux.sh
