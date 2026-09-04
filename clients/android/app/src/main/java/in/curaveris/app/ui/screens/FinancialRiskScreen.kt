package `in`.curaveris.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FinancialRiskScreen(
    onBack: () -> Unit = {}
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var monthlyIncome by remember { mutableDoubleStateOf(75000.0) }
    var outOfPocketExpense by remember { mutableDoubleStateOf(180000.0) }
    var icuDays by remember { mutableDoubleStateOf(6.0) }
    val benchmarkIcuDays = 3.0

    val tabs = listOf("INPATIENT BURN RATE", "DSTI HARDSHIP", "4-WAY RECONCILIATION")

    // DSTI calculation
    val annualIncome = monthlyIncome * 12.0
    val hardshipRatio = (outOfPocketExpense / (annualIncome * 0.40)) * 100.0
    val dstiIndex = minOf(100.0, hardshipRatio)

    // Burn rate calculation
    val burnRateExcessDays = maxOf(0.0, icuDays - benchmarkIcuDays)
    val excessIcuCost = burnRateExcessDays * 18500.0

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("FINANCIAL FORENSICS & RISK", fontSize = 13.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = TextPrimary)
                        Text("Quantitative FRM & Inpatient Burn Rate", fontSize = 11.sp, color = TextSecondary)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkSurface)
            )
        },
        containerColor = DarkBackground
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(modifier = Modifier.height(10.dp))

            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = DarkSurface,
                contentColor = PrimaryCyan,
                divider = { Box(modifier = Modifier.height(1.dp).background(DarkBorder)) }
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = {
                            Text(
                                text = title,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal,
                                color = if (selectedTab == index) PrimaryCyan else TextSecondary
                            )
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            when (selectedTab) {
                0 -> {
                    // Inpatient Burn Rate Monitor
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, DarkBorder, RoundedCornerShape(10.dp)),
                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("ICMR Average Length of Stay (ALOS) Audit", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Detects prolonged bed-blocking or ICU stay inflation above clinical norms.", fontSize = 12.sp, color = TextSecondary)

                            Spacer(modifier = Modifier.height(16.dp))

                            Text("Billed ICU Days: ${icuDays.toInt()} days (Benchmark: ${benchmarkIcuDays.toInt()} days)", fontSize = 13.sp, fontFamily = FontFamily.Monospace, color = TextPrimary)
                            Slider(
                                value = icuDays.toFloat(),
                                onValueChange = { icuDays = it.toDouble() },
                                valueRange = 1f..15f,
                                steps = 13,
                                colors = SliderDefaults.colors(thumbColor = DangerRed, activeTrackColor = DangerRed, inactiveTrackColor = DarkBorder)
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(DarkCard, RoundedCornerShape(8.dp))
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Excess ICU Burn Rate", fontSize = 11.sp, color = TextSecondary)
                                    Text(
                                        text = "+${burnRateExcessDays.toInt()} Days (₹${"%,.0f".format(excessIcuCost)})",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (burnRateExcessDays > 0) DangerRed else SuccessGreen
                                    )
                                }
                                Box(
                                    modifier = Modifier
                                        .background(if (burnRateExcessDays > 0) DangerRed.copy(alpha = 0.2f) else SuccessGreen.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = if (burnRateExcessDays > 0) "[DEVIATION > 30%]" else "[WITHIN ALOS]",
                                        fontSize = 10.sp,
                                        fontFamily = FontFamily.Monospace,
                                        fontWeight = FontWeight.Bold,
                                        color = if (burnRateExcessDays > 0) DangerRed else SuccessGreen
                                    )
                                }
                            }
                        }
                    }
                }

                1 -> {
                    // DSTI Hardship & Income Shock Index
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, DarkBorder, RoundedCornerShape(10.dp)),
                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Debt Service-to-Income (DSTI) Distress", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Quantitative stress test estimating catastrophic household debt risk.", fontSize = 12.sp, color = TextSecondary)

                            Spacer(modifier = Modifier.height(16.dp))

                            Text("Monthly Household Income: ₹${"%,.0f".format(monthlyIncome)}", fontSize = 13.sp, fontFamily = FontFamily.Monospace, color = TextPrimary)
                            Slider(
                                value = monthlyIncome.toFloat(),
                                onValueChange = { monthlyIncome = it.toDouble() },
                                valueRange = 20000f..300000f,
                                steps = 27,
                                colors = SliderDefaults.colors(thumbColor = PrimaryBlue, activeTrackColor = PrimaryBlue, inactiveTrackColor = DarkBorder)
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            Text("Out-of-Pocket Liability: ₹${"%,.0f".format(outOfPocketExpense)}", fontSize = 13.sp, fontFamily = FontFamily.Monospace, color = TextPrimary)
                            Slider(
                                value = outOfPocketExpense.toFloat(),
                                onValueChange = { outOfPocketExpense = it.toDouble() },
                                valueRange = 20000f..500000f,
                                steps = 23,
                                colors = SliderDefaults.colors(thumbColor = PrimaryCyan, activeTrackColor = PrimaryCyan, inactiveTrackColor = DarkBorder)
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
                                    Text("DSTI Distress Score", fontSize = 11.sp, color = TextSecondary)
                                    Text(
                                        text = "${"%,.1f".format(dstiIndex)} / 100",
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = if (dstiIndex > 60) DangerRed else if (dstiIndex > 30) WarningAmber else SuccessGreen
                                    )
                                }
                                Box(
                                    modifier = Modifier
                                        .background((if (dstiIndex > 60) DangerRed else WarningAmber).copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = if (dstiIndex > 60) "[CATASTROPHIC SHOCK]" else "[MODERATE STRAIN]",
                                        fontSize = 10.sp,
                                        fontFamily = FontFamily.Monospace,
                                        fontWeight = FontWeight.Bold,
                                        color = if (dstiIndex > 60) DangerRed else WarningAmber
                                    )
                                }
                            }
                        }
                    }
                }

                else -> {
                    // 4-Way Reconciliation
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, DarkBorder, RoundedCornerShape(10.dp)),
                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("4-Way Multi-Counterparty Reconciliation", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Mathematical balance invariant across Hospital, Insurer/TPA, Razorpay, and Statutory caps.", fontSize = 12.sp, color = TextSecondary)

                            Spacer(modifier = Modifier.height(14.dp))

                            ReconRow("1. Hospital Gross Invoiced", "₹3,50,000", TextPrimary)
                            Spacer(modifier = Modifier.height(8.dp))
                            ReconRow("2. TPA Approved Share", "- ₹2,10,000", PrimaryCyan)
                            Spacer(modifier = Modifier.height(8.dp))
                            ReconRow("3. Patient Razorpay Deposit", "- ₹91,450", WarningAmber)
                            Spacer(modifier = Modifier.height(8.dp))
                            ReconRow("4. Statutory Overcharge Refund", "- ₹48,550", SuccessGreen)

                            Spacer(modifier = Modifier.height(14.dp))
                            HorizontalDivider(color = DarkBorder)
                            Spacer(modifier = Modifier.height(14.dp))

                            ReconRow("NET VARIANCE / ZERO RESIDUAL", "₹0.00", SuccessGreen, isTotal = true)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun ReconRow(label: String, amount: String, color: Color, isTotal: Boolean = false) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            fontSize = if (isTotal) 13.sp else 12.sp,
            fontWeight = if (isTotal) FontWeight.Bold else FontWeight.Normal,
            color = if (isTotal) TextPrimary else TextSecondary
        )
        Text(
            text = amount,
            fontSize = if (isTotal) 16.sp else 13.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            color = color
        )
    }
}
