import Foundation
import CoreTelephony

@objc(SimCardModule)
class SimCardModule: NSObject {

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func getSimCards(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let networkInfo = CTTelephonyNetworkInfo()

    var simCards: [[String: Any]] = []

    if let providers = networkInfo.serviceSubscriberCellularProviders {
      for (key, carrier) in providers {
        var simInfo: [String: Any] = [:]
        simInfo["slotKey"] = key
        simInfo["carrierName"] = carrier.carrierName ?? ""
        simInfo["mobileCountryCode"] = carrier.mobileCountryCode ?? ""
        simInfo["mobileNetworkCode"] = carrier.mobileNetworkCode ?? ""
        simInfo["isoCountryCode"] = carrier.isoCountryCode ?? ""
        simInfo["allowsVOIP"] = carrier.allowsVOIP
        simInfo["number"] = ""
        simCards.append(simInfo)
      }
    }

    resolve(simCards)
  }
}
