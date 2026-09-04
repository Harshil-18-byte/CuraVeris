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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import `in`.curaveris.app.ui.theme.*

data class AppScreenItem(
    val id: String,
    val title: String,
    val category: String,
    val tag: String,
    val description: String,
    val statutoryRef: String,
    val route: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AllScreensHubScreen(
    onNavigate: (String) -> Unit = {},
    onBack: () -> Unit = {}
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("ALL") }

    val allScreens = remember {
        listOf(
            // 1. Core Audit & Ingestion
            AppScreenItem("1", "Dashboard & Financial Summary", "Core Audit", "SUMMARY", "Gross totals, estimated savings, and real-time overcharge calculator.", "FRM Basel-III / SR 11-7", "dashboard"),
            AppScreenItem("2", "Bill Scanner & Multi-Modal OCR", "Core Audit", "SCANNER", "Camera and file upload for PDF, PNG, and JPEG medical invoices.", "LayoutLMv3 Multimodal", "scan"),
            AppScreenItem("3", "Line-by-Line Statutory Audit", "Core Audit", "ITEMIZED", "Atomic line comparison against NPPA, DPCO, and CGHS ceilings.", "DPCO 2013 / CGHS 2024", "scan"),
            AppScreenItem("4", "SHAP Waterfall Feature Attribution", "Core Audit", "XAI", "Additive decomposition explaining why line items were flagged.", "Lundberg & Lee TreeSHAP", "scan"),
            AppScreenItem("5", "2D Forensic Risk Heatmap Matrix", "Core Audit", "HEATMAP", "Departmental violation density across pharmacy, ICU, and implants.", "Deep Risk MLP Ensemble", "scan"),
            AppScreenItem("6", "Section 65B Cryptographic Ledger", "Core Audit", "SEC 65B", "SHA-256 Merkle root tree and HMAC origin signature for court evidence.", "IEA Sec 65B / BSA Sec 61", "scan"),

            // 2. Statutory Registries
            AppScreenItem("7", "NPPA Implant Price Caps Registry", "Registries", "NPPA CAP", "Coronary drug-eluting stents (₹30,080) and knee implants (₹54,000).", "NPPA S.O. 1335(E) & 2668(E)", "tariffs"),
            AppScreenItem("8", "DPCO Scheduled Drug MRP Registry", "Registries", "DPCO 2013", "Ceiling prices on 850+ NLEM essential formulations and penalty calculators.", "DPCO 2013 Para 24 / ECA Sec 7", "tariffs"),
            AppScreenItem("9", "CGHS 2024 Procedure Tariffs", "Registries", "CGHS 2024", "1,900+ standardized medical tariffs across Tier-1/2/3 NABH hospitals.", "MoHFW CGHS 2024 Circular", "tariffs"),
            AppScreenItem("10", "IRDAI 199 Non-Payables Schedule", "Registries", "IRDAI 199", "Prohibition on unbundling surgical gloves, PPE, sanitizers, and consumables.", "IRDAI Master Circular 2020", "tariffs"),

            // 3. Financial Forensics & Gap
            AppScreenItem("11", "Inpatient Daily Burn Rate Monitor", "Financial Risk", "BURN RATE", "Detects ICU stay inflation deviating >30% from clinical ALOS norms.", "ICMR Clinical Guidelines", "financial_risk"),
            AppScreenItem("12", "Financial Toxicity & DSTI Index", "Financial Risk", "DSTI", "Debt Service-to-Income distress ratio and catastrophic shock scoring.", "FRM Quantitative Model", "financial_risk"),
            AppScreenItem("13", "4-Way Balance Reconciliation", "Financial Risk", "4-WAY RECON", "Harmonizes Hospital Invoice, TPA deductions, Razorpay Co-pay, and Statutory refunds.", "Zero-Discrepancy Invariant", "financial_risk"),
            AppScreenItem("14", "Razorpay Payment & Deposit Gateway", "Financial Risk", "RAZORPAY", "Secure tokenized patient co-pay deposits with HMAC webhook verification.", "PCI-DSS / RBI 2023", "financial_risk"),

            // 4. Specialized Audits
            AppScreenItem("15", "GST Healthcare Exemption Shadow Audit", "Specialized", "GST AUDIT", "Enforces 0% GST on inpatient healthcare services and catches duplicate surcharges.", "CBIC Notif. 12/2017-CT(R)", "financial_risk"),
            AppScreenItem("16", "PM-JAY Zero-Cash Protection Audit", "Specialized", "PM-JAY", "Audits illegal cash demands on Ayushman Bharat beneficiaries with 5x penalty.", "NHA PM-JAY Guidelines 3.2", "disputes"),
            AppScreenItem("17", "ICD-10 & SNOMED Clinical Code Engine", "Specialized", "ICD-10", "Maps medical diagnoses and surgical procedures to standardized clinical codes.", "WHO ICD-10 / SNOMED-CT", "scan"),
            AppScreenItem("18", "ABHA & ABDM Digital Health Records", "Specialized", "ABHA M1/M2", "Ayushman Bharat Health Account integration with tokenized consent.", "ABDM Milestone 1 & 2", "dashboard"),

            // 5. Legal Redress & Petitions
            AppScreenItem("19", "Formal Hospital Dispute Letter", "Legal Redress", "DISPUTE", "Ready-to-serve legal demand letter citing gazette notifications and overcharge totals.", "CPA 2019 / ECA 1955", "disputes"),
            AppScreenItem("20", "Emergency Anti-Detention Legal Notice", "Legal Redress", "BNS 127", "Immediate legal notice barring patient detention over unpaid disputed bills.", "Bombay HC CrWP 2502/2000", "disputes"),
            AppScreenItem("21", "Insurance Ombudsman Petition", "Legal Redress", "OMBUDSMAN", "Statutory complaint format against arbitrary TPA deductions under Rule 13.", "Insurance Ombudsman Rules 2017", "disputes"),
            AppScreenItem("22", "Patient Advocacy AI Copilot", "Legal Redress", "AI COPILOT", "Interactive statutory assistant answering healthcare billing and legal queries.", "Grounded RAG / Qwen 4B", "copilot"),

            // 6. Security & Privacy
            AppScreenItem("23", "DPDP Act Right to Erasure / Anonymization", "Privacy & Dev", "DPDP 2023", "Cryptographic anonymization and record deletion under Section 12.", "DPDP Act 2023 Sec 12", "auth"),
            AppScreenItem("24", "Telemetry & Observability Monitor", "Privacy & Dev", "TELEMETRY", "Real-time latency metrics, memory usage, and ML model inference speeds.", "Prometheus / Grafana Contract", "dashboard"),
            AppScreenItem("25", "Architecture & Pipeline Inspector", "Privacy & Dev", "ARCHITECTURE", "Deep inspection into the 6 ML models, tokenizer weights, and database connections.", "FastAPI Lifespan Schema", "dashboard")
        )
    }

    val categories = remember { listOf("ALL", "Core Audit", "Registries", "Financial Risk", "Specialized", "Legal Redress", "Privacy & Dev") }

    val filteredScreens = remember(searchQuery, selectedCategory) {
        allScreens.filter { item ->
            (selectedCategory == "ALL" || item.category == selectedCategory) &&
            (searchQuery.isBlank() ||
             item.title.contains(searchQuery, ignoreCase = true) ||
             item.description.contains(searchQuery, ignoreCase = true) ||
             item.tag.contains(searchQuery, ignoreCase = true) ||
             item.statutoryRef.contains(searchQuery, ignoreCase = true))
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("ALL SCREENS & MODULES", fontSize = 14.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = TextPrimary)
                        Text("${filteredScreens.size} feature surfaces available", fontSize = 11.sp, color = TextSecondary)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                actions = {
                    Box(
                        modifier = Modifier
                            .background(SuccessGreen.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                            .border(1.dp, SuccessGreen.copy(alpha = 0.4f), RoundedCornerShape(4.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text("[COMPLETE]", fontSize = 10.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = SuccessGreen)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkSurface)
            )
        },
        containerColor = DarkBackground
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(top = 12.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Search Input
            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search screens, statutes, or features...", fontSize = 13.sp, color = TextMuted) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = DarkSurface,
                        unfocusedContainerColor = DarkSurface,
                        focusedBorderColor = PrimaryBlue,
                        unfocusedBorderColor = DarkBorder,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    ),
                    singleLine = true,
                    leadingIcon = {
                        Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted, modifier = Modifier.size(18.dp))
                    }
                )
            }

            // Category Filter Chips
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    categories.take(4).forEach { cat ->
                        FilterChip(
                            selected = selectedCategory == cat,
                            onClick = { selectedCategory = cat },
                            label = { Text(cat, fontSize = 11.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = PrimaryBlue,
                                selectedLabelColor = Color.White,
                                containerColor = DarkSurface,
                                labelColor = TextSecondary
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = selectedCategory == cat,
                                borderColor = DarkBorder,
                                selectedBorderColor = PrimaryBlue
                            )
                        )
                    }
                }
            }

            // Screen Cards
            items(filteredScreens) { screen ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, DarkBorder, RoundedCornerShape(10.dp))
                        .clickable { onNavigate(screen.route) },
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
                                text = screen.title,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Box(
                                modifier = Modifier
                                    .background(PrimaryCyan.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                                    .border(1.dp, PrimaryCyan.copy(alpha = 0.4f), RoundedCornerShape(4.dp))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "[${screen.tag}]",
                                    fontSize = 9.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold,
                                    color = PrimaryCyan
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = screen.description, fontSize = 12.sp, color = TextSecondary)

                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = screen.statutoryRef,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                color = TextMuted
                            )
                            Text(
                                text = "OPEN ->",
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                color = SuccessGreen
                            )
                        }
                    }
                }
            }
        }
    }
}
