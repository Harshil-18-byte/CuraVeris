# CuraVeris iOS Mobile Client

Native iOS client workspace and Xcode project definitions for CuraVeris.

## Architectural Overview
- **UI Framework**: SwiftUI with iOS Cupertino styling and zero-gradient solid dark surfaces.
- **Backend Communication**: URLSession with async/await, bearer token authorization, and single-use refresh token rotation.
- **Local Machine Learning**: CoreML quantization models for offline receipt OCR extraction and statutory rate cross-referencing.
- **Compliance & Security**: Integrated DPDP Act 2023 consent flows and Section 65B hash certificate displays.

## Build Setup
Configured via XcodeGen (`project.yml`):
```bash
# Generate Xcode project
xcodegen generate
```
