import Foundation
import CoreTelephony

/// SimCardHelper - Reads active SIM/carrier information for OTP pre-population.
/// Pure Swift utility — no Objective-C bridge needed in native SwiftUI app.
struct SimCardInfo {
    let slotKey: String
    let carrierName: String
    let mobileCountryCode: String
    let mobileNetworkCode: String
    let isoCountryCode: String
    let allowsVOIP: Bool
}

class SimCardHelper {

    static func getActiveCarriers() -> [SimCardInfo] {
        let networkInfo = CTTelephonyNetworkInfo()
        var results: [SimCardInfo] = []

        if let providers = networkInfo.serviceSubscriberCellularProviders {
            for (key, carrier) in providers {
                results.append(SimCardInfo(
                    slotKey: key,
                    carrierName: carrier.carrierName ?? "",
                    mobileCountryCode: carrier.mobileCountryCode ?? "",
                    mobileNetworkCode: carrier.mobileNetworkCode ?? "",
                    isoCountryCode: carrier.isoCountryCode ?? "",
                    allowsVOIP: carrier.allowsVOIP
                ))
            }
        }

        return results
    }

    static func primaryPhoneCarrierName() -> String? {
        getActiveCarriers().first?.carrierName
    }
}
