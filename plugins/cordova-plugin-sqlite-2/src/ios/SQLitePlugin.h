/*
 * Author: Nolan Lawson
 * License: Apache 2
 */

#import <Cordova/CDVPlugin.h>

struct sqlite3; // remove dep on sqlite3.h in this .h file

@interface SQLitePlugin : CDVPlugin {
}

@property (nonatomic, copy) NSMutableDictionary *cachedDatabases;

-(void) exec: (CDVInvokedUrlCommand *)command;

@end
