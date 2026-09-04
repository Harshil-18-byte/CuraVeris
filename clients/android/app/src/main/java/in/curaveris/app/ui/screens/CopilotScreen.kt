package `in`.curaveris.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import `in`.curaveris.app.ui.theme.*

data class ChatItem(
    val id: String,
    val sender: String,
    val text: String,
    val citation: String? = null
)

@Composable
fun CopilotScreen(
    onNavigateToDispute: () -> Unit = {}
) {
    var queryText by remember { mutableStateOf("") }
    var chatHistory by remember {
        mutableStateOf(
            listOf(
                ChatItem(
                    id = "1",
                    sender = "Legal AI",
                    text = "Welcome to CuraVeris Statutory Patient Advocate. All advice is verified against NPPA DPCO 2013 and CGHS 2024 Gazette tariffs.",
                    citation = "Section 65B Certified"
                )
            )
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp)
    ) {
        Text(
            text = "Statutory Patient Advocate AI",
            color = TextPrimary,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Ground truth compliance and legal overcharge defense",
            color = TextSecondary,
            fontSize = 12.sp,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(chatHistory, key = { it.id }) { item ->
                Surface(
                    color = if (item.sender == "User") PrimaryEmerald.copy(alpha = 0.15f) else CardBackground,
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (item.sender == "User") PrimaryEmerald.copy(alpha = 0.4f) else BorderDark
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = item.sender,
                            color = if (item.sender == "User") PrimaryEmerald else SecondaryCyan,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = item.text,
                            color = TextPrimary,
                            fontSize = 13.sp
                        )
                        if (item.citation != null) {
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "STATUTORY CITATION: ${item.citation}",
                                color = SecondaryCyan,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = queryText,
                onValueChange = { queryText = it },
                placeholder = { Text("Ask legal billing question...", color = TextMuted, fontSize = 13.sp) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(8.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = CardBackground,
                    unfocusedContainerColor = CardBackground,
                    focusedBorderColor = PrimaryEmerald,
                    unfocusedBorderColor = BorderDark,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                )
            )

            Spacer(modifier = Modifier.width(8.dp))

            Button(
                onClick = {
                    if (queryText.isNotBlank()) {
                        val userItem = ChatItem(id = "${System.currentTimeMillis()}", sender = "User", text = queryText)
                        val aiItem = ChatItem(
                            id = "${System.currentTimeMillis() + 1}",
                            sender = "Legal AI",
                            text = "Analyzing query against NPPA S.O. 1335(E) and Consumer Protection Act 2019 Section 2(47). Charges exceeding statutory ceilings are legally non-payable.",
                            citation = "DPCO 2013 Para 24"
                        )
                        chatHistory = chatHistory + userItem + aiItem
                        queryText = ""
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryEmerald),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Send", color = Color.Black, fontWeight = FontWeight.Bold)
            }
        }
    }
}
