#ifndef CuraVeris_Bridging_Header_h
#define CuraVeris_Bridging_Header_h

#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTRootView.h>
#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#import "RCTViewManager.h"
#import "RCTEventEmitter.h"
#import "RCTRootView.h"
#import "RCTLog.h"
#import "RCTUtils.h"
#endif

#endif
