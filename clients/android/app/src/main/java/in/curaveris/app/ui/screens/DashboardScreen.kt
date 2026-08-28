package in.curaveris.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import in.curaveris.app.CuraVerisApplication
import in.curaveris.app.core.network.ApiClient
import in.curaveris.app.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToLogin: () -> Unit = {}
) {
    val isOnline by CuraVerisApplication.networkMonitor.isConnected.collectAsState()
    val scope = rememberCoroutineScope()
    var isBackendHealthy by remember { mutableStateOf<Boolean?>(null) }
    val apiClient = remember { ApiClient() }

    LaunchedEffect(Unit) {
        scope.launch {
            val res = apiClient.checkHealth()
            isBackendHealthy = res.getOrDefault(false)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "⚖️ CuraVeris",
                            fontSize = 20.sp,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .background(
                                    if (isBackendHealthy == true) SuccessGreen.copy(alpha = 0.2f)
                                    else WarningAmber.copy(alpha = 0.2f),
                                    shape = RoundedCornerShape(12.dp)
                                )
                                .padding(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = if (isBackendHealthy == true) "● Healthy" else "● Checking",
                                fontSize = 11.sp,
                                color = if (isBackendHealthy == true) SuccessGreen else WarningAmber
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DarkSurface
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(DarkBackground)
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            if (!isOnline) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = DangerRed.copy(alpha = 0.2f)),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "⚡ Device is offline. Network requests will queue.",
                        color = DangerRed,
                        modifier = Modifier.padding(12.dp),
                        fontSize = 13.sp
                    )
                }
            }

            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Phase 6: Android Foundation Active",
                        fontSize = 16.sp,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Deterministic Statutory Audit & Section 65B Forensics ready for mobile bill capture.",
                        fontSize = 13.sp,
                        color = TextSecondary
                    )
                }
            }

            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Statutory Regulatory Checkpoints",
                        fontSize = 14.sp,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(text = "✓ NPPA Cardiac & Orthopedic Implant Ceilings", fontSize = 12.sp, color = SuccessGreen)
                    Text(text = "✓ DPCO 2013 NLEM Pharmaceutical MRP Caps", fontSize = 12.sp, color = SuccessGreen)
                    Text(text = "✓ CGHS 2024 Benchmark Procedure Tariffs", fontSize = 12.sp, color = SuccessGreen)
                    Text(text = "✓ IRDAI 199 Excluded Consumable Rules", fontSize = 12.sp, color = SuccessGreen)
                }
            }
        }
    }
}
