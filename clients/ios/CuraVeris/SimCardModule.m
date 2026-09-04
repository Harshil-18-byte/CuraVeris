#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#endif

#ifdef RCT_EXTERN_MODULE
RCT_EXTERN_MODULE(SimCardModule, NSObject)

RCT_EXTERN_METHOD(
  getSimCards:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

@end
#endif
