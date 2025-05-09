// DO NOT EDIT. This is code generated via package:intl/generate_localized.dart
// This is a library that provides messages for a en locale. All the
// messages from the main program should be duplicated here with the same
// function name.

// Ignore issues from commonly used lints in this file.
// ignore_for_file:unnecessary_brace_in_string_interps, unnecessary_new
// ignore_for_file:prefer_single_quotes,comment_references, directives_ordering
// ignore_for_file:annotate_overrides,prefer_generic_function_type_aliases
// ignore_for_file:unused_import, file_names, avoid_escaping_inner_quotes
// ignore_for_file:unnecessary_string_interpolations, unnecessary_string_escapes

import 'package:intl/intl.dart';
import 'package:intl/message_lookup_by_library.dart';

final messages = new MessageLookup();

typedef String MessageIfAbsent(String messageStr, List<dynamic> args);

class MessageLookup extends MessageLookupByLibrary {
  String get localeName => 'en';

  static String m0(credits) => "${credits} credits added to your account";

  static String m1(message) => "Download error: ${message}";

  static String m2(dependency) =>
      "Error installing dependencies, please try manually. Run the following command in the terminal: `${dependency}`";

  static String m3(dependency) =>
      "Requirements could not be installed automatically. Please run the following command in the terminal: `${dependency}`";

  static String m4(code) => "Gift code successfully created: ${code}";

  static String m5(count) => "Pool has ${count} account";

  static String m6(message) => "An unexpected error occurred: ${message}";

  static String m7(version) => "Update (${version})";

  static String m8(message) => "Connection error: ${message}";

  static String m9(message) => "Update failed: ${message}";

