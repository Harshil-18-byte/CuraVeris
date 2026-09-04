package `in`.curaveris.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Search
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

data class StatutoryTariffItem(
    val id: String,
    val name: String,
    val category: String,
    val ceilingRate: Double,
    val unit: String,
    val notification: String,
    val clause: String,
    val tag: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TariffRegistryScreen(
    onBack: () -> Unit = {}
) {
    var selectedTabIndex by remember { mutableIntStateOf(0) }
    var searchQuery by remember { mutableStateOf("") }

    val tabs = listOf("NPPA IMPLANTS", "DPCO MEDICINES", "CGHS 2024", "IRDAI 199")

    val allTariffs = remember {
        listOf(
            // NPPA
            StatutoryTariffItem("np_1", "Coronary Drug-Eluting Stent (DES)", "NPPA IMPLANTS", 30080.0, "per unit", "S.O. 1335(E)", "Ceiling Price Cap + GST only", "NPPA CAP"),
            StatutoryTariffItem("np_2", "Bare Metal Stent (BMS)", "NPPA IMPLANTS", 8260.0, "per unit", "S.O. 1335(E)", "Ceiling Price Cap + GST only", "NPPA CAP"),
            StatutoryTariffItem("np_3", "Primary Knee Replacement (Femoral + Tibial + Insert)", "NPPA IMPLANTS", 54000.0, "complete system", "S.O. 2668(E)", "Orthopedic Ceiling Cap", "NPPA CAP"),
            StatutoryTariffItem("np_4", "Revision Knee Replacement System", "NPPA IMPLANTS", 113950.0, "complete system", "S.O. 2668(E)", "Orthopedic Revision Cap", "NPPA CAP"),

            // DPCO
            StatutoryTariffItem("dp_1", "Meropenem 1g Injection", "DPCO MEDICINES", 420.0, "per vial", "DPCO 2013 NLEM 2022", "Para 24 Overcharge Penalty", "DPCO MRP"),
            StatutoryTariffItem("dp_2", "Paracetamol 650mg Tablet", "DPCO MEDICINES", 2.14, "per tablet", "DPCO 2013 NLEM 2022", "Para 24 Ceiling MRP", "DPCO MRP"),
            StatutoryTariffItem("dp_3", "Enoxaparin 40mg/0.4ml Injection", "DPCO MEDICINES", 435.0, "per pre-filled syringe", "DPCO 2013 NLEM 2022", "Para 24 Ceiling MRP", "DPCO MRP"),
            StatutoryTariffItem("dp_4", "Pantoprazole 40mg IV Injection", "DPCO MEDICINES", 48.5, "per vial", "DPCO 2013 NLEM 2022", "Para 24 Ceiling MRP", "DPCO MRP"),

            // CGHS 2024
            StatutoryTariffItem("cg_1", "Coronary Angiography (CAG)", "CGHS 2024", 6500.0, "package", "CGHS 2024 Tier-1 NABH", "Includes Cath Lab, Consumables, Contrast", "CGHS TARIFF"),
            StatutoryTariffItem("cg_2", "Percutaneous Transluminal Coronary Angioplasty (PTCA)", "CGHS 2024", 55000.0, "procedure package", "CGHS 2024 Tier-1 NABH", "Excludes Stent (Billed at NPPA)", "CGHS TARIFF"),
            StatutoryTariffItem("cg_3", "Normal Delivery / Caesarean Section (LSCS)", "CGHS 2024", 18500.0, "all-inclusive", "CGHS 2024 Tier-1 NABH", "Includes Surgeon, OT, 3-Day Stay", "CGHS TARIFF"),
            StatutoryTariffItem("cg_4", "ICU Bed + Monitoring Charges (NABH)", "CGHS 2024", 5400.0, "per 24h day", "CGHS 2024 Tier-1 NABH", "Includes Routine Nursing, Doctor Visits", "CGHS TARIFF"),

            // IRDAI 199
            StatutoryTariffItem("ir_1", "Surgical Examination Gloves & Disposables", "IRDAI 199", 0.0, "mandatory bundle", "IRDAI Master Circular 2020", "Non-Payable Overhead (Hospital Cost)", "IRDAI 199"),
            StatutoryTariffItem("ir_2", "PPE Kits & Sanitizer Surcharges", "IRDAI 199", 0.0, "mandatory bundle", "IRDAI Master Circular 2020", "Non-Payable Overhead (Hospital Cost)", "IRDAI 199"),
            StatutoryTariffItem("ir_3", "Bed Linen, Admission Kit & Thermometer", "IRDAI 199", 0.0, "mandatory bundle", "IRDAI Master Circular 2020", "Room Rent Bundle Prohibition", "IRDAI 199")
        )
    }

    val currentCategory = tabs[selectedTabIndex]
    val filteredList = remember(currentCategory, searchQuery) {
        allTariffs.filter {
            it.category == currentCategory &&
            (searchQuery.isBlank() ||
             it.name.contains(searchQuery, ignoreCase = true) ||
             it.notification.contains(searchQuery, ignoreCase = true) ||
             it.clause.contains(searchQuery, ignoreCase = true))
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("STATUTORY TARIFF REGISTRIES", fontSize = 13.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = TextPrimary)
                        Text("Official Price Ceilings & Gazette Benchmarks", fontSize = 11.sp, color = TextSecondary)
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
        ) {
            Spacer(modifier = Modifier.height(10.dp))

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search medicine, stent, procedure, or gazette...", fontSize = 12.sp, color = TextMuted) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = DarkSurface,
                    unfocusedContainerColor = DarkSurface,
                    focusedBorderColor = PrimaryCyan,
                    unfocusedBorderColor = DarkBorder,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                ),
                singleLine = true,
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted, modifier = Modifier.size(18.dp))
                }
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Tab Rows
            TabRow(
                selectedTabIndex = selectedTabIndex,
                containerColor = DarkSurface,
                contentColor = PrimaryCyan,
                divider = { Box(modifier = Modifier.height(1.dp).background(DarkBorder)) }
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTabIndex == index,
                        onClick = { selectedTabIndex = index },
                        text = {
                            Text(
                                text = title,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = if (selectedTabIndex == index) FontWeight.Bold else FontWeight.Normal,
                                color = if (selectedTabIndex == index) PrimaryCyan else TextSecondary
                            )
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 24.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredList) { item ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, DarkBorder, RoundedCornerShape(10.dp)),
                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = item.name,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary,
                                    modifier = Modifier.weight(1f)
                                )
                                Box(
                                    modifier = Modifier
                                        .background(PrimaryCyan.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                                        .border(1.dp, PrimaryCyan.copy(alpha = 0.4f), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "[${item.tag}]",
                                        fontSize = 9.sp,
                                        fontFamily = FontFamily.Monospace,
                                        fontWeight = FontWeight.Bold,
                                        color = PrimaryCyan
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = if (item.ceilingRate == 0.0) "NON-PAYABLE (₹0)" else "₹${"%,.2f".format(item.ceilingRate)} ${item.unit}",
                                    fontSize = 15.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = if (item.ceilingRate == 0.0) DangerRed else SuccessGreen
                                )
                                Text(
                                    text = item.notification,
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace,
                                    color = TextMuted
                                )
                            }

                            Spacer(modifier = Modifier.height(4.dp))
                            Text(text = item.clause, fontSize = 11.sp, color = TextSecondary)
                        }
                    }
                }
            }
        }
    }
}
