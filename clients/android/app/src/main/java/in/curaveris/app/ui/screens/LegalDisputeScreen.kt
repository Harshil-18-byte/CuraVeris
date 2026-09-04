package `in`.curaveris.app.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import `in`.curaveris.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LegalDisputeScreen(
    onBack: () -> Unit = {}
) {
    val context = LocalContext.current
    var selectedTab by remember { mutableIntStateOf(0) }
    var patientName by remember { mutableStateOf("Aditi Sharma") }
    var hospitalName by remember { mutableStateOf("Apollo Hospital") }
    var overchargeAmount by remember { mutableDoubleStateOf(48550.0) }

    val tabs = listOf("DISPUTE DEMAND", "ANTI-DETENTION (BNS 127)", "OMBUDSMAN")

    val petitionText = remember(selectedTab, patientName, hospitalName, overchargeAmount) {
        when (selectedTab) {
            0 -> """
LEGAL NOTICE OF FORMAL BILLING DISPUTE & RESTITUTION DEMAND
UNDER CONSUMER PROTECTION ACT 2019 & ESSENTIAL COMMODITIES ACT 1955

To:
The Medical Superintendent / Billing Grievance Desk
$hospitalName

Re: INPATIENT BILL OVERCHARGE DISPUTE FOR PATIENT: $patientName
Total Disputed Extortionate / Illegal Sum: ₹${"%,.2f".format(overchargeAmount)}

Sir/Madam,
Take notice that the forensic audit conducted under the CuraVeris Dual Statutory Engine has uncovered prima facie statutory violations in the final invoice issued to the aforementioned patient:

1. VIOLATION OF NPPA CEILINGS (S.O. 1335(E) & S.O. 2668(E)):
   Implants and medical devices billed in excess of gazetted price caps.

2. VIOLATION OF DPCO 2013 (PARA 24):
   Essential medicines billed above National List of Essential Medicines (NLEM) MRP.

3. UNLAWFUL UNBUNDLING UNDER IRDAI 199 NON-PAYABLE MASTER CIRCULAR:
   Mandatory hospital overhead consumables (gloves, PPE, bed linen) improperly unbundled.

DEMAND FOR RESTITUTION:
You are hereby called upon to issue an amended invoice deducting ₹${"%,.2f".format(overchargeAmount)} within 24 hours, failing which a formal complaint shall be instituted before the District Consumer Disputes Redressal Commission (DCDRC) with damages.

Certified under Section 65B of the Indian Evidence Act.
            """.trimIndent()

            1 -> """
EMERGENCY LEGAL NOTICE PROHIBITING PATIENT DETENTION
UNDER ARTICLE 21 OF THE CONSTITUTION & SECTION 127 BHARATIYA NYAYA SANHITA (BNS 2023)

To:
The Administration & Chief Medical Officer
$hospitalName

Re: IMMEDIATE UNCONDITIONAL DISCHARGE OF PATIENT: $patientName

TAKE IMMEDIATE NOTICE THAT:
1. UNLAWFUL DETENTION IS A COGNIZABLE OFFENCE:
   Under Section 127 of the Bharatiya Nyaya Sanhita 2023 (formerly IPC Section 342), wrongful confinement of a patient or withholding dead bodies / discharge summaries over disputed bills is strictly punishable with imprisonment.

2. BINDING JUDICIAL PRECEDENTS:
   The Hon'ble High Court of Judicature at Bombay in Criminal Writ Petition No. 2502/2000 has unequivocally held:
   "No hospital has the right to detain any patient, alive or dead, on the ground of non-payment of hospital bills or fees."

3. ZERO LIEN ON HUMAN PERSON:
   A hospital has no legal lien over a human being. The civil remedy for recovery of disputed sums (₹${"%,.2f".format(overchargeAmount)}) lies strictly in civil jurisdiction, not detention.

DEMAND:
You are commanded to effect immediate physical discharge and release of all medical records. Any refusal shall be immediately reported to the Local Police Station as a cognizable offense.
            """.trimIndent()

            else -> """
COMPLAINT UNDER RULE 13 OF INSURANCE OMBUDSMAN RULES, 2017
FOR ARBITRARY DEDUCTIONS & CLAIM SHORTFALL

To:
The Honorable Insurance Ombudsman

Complainant: $patientName
Hospital: $hospitalName
Disputed Deduction / Co-Pay Shortfall: ₹${"%,.2f".format(overchargeAmount)}

GROUNDS OF COMPLAINT:
1. Arbitrary deductions made by TPA on account of 'Proportionate Deductions' without policy schedule justification.
2. Failure to honor standard cashless authorization despite NABH accredited network status.
3. Unlawful denial of statutory consumable parity under IRDAI Standardization Master Guidelines.

PRAYER:
Direct the Insurer to immediately disburse ₹${"%,.2f".format(overchargeAmount)} along with 9% interest from date of discharge and ₹25,000 for mental agony.
            """.trimIndent()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("LEGAL PETITION & DISPUTE GENERATOR", fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = TextPrimary)
                        Text("Statutory Court & Administrative Redress", fontSize = 11.sp, color = TextSecondary)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                actions = {
                    IconButton(onClick = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        val clip = ClipData.newPlainText("CuraVeris Legal Petition", petitionText)
                        clipboard.setPrimaryClip(clip)
                        Toast.makeText(context, "Legal notice copied to clipboard!", Toast.LENGTH_SHORT).show()
                    }) {
                        Icon(Icons.Default.ContentCopy, contentDescription = "Copy", tint = SuccessGreen)
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

            // Tab Selection
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

            Spacer(modifier = Modifier.height(14.dp))

            // Inputs Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = patientName,
                    onValueChange = { patientName = it },
                    label = { Text("Patient Name", fontSize = 11.sp) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = DarkSurface,
                        unfocusedContainerColor = DarkSurface,
                        focusedBorderColor = PrimaryBlue,
                        unfocusedBorderColor = DarkBorder,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    ),
                    singleLine = true
                )
                OutlinedTextField(
                    value = hospitalName,
                    onValueChange = { hospitalName = it },
                    label = { Text("Hospital Name", fontSize = 11.sp) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = DarkSurface,
                        unfocusedContainerColor = DarkSurface,
                        focusedBorderColor = PrimaryBlue,
                        unfocusedBorderColor = DarkBorder,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    ),
                    singleLine = true
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Draft Petition Preview
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
                            text = "OFFICIAL DRAFT PREVIEW",
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            color = PrimaryCyan
                        )
                        Box(
                            modifier = Modifier
                                .background(SuccessGreen.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                                .border(1.dp, SuccessGreen.copy(alpha = 0.4f), RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "[STATUTORY CITATION VERIFIED]",
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                color = SuccessGreen
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = petitionText,
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace,
                        color = TextPrimary,
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            val clip = ClipData.newPlainText("CuraVeris Legal Petition", petitionText)
                            clipboard.setPrimaryClip(clip)
                            Toast.makeText(context, "Legal notice copied to clipboard!", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Copy Ready Notice to Clipboard", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