  final messages = _notInlinedMessages(_notInlinedMessages);
  static Map<String, Function> _notInlinedMessages(_) => <String, Function>{
    "about": MessageLookupByLibrary.simpleMessage("About"),
    "account_created": MessageLookupByLibrary.simpleMessage("Account created"),
    "account_details": MessageLookupByLibrary.simpleMessage("Account details"),
    "account_invalid": MessageLookupByLibrary.simpleMessage(
      "Account blocked by Cursor",
    ),
    "account_logged_in": MessageLookupByLibrary.simpleMessage(
      "Browser logged in",
    ),
    "account_test_error": MessageLookupByLibrary.simpleMessage(
      "Account test error",
    ),
    "account_valid": MessageLookupByLibrary.simpleMessage("Account valid"),
    "accounts": MessageLookupByLibrary.simpleMessage("Accounts"),
    "active": MessageLookupByLibrary.simpleMessage("Active"),
    "active_incidents": MessageLookupByLibrary.simpleMessage(
      "Active Incidents",
    ),
    "add_redirected_email": MessageLookupByLibrary.simpleMessage(
      "Add redirected email",
    ),
    "and": MessageLookupByLibrary.simpleMessage("and"),
    "assigning_account": MessageLookupByLibrary.simpleMessage(
      "Assigning account from pool",
    ),
    "assigning_account_error": MessageLookupByLibrary.simpleMessage(
      "Failed to assign account from pool",
    ),
    "assigning_account_success": MessageLookupByLibrary.simpleMessage(
      "Account assigned from pool",
    ),
    "auth_detected": MessageLookupByLibrary.simpleMessage(
      "Auth detected, getting account details",
    ),
    "auth_error": MessageLookupByLibrary.simpleMessage("Authentication error"),
    "auth_page_error": MessageLookupByLibrary.simpleMessage("Auth page error"),
    "auth_update_success": MessageLookupByLibrary.simpleMessage(
      "Authentication updated",
    ),
    "auto_login_starting": MessageLookupByLibrary.simpleMessage(
      "Auto login starting",
    ),
    "browser_initialized": MessageLookupByLibrary.simpleMessage(
      "Browser initialized",
    ),
    "browser_message": MessageLookupByLibrary.simpleMessage("Browser"),
    "browser_quit_error": MessageLookupByLibrary.simpleMessage(
      "Browser quit error",
    ),
    "browser_visibility": MessageLookupByLibrary.simpleMessage(
      "Browser visibility",
    ),
    "buy_credits": MessageLookupByLibrary.simpleMessage("Buy credits"),
    "cancel": MessageLookupByLibrary.simpleMessage("Cancel"),
    "changes": MessageLookupByLibrary.simpleMessage("Changes"),
    "checking": MessageLookupByLibrary.simpleMessage("Checking"),
    "checking_auth": MessageLookupByLibrary.simpleMessage("Checking auth"),
    "checking_chrome": MessageLookupByLibrary.simpleMessage(
      "Checking Google Chrome",
    ),
    "checking_inbox": MessageLookupByLibrary.simpleMessage("Checking inbox"),
    "checking_others": MessageLookupByLibrary.simpleMessage("Checking others"),
    "checking_pip_installation": MessageLookupByLibrary.simpleMessage(
      "Checking pip installation",
    ),
    "checking_python": MessageLookupByLibrary.simpleMessage("Checking Python"),
    "clear_notifications": MessageLookupByLibrary.simpleMessage(
      "Clear notifications",
    ),
    "close": MessageLookupByLibrary.simpleMessage("Close"),
    "code_found": MessageLookupByLibrary.simpleMessage("Code found"),
    "completed": MessageLookupByLibrary.simpleMessage("Completed"),
    "components": MessageLookupByLibrary.simpleMessage("Components"),
    "connecting_imap": MessageLookupByLibrary.simpleMessage(
      "Connecting to IMAP",
    ),
    "console": MessageLookupByLibrary.simpleMessage("Console"),
    "continue_": MessageLookupByLibrary.simpleMessage("Continue"),
    "continue_on_web": MessageLookupByLibrary.simpleMessage(
      "Continuing on the Website",
    ),
    "continue_to_app": MessageLookupByLibrary.simpleMessage("Continue to App"),
    "copied_to_clipboard": MessageLookupByLibrary.simpleMessage(
      "Copied to clipboard",
    ),
    "create_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Create Cursor account",
    ),
    "create_gift_code": MessageLookupByLibrary.simpleMessage(
      "Create Gift Code",
    ),
    "create_windsurf_account": MessageLookupByLibrary.simpleMessage(
      "Create Windsurf account",
    ),
    "created": MessageLookupByLibrary.simpleMessage("Created date"),
    "created_at": MessageLookupByLibrary.simpleMessage("Created At"),
    "creating_email": MessageLookupByLibrary.simpleMessage("Creating email"),
    "credits": MessageLookupByLibrary.simpleMessage("credits"),
    "credits_added_to_account": m0,
    "credits_amount": MessageLookupByLibrary.simpleMessage("Credits Amount"),
    "credits_b": MessageLookupByLibrary.simpleMessage("Credits"),
    "credits_transfer_steps": MessageLookupByLibrary.simpleMessage(
      "You can convert your existing credits into a gift code using the \"Generate Gift Code\" button on the homepage and then use this code on our website to transfer your credits.",
    ),
    "cursor": MessageLookupByLibrary.simpleMessage("Cursor"),
    "cursor_browser_login_info": MessageLookupByLibrary.simpleMessage("READY"),
    "daily_login": MessageLookupByLibrary.simpleMessage("Daily login"),
    "database_error": MessageLookupByLibrary.simpleMessage("Database error"),
    "days": MessageLookupByLibrary.simpleMessage("days"),
    "degraded_performance": MessageLookupByLibrary.simpleMessage(
      "Degraded Performance",
    ),
    "delete": MessageLookupByLibrary.simpleMessage("Delete"),
    "delete_account": MessageLookupByLibrary.simpleMessage("Delete account"),
    "delete_account_confirmation": MessageLookupByLibrary.simpleMessage(
      "Are you sure you want to delete the account?",
    ),
    "desktop_support_ending": MessageLookupByLibrary.simpleMessage(
      "Desktop Application Support Ending",
    ),
    "download_completed": MessageLookupByLibrary.simpleMessage(
      "Download completed",
    ),
    "download_error": m1,
    "download_failed": MessageLookupByLibrary.simpleMessage("Download failed"),
    "download_update": MessageLookupByLibrary.simpleMessage("Install Update"),
    "downloading": MessageLookupByLibrary.simpleMessage("Downloading: "),
    "downloading_python": MessageLookupByLibrary.simpleMessage(
      "Downloading Python",
    ),
    "downloading_python_installer": MessageLookupByLibrary.simpleMessage(
      "Downloading Python installer",
    ),
    "downloading_python_installer_for_macos":
        MessageLookupByLibrary.simpleMessage(
          "Downloading Python installer for macOS",
        ),
    "downloading_python_installer_for_windows":
        MessageLookupByLibrary.simpleMessage(
          "Downloading Python installer for Windows",
        ),
    "downloading_update": MessageLookupByLibrary.simpleMessage(
      "Downloading update",
    ),
    "email": MessageLookupByLibrary.simpleMessage("Email"),
    "email_created": MessageLookupByLibrary.simpleMessage("Email created"),
    "email_creation_failed": MessageLookupByLibrary.simpleMessage(
      "Email creation failed",
    ),
    "email_rate_limit": MessageLookupByLibrary.simpleMessage(
      "Email rate limit exceeded",
    ),
    "email_secret_failed": MessageLookupByLibrary.simpleMessage(
      "Email secret key failed",
    ),
    "email_unavailable": MessageLookupByLibrary.simpleMessage(
      "Email is unavailable",
    ),
    "email_validator_type": MessageLookupByLibrary.simpleMessage(
      "Email validator type",
    ),
    "enable_proxy": MessageLookupByLibrary.simpleMessage(
      "Enable proxy while using Cursor. This manipulates web requests to prevent trial period error.",
    ),
    "enter_credits_amount": MessageLookupByLibrary.simpleMessage(
      "Enter credits amount",
    ),
    "enter_email": MessageLookupByLibrary.simpleMessage("Enter email"),
    "error_during_dependency_installation":
        MessageLookupByLibrary.simpleMessage(
          "Error during dependency installation",
        ),
    "error_installing_dependencies": m2,
    "error_installing_python": MessageLookupByLibrary.simpleMessage(
      "Error installing Python",
    ),
    "failed_get_cursor_session_token": MessageLookupByLibrary.simpleMessage(
      "Failed to get cursor session token",
    ),
    "failed_open_auth_page": MessageLookupByLibrary.simpleMessage(
      "Failed to open auth page",
    ),
    "failed_to_install_pip_please_install_python_with_pip_included": m3,
    "failed_to_update_package_list": MessageLookupByLibrary.simpleMessage(
      "Failed to update package list",
    ),
    "free": MessageLookupByLibrary.simpleMessage("Free"),
    "generate_code": MessageLookupByLibrary.simpleMessage("Generate Code"),
    "getting_cursor_session_token": MessageLookupByLibrary.simpleMessage(
      "Getting account details",
    ),
    "getting_required_codes": MessageLookupByLibrary.simpleMessage(
      "Getting required codes",
    ),
    "getting_token": MessageLookupByLibrary.simpleMessage("Getting token"),
    "gift_code": MessageLookupByLibrary.simpleMessage("Gift Code"),
    "gift_code_created_success": m4,
    "gift_code_error": MessageLookupByLibrary.simpleMessage(
      "An error occurred while creating gift code",
    ),
    "gift_code_info_description": MessageLookupByLibrary.simpleMessage(
      "Enter the gift code you received here to add credits to your account. Gift codes should be in XXXX-XXXX format.",
    ),
    "gift_code_info_title": MessageLookupByLibrary.simpleMessage(
      "How to Use Gift Code?",
    ),
    "imap_connected": MessageLookupByLibrary.simpleMessage("IMAP connected"),
    "imap_content_read_error": MessageLookupByLibrary.simpleMessage(
      "IMAP content read error",
    ),
    "imap_error": MessageLookupByLibrary.simpleMessage("IMAP error"),
    "imap_settings": MessageLookupByLibrary.simpleMessage("IMAP settings"),
    "imap_settings_saved": MessageLookupByLibrary.simpleMessage(
      "IMAP settings saved",
    ),
    "inbox_check_failed": MessageLookupByLibrary.simpleMessage(
      "Inbox check failed",
    ),
    "init_browser_starting": MessageLookupByLibrary.simpleMessage(
      "Initializing browser",
    ),
    "installed_successfully": MessageLookupByLibrary.simpleMessage(
      "Installed successfully",
    ),
    "installing": MessageLookupByLibrary.simpleMessage("Installing"),
    "installing_python": MessageLookupByLibrary.simpleMessage(
      "Installing Python",
    ),
    "installing_python_silently": MessageLookupByLibrary.simpleMessage(
      "Installing Python silently",
    ),
    "installing_python_using_package_manager":
        MessageLookupByLibrary.simpleMessage(
          "Installing Python using package manager",
        ),
    "installing_python_using_package_manager_error":
        MessageLookupByLibrary.simpleMessage(
          "Error installing Python using package manager",
        ),
    "installing_update": MessageLookupByLibrary.simpleMessage(
      "Installing update",
    ),
    "invalid_server_response": MessageLookupByLibrary.simpleMessage(
      "Invalid server response",
    ),
    "is_already_installed": MessageLookupByLibrary.simpleMessage(
      "Is already installed",
    ),
    "limit": MessageLookupByLibrary.simpleMessage("Limit"),
    "mail_api_error": MessageLookupByLibrary.simpleMessage("Mail Server Error"),
    "major_outage": MessageLookupByLibrary.simpleMessage("Major Outage"),
    "mandatory_update_message": MessageLookupByLibrary.simpleMessage(
      "This update is mandatory. Please download the new version.",
    ),
    "manual": MessageLookupByLibrary.simpleMessage("Manual"),
    "manual_download": MessageLookupByLibrary.simpleMessage("Manual Download"),
    "max_attempts_reached": MessageLookupByLibrary.simpleMessage(
      "Maximum token attempts reached",
    ),
    "navigated_to_cursor": MessageLookupByLibrary.simpleMessage(
      "Navigated to Cursor",
    ),
    "new_version_available": MessageLookupByLibrary.simpleMessage(
      "New Version Available",
    ),
    "no_accounts_found": MessageLookupByLibrary.simpleMessage(
      "No accounts found",
    ),
    "no_download_url": MessageLookupByLibrary.simpleMessage(
      "No download URL found",
    ),
    "no_gift_codes_created": MessageLookupByLibrary.simpleMessage(
      "No gift codes created yet",
    ),
    "no_notifications": MessageLookupByLibrary.simpleMessage(
      "No notifications",
    ),
    "no_update_values": MessageLookupByLibrary.simpleMessage(
      "No values were updated",
    ),
    "not_enough_credits": MessageLookupByLibrary.simpleMessage(
      "Not enough credits",
    ),
    "not_enough_credits_for_gift": MessageLookupByLibrary.simpleMessage(
      "You don\'t have enough credits",
    ),
    "not_enough_credits_message": MessageLookupByLibrary.simpleMessage(
      "Please buy credits to continue.",
    ),
    "not_now": MessageLookupByLibrary.simpleMessage("Not Now"),
    "notice_title": MessageLookupByLibrary.simpleMessage("Important Notice"),
    "notifications": MessageLookupByLibrary.simpleMessage("Notifications"),
    "open_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Open Account in Browser",
    ),
    "opening_auth_page": MessageLookupByLibrary.simpleMessage(
      "Opening auth page, please login to the opened page.",
    ),
    "operation_failed": MessageLookupByLibrary.simpleMessage(
      "Operation failed",
    ),
    "operational": MessageLookupByLibrary.simpleMessage("Operational"),
    "partial_outage": MessageLookupByLibrary.simpleMessage("Partial Outage"),
    "password": MessageLookupByLibrary.simpleMessage("Password"),
    "patch_cursor": MessageLookupByLibrary.simpleMessage("Reset Cursor Trial"),
    "pip_installed_successfully": MessageLookupByLibrary.simpleMessage(
      "Pip installed successfully",
    ),
    "pip_is_already_installed": MessageLookupByLibrary.simpleMessage(
      "Pip is already installed",
    ),
    "pip_is_not_installed_installing_pip": MessageLookupByLibrary.simpleMessage(
      "Pip is not installed, installing pip",
    ),
    "please_enter_credit_amount": MessageLookupByLibrary.simpleMessage(
      "Please enter credit amount",
    ),
    "please_enter_gift_code": MessageLookupByLibrary.simpleMessage(
      "Please enter a gift code",
    ),
    "please_enter_valid_credit_amount": MessageLookupByLibrary.simpleMessage(
      "Please enter a valid credit amount",
    ),
    "please_install_google_chrome": MessageLookupByLibrary.simpleMessage(
      "Please install Google Chrome",
    ),
    "please_install_python_from_the_website":
        MessageLookupByLibrary.simpleMessage(
          "Please install Python from the website",
        ),
    "pool_account_count": m5,
    "pool_deactivated": MessageLookupByLibrary.simpleMessage(
      "Currently, there is no account in the pool",
    ),
    "port": MessageLookupByLibrary.simpleMessage("Port"),
    "premium": MessageLookupByLibrary.simpleMessage("Premium"),
    "price": MessageLookupByLibrary.simpleMessage("Price"),
    "pricing_buy_credits": MessageLookupByLibrary.simpleMessage("Buy Credits"),
    "pricing_contact": MessageLookupByLibrary.simpleMessage("Contact"),
    "pricing_contact_message": MessageLookupByLibrary.simpleMessage(
      "Contact us for payment",
    ),
    "pricing_credits_amount": MessageLookupByLibrary.simpleMessage(
      "Credits Amount",
    ),
    "pricing_credits_amount_note": MessageLookupByLibrary.simpleMessage(
      "You can set the credits amount as you want.",
    ),
    "pricing_credits_per_dollar": MessageLookupByLibrary.simpleMessage(
      "Credits per dollar",
    ),
    "pricing_credits_per_dollar_per_day": MessageLookupByLibrary.simpleMessage(
      "Credits per dollar (Daily)",
    ),
    "pricing_credits_per_dollar_per_month":
        MessageLookupByLibrary.simpleMessage("Credits per dollar (Monthly)"),
    "pricing_custom_amount": MessageLookupByLibrary.simpleMessage(
      "Custom Amount",
    ),
    "pricing_message": MessageLookupByLibrary.simpleMessage(
      "Pricing information",
    ),
    "pricing_payment_id": MessageLookupByLibrary.simpleMessage("Payment ID"),
    "pricing_payment_id_copied": MessageLookupByLibrary.simpleMessage(
      "Payment ID copied",
    ),
    "pricing_payment_id_copied_note": MessageLookupByLibrary.simpleMessage(
      "You will need to use this ID when making a payment",
    ),
    "pricing_payment_id_copy": MessageLookupByLibrary.simpleMessage("Copy"),
    "pricing_payment_id_note": MessageLookupByLibrary.simpleMessage(
      "You will need to use this ID when making a payment",
    ),
    "pricing_title": MessageLookupByLibrary.simpleMessage("Pricing"),
    "pricing_total_price": MessageLookupByLibrary.simpleMessage("Total Price"),
    "processing": MessageLookupByLibrary.simpleMessage("Processing"),
    "python_available": MessageLookupByLibrary.simpleMessage(
      "Python available",
    ),
    "python_installation_failed": MessageLookupByLibrary.simpleMessage(
      "Python installation failed",
    ),
    "python_not_available": MessageLookupByLibrary.simpleMessage(
      "Python not available",
    ),
    "python_path_error": MessageLookupByLibrary.simpleMessage(
      "Python PATH not found, you may need to restart your computer.",
    ),
    "python_path_progress": MessageLookupByLibrary.simpleMessage(
      "Python installation completed, checking PATH",
    ),
    "python_path_success": MessageLookupByLibrary.simpleMessage(
      "Python installation completed. Restart your computer.",
    ),
    "random_name_generation_failed": MessageLookupByLibrary.simpleMessage(
      "Random name generation failed",
    ),
    "redeem_code": MessageLookupByLibrary.simpleMessage("Redeem Code"),
    "redeem_code_error": MessageLookupByLibrary.simpleMessage(
      "An error occurred while redeeming gift code",
    ),
    "redeem_gift_code": MessageLookupByLibrary.simpleMessage(
      "Redeem Gift Code",
    ),
    "redirected_email_info": MessageLookupByLibrary.simpleMessage(
      "Enter the email addresses you want to redirect to the IMAP server. These email addresses will be used when creating an account.",
    ),
    "redirected_emails": MessageLookupByLibrary.simpleMessage(
      "Redirected emails",
    ),
    "registration_page_error": MessageLookupByLibrary.simpleMessage(
      "Registration page error",
    ),
    "registration_success": MessageLookupByLibrary.simpleMessage(
      "Registration successful",
    ),
    "remaining_credits": MessageLookupByLibrary.simpleMessage(
      "Remaining credits",
    ),
    "remove_redirected_email": MessageLookupByLibrary.simpleMessage(
      "Remove redirected email",
    ),
    "retry": MessageLookupByLibrary.simpleMessage("Retry"),
    "running_required_commands": MessageLookupByLibrary.simpleMessage(
      "Running required commands",
    ),
    "save_imap_settings": MessageLookupByLibrary.simpleMessage(
      "Save IMAP settings",
    ),
    "server": MessageLookupByLibrary.simpleMessage("Server"),
    "settings": MessageLookupByLibrary.simpleMessage("Settings"),
    "settings_are_being_configured": MessageLookupByLibrary.simpleMessage(
      "Settings are being configured",
    ),
    "show_notifications": MessageLookupByLibrary.simpleMessage(
      "Show notifications",
    ),
    "sign_up_restricted": MessageLookupByLibrary.simpleMessage(
      "Sign up restricted, please try again",
    ),
    "signup_starting": MessageLookupByLibrary.simpleMessage("Sign up starting"),
    "socials_title": MessageLookupByLibrary.simpleMessage(
      "Contact us for payment",
    ),
    "start_proxy": MessageLookupByLibrary.simpleMessage("Start proxy"),
    "status": MessageLookupByLibrary.simpleMessage("Status"),
    "status_details_not_available": MessageLookupByLibrary.simpleMessage(
      "Status details not available",
    ),
    "stop": MessageLookupByLibrary.simpleMessage("Stop"),
    "swipe_to_delete": MessageLookupByLibrary.simpleMessage(
      "Swipe left to delete",
    ),
    "switch_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Login Account",
    ),
    "test_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Test Cursor Account",
    ),
    "testing_account": MessageLookupByLibrary.simpleMessage("Testing account"),
    "thank_you_for_support": MessageLookupByLibrary.simpleMessage(
      "Thank you for your support",
    ),
    "today": MessageLookupByLibrary.simpleMessage("today"),
    "token": MessageLookupByLibrary.simpleMessage("Token"),
    "token_copied": MessageLookupByLibrary.simpleMessage("Token copied"),
    "token_error": MessageLookupByLibrary.simpleMessage("Token error"),
    "token_retry": MessageLookupByLibrary.simpleMessage(
      "Retrying to get token",
    ),
    "transfer_credits_info": MessageLookupByLibrary.simpleMessage(
      "Transferring Your Credits to the Website",
    ),
    "turnstile_failed": MessageLookupByLibrary.simpleMessage(
      "Robot verification failed",
    ),
    "turnstile_started": MessageLookupByLibrary.simpleMessage(
      "Robot verification started",
    ),
    "turnstile_starting": MessageLookupByLibrary.simpleMessage(
      "Robot verification starting",
    ),
    "turnstile_success": MessageLookupByLibrary.simpleMessage(
      "Robot verification successful",
    ),
    "type": MessageLookupByLibrary.simpleMessage("Type"),
    "unexpected_error": m6,
    "update": m7,
    "update_connection_error": m8,
    "update_failed": m9,
    "update_info_not_found": MessageLookupByLibrary.simpleMessage(
      "Update information not found",
    ),
    "usage_limit": MessageLookupByLibrary.simpleMessage("Usage limit"),
    "usage_limit_error": MessageLookupByLibrary.simpleMessage(
      "Could not get usage limit",
    ),
    "used": MessageLookupByLibrary.simpleMessage("Used"),
    "user_agent_set": MessageLookupByLibrary.simpleMessage("User-Agent set"),
    "user_id": MessageLookupByLibrary.simpleMessage("User ID"),
    "username": MessageLookupByLibrary.simpleMessage("Username"),
    "verification_code_error": MessageLookupByLibrary.simpleMessage(
      "Verification code error",
    ),
    "verification_failed": MessageLookupByLibrary.simpleMessage(
      "Verification failed",
    ),
    "verification_starting": MessageLookupByLibrary.simpleMessage(
      "Verification starting",
    ),
    "version": MessageLookupByLibrary.simpleMessage("Version"),
    "view_mail_failed": MessageLookupByLibrary.simpleMessage(
      "View mail failed",
    ),
    "waiting": MessageLookupByLibrary.simpleMessage("Waiting"),
    "waiting_for_email": MessageLookupByLibrary.simpleMessage(
      "Waiting for email",
    ),
    "web_site_url": MessageLookupByLibrary.simpleMessage(
      "https://aiaccounts.online",
    ),
    "welcome_to_ai_auto_free": MessageLookupByLibrary.simpleMessage(
      "Welcome to AI Auto Free",
    ),
    "windsurf": MessageLookupByLibrary.simpleMessage("Windsurf"),
    "windsurf_token_guide_1": MessageLookupByLibrary.simpleMessage(
      "Open Windsurf Editor",
    ),
    "windsurf_token_guide_2": MessageLookupByLibrary.simpleMessage(
      "Press CTRL + SHIFT + P",
    ),
    "windsurf_token_guide_3": MessageLookupByLibrary.simpleMessage(
      "Type \'login\' and select the first option",
    ),
    "windsurf_token_guide_4": MessageLookupByLibrary.simpleMessage(
      "A browser will open, close it and return to the editor.",
    ),
    "windsurf_token_guide_5": MessageLookupByLibrary.simpleMessage(
      "Paste the token you received into the application.",
    ),
    "windsurf_token_guide_close_button_text":
        MessageLookupByLibrary.simpleMessage("Close"),
    "windsurf_token_guide_title": MessageLookupByLibrary.simpleMessage(
      "Windsurf Token Guide",
    ),
    "windsurf_token_note": MessageLookupByLibrary.simpleMessage(
      "Note: The token is valid for 1 hour.",
    ),
    "you_should_restart_your_computer": MessageLookupByLibrary.simpleMessage(
      "Python is not available in PATH. If you are installing for the first time, restart your computer. Otherwise, you may need to add Python to PATH.",
    ),
    "your_id": MessageLookupByLibrary.simpleMessage("Your ID"),
    "your_id_copied": MessageLookupByLibrary.simpleMessage("Your ID copied"),
  };
}
