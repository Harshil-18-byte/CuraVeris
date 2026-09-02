package `in`.curaveris.app.core.media

import androidx.activity.result.contract.ActivityResultContracts

/**
 * Camera and Document Selection Contracts.
 */
object MediaHelper {
    val documentPickerContract = ActivityResultContracts.OpenDocument()
    val imagePickerContract = ActivityResultContracts.GetContent()
    val cameraCaptureContract = ActivityResultContracts.TakePicture()

    val SUPPORTED_MIME_TYPES = arrayOf(
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg"
    )
}
