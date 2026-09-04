package `in`.curaveris.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import `in`.curaveris.app.ui.theme.*

data class AuditedLineItem(
    val id: String,
    val name: String,
    val category: String,
    val billedRate: Double,
    val statutoryLimit: Double,
    val overcharge: Double,
    val flag: String,
    val citation: String
)

@Composable
fun ScanAuditScreen(
    onNavigateToDispute: () -> Unit = {}
) {
    var isAnalyzing by remember { mutableStateOf(false) }
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Itemized Audit, 1: SHAP Waterfall, 2: 65B Ledger

    val sampleItems = remember {
        listOf(
            AuditedLineItem(
                id = "item_1",
                name = "Coronary Drug-Eluting Stent (DES)",
                category = "Cardiology Implant",
                billedRate = 65000.0,
                statutoryLimit = 30080.0,
                overcharge = 34920.0,
                flag = "NPPA CAP VIOLATION",
                citation = "NPPA Notification S.O. 1335(E)"
            ),
            AuditedLineItem(
                id = "item_2",
                name = "Meropenem 1g IV Infusion",
                category = "Scheduled Drug",
                billedRate = 1450.0,
                statutoryLimit = 420.0,
                overcharge = 1030.0,
                flag = "DPCO ABOVE MRP",
                citation = "DPCO 2013 Table-1 (NLEM 2022)"
            ),
            AuditedLineItem(
                id = "item_3",
                name = "Surgical Gloves & Disposables",
                category = "Consumable",
                billedRate = 3500.0,
                statutoryLimit = 0.0,
                overcharge = 3500.0,
                flag = "IRDAI 199 UNBUNDLED",
                citation = "IRDAI Master Circular 199 Excluded Items"
            ),
            AuditedLineItem(
                id = "item_4",
                name = "ICU Monitoring & Nursing Charge (Day 3)",
                category = "Package Overhead",
                billedRate = 18000.0,
                statutoryLimit = 5400.0,
                overcharge = 12600.0,
                flag = "DUPLICATE OVERHEAD",
                citation = "CGHS 2024 Tier-1 NABH Package Bundling"
            ),
            AuditedLineItem(
                id = "item_5",
                name = "GST on Inpatient Clinical Services (18%)",
                category = "Healthcare Tax",
                billedRate = 14800.0,
                statutoryLimit = 0.0,
                overcharge = 14800.0,
                flag = "ILLEGAL GST SURCHARGE",
                citation = "CBIC Notification No. 12/2017-CT(R) Entry 74"
            )
        )
    }

    val totalOvercharge = remember(sampleItems) { sampleItems.sumOf { it.overcharge } }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Upload / Camera Ingestion Header
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
                        Column {
                            Text(
                                text = "INVOICE FORENSIC AUDIT",
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                color = PrimaryCyan
                            )
                            Text(
                                text = "Apollo Multispeciality · Bill #AP-2026-8921",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        }
                        Box(
                            modifier = Modifier
                                .background(DangerRed.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "5 VIOLATIONS",
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                color = DangerRed
                            )
                        }
                    }

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
                            Text("Total Billed Overcharge", fontSize = 11.sp, color = TextSecondary)
                            Text(
                                text = "₹${"%,d".format(totalOvercharge.toInt())}",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = DangerRed
                            )
                        }
                        Button(
                            onClick = onNavigateToDispute,
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(Icons.Default.Gavel, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Legal Notice", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Sub-tabs
        item {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = DarkSurface,
                contentColor = TextPrimary,
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .border(1.dp, DarkBorder, RoundedCornerShape(8.dp))
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Line Items", fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("SHAP Attribution", fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
                )
                Tab(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    text = { Text("65B Certificate", fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
                )
            }
        }

        if (selectedTab == 0) {
            // Line Item Cards
            items(sampleItems) { item ->
                LineItemAuditCard(item = item)
            }
        } else if (selectedTab == 1) {
            // SHAP Waterfall View
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "SHAP ADDITIVE FEATURE ATTRIBUTION",
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            color = PurpleAccent
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Decomposition of variables elevating the composite risk score to 78/100:",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        ShapFeatureRow(feature = "rate_vs_nppa_stent_ratio (2.16x)", impact = "+34.2 pts", isPositive = true)
                        ShapFeatureRow(feature = "duplicate_icu_timestamp_flag (1)", impact = "+22.5 pts", isPositive = true)
                        ShapFeatureRow(feature = "gst_on_exempt_healthcare (18%)", impact = "+14.8 pts", isPositive = true)
                        ShapFeatureRow(feature = "consumable_unbundling_ratio (12%)", impact = "+8.3 pts", isPositive = true)
                        ShapFeatureRow(feature = "valid_nabh_tier_discount", impact = "-5.4 pts", isPositive = false)
                    }
                }
            }
        } else {
            // Section 65B Cryptographic Audit Ledger View
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
                            Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = SuccessGreen)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Section 65B Merkle Certificate",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = "Admissible Electronic Evidence Certificate under Section 65B of Indian Evidence Act, 1872 & Bharatiya Sakshya Adhiniyam, 2023.",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        CryptoHashBox(title = "MERKLE ROOT HASH", hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
                        Spacer(modifier = Modifier.height(8.dp))
                        CryptoHashBox(title = "ORIGIN HMAC SIGNATURE", hash = "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069")
                    }
                }
            }
        }
    }
}

@Composable
fun LineItemAuditCard(item: AuditedLineItem) {
    Card(
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        shape = RoundedCornerShape(10.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, DarkBorder, RoundedCornerShape(10.dp))
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = item.name,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = item.category,
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                }

                Box(
                    modifier = Modifier
                        .background(DangerRed.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                        .border(1.dp, DangerRed.copy(alpha = 0.4f), RoundedCornerShape(4.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "[${item.flag}]",
                        fontSize = 9.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = DangerRed
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DarkCard, RoundedCornerShape(6.dp))
                    .padding(8.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Billed Rate", fontSize = 10.sp, color = TextMuted)
                    Text("₹${"%,d".format(item.billedRate.toInt())}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                }
                Column {
                    Text("Statutory Cap", fontSize = 10.sp, color = TextMuted)
                    Text("₹${"%,d".format(item.statutoryLimit.toInt())}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("Overcharge", fontSize = 10.sp, color = TextMuted)
                    Text("+₹${"%,d".format(item.overcharge.toInt())}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = DangerRed)
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Citation: ${item.citation}",
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                color = PrimaryCyan
            )
        }
    }
}

@Composable
fun ShapFeatureRow(feature: String, impact: String, isPositive: Boolean) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = feature,
            fontSize = 12.sp,
            fontFamily = FontFamily.Monospace,
            color = TextSecondary,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = impact,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            color = if (isPositive) DangerRed else SuccessGreen
        )
    }
}

@Composable
fun CryptoHashBox(title: String, hash: String) {
    Column {
        Text(title, fontSize = 10.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = TextMuted)
        Spacer(modifier = Modifier.height(2.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(DarkCard, RoundedCornerShape(6.dp))
                .padding(8.dp)
        ) {
            Text(
                text = hash,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                color = PrimaryCyan,
                lineHeight = 14.sp
            )
        }
    }
}
