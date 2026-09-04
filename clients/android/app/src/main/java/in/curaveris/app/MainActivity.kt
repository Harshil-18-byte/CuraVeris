package `in`.curaveris.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import `in`.curaveris.app.ui.screens.SplashScreen
import `in`.curaveris.app.ui.screens.AuthScreen
import `in`.curaveris.app.ui.screens.DashboardScreen
import `in`.curaveris.app.ui.screens.ScanAuditScreen
import `in`.curaveris.app.ui.screens.CopilotScreen
import `in`.curaveris.app.ui.theme.CuraVerisTheme

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
                AppNavigation(navController = navController)
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }

    private fun handleDeepLink(intent: Intent?) {
        val data: Uri = intent?.data ?: return
        // curaveris://audit/{bill_id} or https://app.curaveris.internal/bill/{bill_id}
        val billId = data.lastPathSegment
        if (!billId.isNullOrEmpty()) {
            android.util.Log.d("MainActivity", "Deep link received for bill ID: $billId")
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
                onNavigateToDisputes = { navController.navigate("dashboard") },
                onNavigateToTariffs = { navController.navigate("dashboard") }
            )
        }
        composable("scan") {
            ScanAuditScreen(
                onNavigateToDispute = { navController.navigate("copilot") }
            )
        }
        composable("copilot") {
            CopilotScreen(
                onNavigateToDispute = { navController.navigate("dashboard") }
            )
        }
    }
}

