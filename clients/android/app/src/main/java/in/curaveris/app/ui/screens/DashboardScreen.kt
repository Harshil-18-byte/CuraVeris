package `in`.curaveris.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import `in`.curaveris.app.CuraVerisApplication
import `in`.curaveris.app.core.network.ApiClient
import `in`.curaveris.app.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun DashboardScreen(
    onNavigateToScan: () -> Unit = {},
    onNavigateToDisputes: () -> Unit = {},
    onNavigateToCopilot: () -> Unit = {},
    onNavigateToTariffs: () -> Unit = {},
    onNavigateToHub: () -> Unit = {},
    onNavigateToFinancialRisk: () -> Unit = {}
) {
    val isOnline by CuraVerisApplication.networkMonitor.isConnected.collectAsState()
    val scope = rememberCoroutineScope()
    var isBackendHealthy by remember { mutableStateOf<Boolean?>(null) }
    val apiClient = remember { ApiClient() }

    // Live Calculator State matching Web
    var billAmount by remember { mutableDoubleStateOf(350000.0) }
    var hasStent by remember { mutableStateOf(true) }
    var hasDuplicateIcu by remember { mutableStateOf(true) }
    var hasPharmacyMarkup by remember { mutableStateOf(true) }

    val estimatedSavings = remember(billAmount, hasStent, hasDuplicateIcu, hasPharmacyMarkup) {
        var s = 0.0
        if (hasStent) s += 34920.0
        if (hasDuplicateIcu) s += 22500.0
        if (hasPharmacyMarkup) s += (billAmount * 0.08)
        minOf(s, billAmount * 0.45)
    }

    LaunchedEffect(Unit) {
        scope.launch {
            val res = apiClient.checkHealth()
            isBackendHealthy = res.getOrDefault(false)
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Master Screen Hub Header
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, PrimaryBlue.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                    .clickable { onNavigateToHub() }
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "ALL SCREENS & MODULES",
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                color = PrimaryBlue
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .background(SuccessGreen.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text("30+ SCREENS", fontSize = 9.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = SuccessGreen)
                            }
                        }
                        Spacer(modifier = Modifier.height(3.dp))
                        Text("Browse Registries, Burn Rate, 65B Ledger, Legal Redress", fontSize = 11.sp, color = TextSecondary)
                    }
                    Text("EXPLORE ->", fontSize = 11.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = PrimaryCyan)
                }
            }
        }

        // Network status warning if offline
        if (!isOnline) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = DangerRed.copy(alpha = 0.15f)),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, DangerRed.copy(alpha = 0.4f), RoundedCornerShape(10.dp))
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.WifiOff, contentDescription = null, tint = DangerRed)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Offline Mode: Statutory benchmark lookups cached locally.",
                            color = DangerRed,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }

        // Hero Metric Cards Grid (3-card financial snapshot)
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        modifier = Modifier.weight(1f),
                        title = "TOTAL BILLED",
                        value = "₹3,50,000",
                        subtitle = "Gross Inpatient",
                        accentColor = TextPrimary
                    )
                    MetricCard(
                        modifier = Modifier.weight(1f),
                        title = "SAVINGS DETECTED",
                        value = "₹${"%,d".format(estimatedSavings.toInt())}",
                        subtitle = "${((estimatedSavings / billAmount) * 100).toInt()}% Overcharged",
                        accentColor = SuccessGreen
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        modifier = Modifier.weight(1f),
                        title = "FAIR ESTIMATE",
                        value = "₹${"%,d".format((billAmount - estimatedSavings).toInt())}",
                        subtitle = "Statutory True Cost",
                        accentColor = PrimaryCyan
                    )
                    MetricCard(
                        modifier = Modifier.weight(1f),
                        title = "RISK SCORE",
                        value = "78 / 100",
                        subtitle = "ELEVATED RISK",
                        accentColor = DangerRed
                    )
                }
            }
        }

        // Quick Action Bar - 4 Major Pillars
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onNavigateToScan,
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Scan & Audit", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }

                    Button(
                        onClick = onNavigateToTariffs,
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = DarkSurface),
                        border = ButtonDefaults.outlinedButtonBorder.copy(
                            brush = Brush.horizontalGradient(listOf(DarkBorder, DarkBorder))
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Statutory Tariffs", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = PrimaryCyan)
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onNavigateToFinancialRisk,
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = DarkSurface),
                        border = ButtonDefaults.outlinedButtonBorder.copy(
                            brush = Brush.horizontalGradient(listOf(DarkBorder, DarkBorder))
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Burn Rate & FRM", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = WarningAmber)
                    }

                    Button(
                        onClick = onNavigateToDisputes,
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = DarkSurface),
                        border = ButtonDefaults.outlinedButtonBorder.copy(
                            brush = Brush.horizontalGradient(listOf(DarkBorder, DarkBorder))
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Legal Redress", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = SuccessGreen)
                    }
                }
            }
        }

        // Statutory Enforcement Status Banner
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "STATUTORY TARIFF INTEGRITY",
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            color = PrimaryCyan
                        )
                        Box(
                            modifier = Modifier
                                .background(SuccessGreen.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "ACTIVE",
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                color = SuccessGreen
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    StatutoryBadgeRow(tag = "NPPA CAP", text = "DES Stent capped at ₹30,080 + GST", isOk = true)
                    Spacer(modifier = Modifier.height(6.dp))
                    StatutoryBadgeRow(tag = "DPCO 2013", text = "NLEM Medicine MRP Caps Enforcement", isOk = true)
                    Spacer(modifier = Modifier.height(6.dp))
                    StatutoryBadgeRow(tag = "CGHS 2024", text = "1,900+ Standard Procedure Benchmarks", isOk = true)
                    Spacer(modifier = Modifier.height(6.dp))
                    StatutoryBadgeRow(tag = "IRDAI 199", text = "Non-payable consumable unbundling audit", isOk = true)
                }
            }
        }

        // Interactive Overcharge Estimator (Matches Web Landing Calculator)
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Calculate, contentDescription = null, tint = PrimaryCyan, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Interactive Savings Estimator",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Estimate potential overcharge deductions instantly based on statutory rules.",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Gross Bill Amount: ₹${"%,d".format(billAmount.toInt())}",
                        fontSize = 13.sp,
                        fontFamily = FontFamily.Monospace,
                        color = TextPrimary
                    )
                    Slider(
                        value = billAmount.toFloat(),
                        onValueChange = { billAmount = it.toDouble() },
                        valueRange = 50000f..1000000f,
                        steps = 19,
                        colors = SliderDefaults.colors(
                            thumbColor = PrimaryBlue,
                            activeTrackColor = PrimaryBlue,
                            inactiveTrackColor = DarkBorder
                        )
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Toggle Options
                    CheckboxRow(
                        label = "Coronary Stent / Knee Implant Included",
                        checked = hasStent,
                        onCheckedChange = { hasStent = it }
                    )
                    CheckboxRow(
                        label = "Overlapping ICU & Nursing charges",
                        checked = hasDuplicateIcu,
                        onCheckedChange = { hasDuplicateIcu = it }
                    )
                    CheckboxRow(
                        label = "In-house Pharmacy Markup above DPCO",
                        checked = hasPharmacyMarkup,
                        onCheckedChange = { hasPharmacyMarkup = it }
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(DarkCard, RoundedCornerShape(8.dp))
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Estimated Recovery", fontSize = 11.sp, color = TextSecondary)
                            Text(
                                text = "₹${"%,d".format(estimatedSavings.toInt())}",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = SuccessGreen
                            )
                        }
                        Button(
                            onClick = onNavigateToDisputes,
                            colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text("Draft Notice", fontSize = 12.sp, color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MetricCard(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    subtitle: String,
    accentColor: Color
) {
    Card(
        modifier = modifier.border(1.dp, DarkBorder, RoundedCornerShape(10.dp)),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        shape = RoundedCornerShape(10.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = title,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                color = TextSecondary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold,
                color = accentColor
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                fontSize = 11.sp,
                color = TextMuted
            )
        }
    }
}

@Composable
fun StatutoryBadgeRow(tag: String, text: String, isOk: Boolean) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .background(if (isOk) SuccessGreen.copy(alpha = 0.15f) else DangerRed.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                .border(1.dp, if (isOk) SuccessGreen.copy(alpha = 0.4f) else DangerRed.copy(alpha = 0.4f), RoundedCornerShape(4.dp))
                .padding(horizontal = 6.dp, vertical = 2.dp)
        ) {
            Text(
                text = "[$tag]",
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                color = if (isOk) SuccessGreen else DangerRed
            )
        }
        Spacer(modifier = Modifier.width(8.dp))
        Text(text = text, fontSize = 12.sp, color = TextSecondary)
    }
}

@Composable
fun CheckboxRow(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCheckedChange(!checked) }
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = CheckboxDefaults.colors(
                checkedColor = PrimaryBlue,
                uncheckedColor = DarkBorder,
                checkmarkColor = Color.White
            )
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(text = label, fontSize = 12.sp, color = TextPrimary)
    }
}
