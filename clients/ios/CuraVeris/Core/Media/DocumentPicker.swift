import SwiftUI
import UniformTypeIdentifiers

/**
 * SwiftUI Wrapper for UIDocumentPickerViewController for Medical Invoices & Summaries.
 */
public struct DocumentPicker: UIViewControllerRepresentable {
    public var onDocumentPicked: (URL) -> Void

    public init(onDocumentPicked: @escaping (URL) -> Void) {
        self.onDocumentPicked = onDocumentPicked
    }

    public func makeUIViewController(context: Context) -> UIDocumentPickerViewController {
        let types: [UTType] = [.pdf, .png, .jpeg]
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: types, asCopy: true)
        picker.delegate = context.coordinator
        picker.allowsMultipleSelection = false
        return picker
    }

    public func updateUIViewController(_ uiViewController: UIDocumentPickerViewController, context: Context) {}

    public func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    public class Coordinator: NSObject, UIDocumentPickerDelegate {
        let parent: DocumentPicker

        init(_ parent: DocumentPicker) {
            self.parent = parent
        }

        public func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
            guard let url = urls.first else { return }
            parent.onDocumentPicked(url)
        }
    }
}
