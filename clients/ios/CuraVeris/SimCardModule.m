#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(SimCardModule, NSObject)

RCT_EXTERN_METHOD(
  getSimCards:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

@end
