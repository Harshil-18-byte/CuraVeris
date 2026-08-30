# CuraVeris Android Mobile Client

Native Android client integration and APK build workspace for CuraVeris.

## Architectural Overview
- **UI System**: Jetpack Compose & Material 3 Dark Theme matching the CuraVeris solid matte design system.
- **Backend Communication**: Retrofit 2 / OkHttp with JWT token rotation and AES-128 encrypted PII payloads.
- **Inference Gateway**: Connects to `MobileInferencePipeline` via `/api/v1/bills/upload` or on-device ONNX Runtime NNAPI acceleration.
- **Evidence Integrity**: Renders Section 65B SHA-256 verification hash chains for generated dispute letters.

## Build Commands
```bash
# Build debug APK
./gradlew assembleDebug

# Run unit tests
./gradlew test
```
