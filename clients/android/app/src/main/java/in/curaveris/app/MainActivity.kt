package `in`.curaveris.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import `in`.curaveris.app.ui.screens.*
import `in`.curaveris.app.ui.theme.*

/**
 * Main Activity Hosting Jetpack Compose Navigation & Deep Link Handling.
 */
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        handleDeepLink(intent)

        setContent {
            CuraVerisTheme {
                val navController = rememberNavController()
                MainAppShell(navController = navController)
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }

    private fun handleDeepLink(intent: Intent?) {
        val data: Uri = intent?.data ?: return
        val billId = data.lastPathSegment
        if (!billId.isNullOrEmpty()) {
            android.util.Log.d("MainActivity", "Deep link received for bill ID: $billId")
        }
    }
}

data class BottomNavItem(
    val route: String,
    val label: String,
    val badge: String
)

@Composable
fun MainAppShell(navController: NavHostController) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomNavItems = remember {
        listOf(
            BottomNavItem("dashboard", "HOME", "[DASH]"),
            BottomNavItem("scan", "SCAN", "[AUDIT]"),
            BottomNavItem("tariffs", "TARIFFS", "[CAPS]"),
            BottomNavItem("financial_risk", "RISK", "[FRM]"),
            BottomNavItem("disputes", "REDRESS", "[LEGAL]"),
            BottomNavItem("hub", "HUB", "[30+]")
        )
    }

    val showBottomBar = currentRoute != null && currentRoute != "splash" && currentRoute != "auth"

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = DarkSurface,
                    modifier = Modifier.border(1.dp, DarkBorder)
                ) {
                    bottomNavItems.forEach { item ->
                        val selected = currentRoute == item.route
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                if (currentRoute != item.route) {
                                    navController.navigate(item.route) {
                                        popUpTo("dashboard") { saveState = true }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            icon = {
                                Text(
                                    text = item.badge,
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (selected) PrimaryCyan else TextMuted
                                )
                            },
                            label = {
                                Text(
                                    text = item.label,
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (selected) TextPrimary else TextSecondary
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                indicatorColor = PrimaryCyan.copy(alpha = 0.15f)
                            )
                        )
                    }
                }
            }
        },
        containerColor = DarkBackground
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            AppNavigation(navController = navController)
        }
    }
}

@Composable
fun AppNavigation(navController: NavHostController) {
    NavHost(navController = navController, startDestination = "splash") {
        composable("splash") {
            SplashScreen(
                onNavigateToAuth = {
                    navController.navigate("auth") {
                        popUpTo("splash") { inclusive = true }
                    }
                },
                onNavigateToDashboard = {
                    navController.navigate("dashboard") {
                        popUpTo("splash") { inclusive = true }
                    }
                }
            )
        }
        composable("auth") {
            AuthScreen(
                onAuthSuccess = {
                    navController.navigate("dashboard") {
                        popUpTo("auth") { inclusive = true }
                    }
                }
            )
        }
        composable("dashboard") {
            DashboardScreen(
                onNavigateToScan = { navController.navigate("scan") },
                onNavigateToCopilot = { navController.navigate("copilot") },
                onNavigateToDisputes = { navController.navigate("disputes") },
                onNavigateToTariffs = { navController.navigate("tariffs") },
                onNavigateToHub = { navController.navigate("hub") },
                onNavigateToFinancialRisk = { navController.navigate("financial_risk") }
            )
        }
        composable("scan") {
            ScanAuditScreen(
                onNavigateToDispute = { navController.navigate("disputes") },
                onBack = { navController.popBackStack() }
            )
        }
        composable("copilot") {
            CopilotScreen(
                onNavigateToDispute = { navController.navigate("disputes") },
                onBack = { navController.popBackStack() }
            )
        }
        composable("hub") {
            AllScreensHubScreen(
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
            )
        }
        composable("tariffs") {
            TariffRegistryScreen(
                onBack = { navController.popBackStack() }
            )
        }
        composable("disputes") {
            LegalDisputeScreen(
                onBack = { navController.popBackStack() }
            )
        }
        composable("financial_risk") {
            FinancialRiskScreen(
                onBack = { navController.popBackStack() }
            )
        }
    }
}
