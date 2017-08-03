# cordova-build-architecture
This plugin allows you to build your application for arm (or x86) only.
# Why?
Plugins like cordova-plugin-crosswalk-webview (https://github.com/crosswalk-project/cordova-plugin-crosswalk-webview) create two or more .apk files with one build. On Phonegap Build, you can only download one file which leads to problems if you want to get access to the other .apks.

Maybe you simply need to build for one architecture because of other reasons? This plugin might help you :-)

# Usage
Include this plugin in your config.xml:
```
<plugin name="cordova-build-architecture" spec="https://github.com/MBuchalik/cordova-build-architecture.git#v1.0.1" source="git" />
```

By default, it will try to produce arm builds only. If you want to target x86, add the following preference:
```
<preference name="buildArchitecture" value="x86" />
```

### Using with Crosswalk
If you use a version of crosswalk that is able to produce more than one .apk file, don't forget to add
```
<preference name="xwalkMultipleApk" value="true" />	
```


**Please note that this plugin is experimental.**
