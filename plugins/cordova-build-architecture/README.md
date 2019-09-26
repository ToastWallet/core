# cordova-build-architecture
This plugin allows you to build your application for arm (or x86) only.
# Why?
Plugins like cordova-plugin-crosswalk-webview (https://github.com/crosswalk-project/cordova-plugin-crosswalk-webview) create two or more .apk files with one build. On Phonegap Build, you can only download one file which leads to problems if you want to get access to the other .apks.

Also, the Crosswalk plugin sometimes creates a combined arm/x86 file on Phonegap Build even if you set the preference *xwalkMultipleApk* to *true*.

Maybe you simply need to build for one architecture because of other reasons? This plugin might help you :-)

# Usage
Include this plugin in your config.xml:
```xml
<plugin name="cordova-build-architecture" spec="https://github.com/MBuchalik/cordova-build-architecture.git#v1.0.4" source="git" />
```

By default, it will try to produce arm builds only. If you want to target x86, add the following preference:
```xml
<preference name="buildArchitecture" value="x86" />
```

## Advanced configuration
Crosswalk also allows you to generate 64 bit builds. This is usually done via a command line parameter, but also seems to be possible using the following preference:
```xml
<preference name="xwalk64bit" value="true" />
```

If you want to fetch the 64 bit arm build, simply use use
```xml
<preference name="buildArchitecture" value="arm64" />
```
For the 64 bit x86 build, you have to specify the following value:
```xml
<preference name="buildArchitecture" value="x86_64" />
```

## Summary
The following values can be used in our ```buildArchitecture``` preference:

| target platform | value | should the xwalk64bit preference be set (to true)? |
| -------- | ----- | ----------------------------- |
| arm      | arm   | :x: |
| arm: 64 bit | arm64 | :white_check_mark: |
| x86      | x86   | :x: |
| x86: 64 bit | x86_64 | :white_check_mark: |

**Please note that this plugin is experimental.**
