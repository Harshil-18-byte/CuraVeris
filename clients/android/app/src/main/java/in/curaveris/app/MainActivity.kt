package in.curaveris.app

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
import in.curaveris.app.ui.screens.DashboardScreen
import in.curaveris.app.ui.theme.CuraVerisTheme

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
        val data: Uri? = intent?.data
        if (data != null) {
            // curaveris://audit/{bill_id} or https://app.curaveris.internal/bill/{bill_id}
            val billId = data.lastPathSegment
            if (!billId.isNullOrEmpty()) {
                // Route to bill audit detail
            }
        }
    }
}

@Composable
fun AppNavigation(navController: NavHostController) {
    NavHost(navController = navController, startDestination = "dashboard") {
        composable("dashboard") {
            DashboardScreen(
                onNavigateToLogin = { navController.navigate("login") }
            )
        }
        composable("login") {
            DashboardScreen()
        }
    }
}
