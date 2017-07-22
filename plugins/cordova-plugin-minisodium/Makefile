GET_DEPENDENCIES = false

.PHONY: ios android get-externals rebuild clearall distclean distclean-ios distclean-android

ios: src/libsodium-ios/

android: src/libsodium-jni/libsodium-jni-release.aar

src/libsodium-ios/: libsodium/libsodium-ios
	cp -r libsodium/libsodium-ios src/

libsodium/libsodium-ios/: libsodium/autogen.sh
	pushd libsodium && ./autogen.sh && ./dist-build/ios.sh

src/libsodium-jni/libsodium-jni-release.aar: libsodium-jni/build/outputs/aar/libsodium-jni-release.aar
	cp libsodium-jni/build/outputs/aar/libsodium-jni-release.aar src/libsodium-jni/libsodium-jni-release.aar

libsodium-jni/build/outputs/aar/libsodium-jni-release.aar: libsodium-jni/build.sh
	cd libsodium-jni && \
	./build.sh && \
	./build-kaliumjni.sh && \
	./build-libsodiumjni.sh

libsodium/autogen.sh:
	if [ -d libsodium ]; then
		get-externals
	fi
	echo "libsodium has been cloned"

libsodium-jni/build.sh:
	if [ -d libsodium-jni ]; then
		make get-externals
	fi
	echo "libsodium-jni has been cloned"

get-externals:
	git submodule init
	git submodule sync
	git submodule update --recursive
ifeq ($(GET_DEPENDENCIES), true)
	cd libsodium-jni && \
	if [ uname -a | grep -q -i darwin ]; then \
		./dependencies-mac.sh \
	else \
		./dependencies-linux.sh \
	fi
endif

rebuild: distclean ios android

clearall:
	rm -rf libsodium
	rm -rf libsodium-jni

distclean: distclean-ios distclean-android

distclean-ios:
	rm -rf src/libsodium-ios
	cd libsodium && make distclean

distclean-android:
	rm -rf src/libsodium-android
	cd libsodium-jni && \
	rm -rf build && \
	rm -rf libs && \
	rm -rf obj && \
	rm -rf target && \
	rm -f *.key
