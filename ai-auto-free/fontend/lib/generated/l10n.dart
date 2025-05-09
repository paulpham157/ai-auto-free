// GENERATED CODE - DO NOT MODIFY BY HAND
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'intl/messages_all.dart';

// **************************************************************************
// Generator: Flutter Intl IDE plugin
// Made by Localizely
// **************************************************************************

// ignore_for_file: non_constant_identifier_names, lines_longer_than_80_chars
// ignore_for_file: join_return_with_assignment, prefer_final_in_for_each
// ignore_for_file: avoid_redundant_argument_values, avoid_escaping_inner_quotes

class S {
  S();

  static S? _current;

  static S get current {
    assert(
      _current != null,
      'No instance of S was loaded. Try to initialize the S delegate before accessing S.current.',
    );
    return _current!;
  }

  static const AppLocalizationDelegate delegate = AppLocalizationDelegate();

  static Future<S> load(Locale locale) {
    final name =
        (locale.countryCode?.isEmpty ?? false)
            ? locale.languageCode
            : locale.toString();
    final localeName = Intl.canonicalizedLocale(name);
    return initializeMessages(localeName).then((_) {
      Intl.defaultLocale = localeName;
      final instance = S();
      S._current = instance;

      return instance;
    });
  }

  static S of(BuildContext context) {
    final instance = S.maybeOf(context);
    assert(
      instance != null,
      'No instance of S present in the widget tree. Did you add S.delegate in localizationsDelegates?',
    );
    return instance!;
  }

  static S? maybeOf(BuildContext context) {
    return Localizations.of<S>(context, S);
  }

  /// `and`
  String get and {
    return Intl.message('and', name: 'and', desc: '', args: []);
  }

  /// `Premium`
  String get premium {
    return Intl.message('Premium', name: 'premium', desc: '', args: []);
  }

  /// `Free`
  String get free {
    return Intl.message('Free', name: 'free', desc: '', args: []);
  }

  /// `Initializing browser`
  String get init_browser_starting {
    return Intl.message(
      'Initializing browser',
      name: 'init_browser_starting',
      desc: '',
      args: [],
    );
  }

  /// `User-Agent set`
  String get user_agent_set {
    return Intl.message(
      'User-Agent set',
      name: 'user_agent_set',
      desc: '',
      args: [],
    );
  }

  /// `Creating email`
  String get creating_email {
    return Intl.message(
      'Creating email',
      name: 'creating_email',
      desc: '',
      args: [],
    );
  }

  /// `Email created`
  String get email_created {
    return Intl.message(
      'Email created',
      name: 'email_created',
      desc: '',
      args: [],
    );
  }

  /// `Email creation failed`
  String get email_creation_failed {
    return Intl.message(
      'Email creation failed',
      name: 'email_creation_failed',
      desc: '',
      args: [],
    );
  }

  /// `Verification starting`
  String get verification_starting {
    return Intl.message(
      'Verification starting',
      name: 'verification_starting',
      desc: '',
      args: [],
    );
  }

  /// `Verification failed`
  String get verification_failed {
    return Intl.message(
      'Verification failed',
      name: 'verification_failed',
      desc: '',
      args: [],
    );
  }

  /// `Checking inbox`
  String get checking_inbox {
    return Intl.message(
      'Checking inbox',
      name: 'checking_inbox',
      desc: '',
      args: [],
    );
  }

  /// `Code found`
  String get code_found {
    return Intl.message('Code found', name: 'code_found', desc: '', args: []);
  }

  /// `Mail Server Error`
  String get mail_api_error {
    return Intl.message(
      'Mail Server Error',
      name: 'mail_api_error',
      desc: '',
      args: [],
    );
  }

  /// `Connecting to IMAP`
  String get connecting_imap {
    return Intl.message(
      'Connecting to IMAP',
      name: 'connecting_imap',
      desc: '',
      args: [],
    );
  }

  /// `IMAP connected`
  String get imap_connected {
    return Intl.message(
      'IMAP connected',
      name: 'imap_connected',
      desc: '',
      args: [],
    );
  }

  /// `Waiting for email`
  String get waiting_for_email {
    return Intl.message(
      'Waiting for email',
      name: 'waiting_for_email',
      desc: '',
      args: [],
    );
  }

  /// `IMAP content read error`
  String get imap_content_read_error {
    return Intl.message(
      'IMAP content read error',
      name: 'imap_content_read_error',
      desc: '',
      args: [],
    );
  }

  /// `IMAP error`
  String get imap_error {
    return Intl.message('IMAP error', name: 'imap_error', desc: '', args: []);
  }

  /// `Robot verification starting`
  String get turnstile_starting {
    return Intl.message(
      'Robot verification starting',
      name: 'turnstile_starting',
      desc: '',
      args: [],
    );
  }

  /// `Robot verification started`
  String get turnstile_started {
    return Intl.message(
      'Robot verification started',
      name: 'turnstile_started',
      desc: '',
      args: [],
    );
  }

  /// `Robot verification successful`
  String get turnstile_success {
    return Intl.message(
      'Robot verification successful',
      name: 'turnstile_success',
      desc: '',
      args: [],
    );
  }

  /// `Robot verification failed`
  String get turnstile_failed {
    return Intl.message(
      'Robot verification failed',
      name: 'turnstile_failed',
      desc: '',
      args: [],
    );
  }

  /// `Getting token`
  String get getting_token {
    return Intl.message(
      'Getting token',
      name: 'getting_token',
      desc: '',
      args: [],
    );
  }

  /// `Retrying to get token`
  String get token_retry {
    return Intl.message(
      'Retrying to get token',
      name: 'token_retry',
      desc: '',
      args: [],
    );
  }

  /// `Maximum token attempts reached`
  String get max_attempts_reached {
    return Intl.message(
      'Maximum token attempts reached',
      name: 'max_attempts_reached',
      desc: '',
      args: [],
    );
  }

  /// `Token error`
  String get token_error {
    return Intl.message('Token error', name: 'token_error', desc: '', args: []);
  }

  /// `Sign up starting`
  String get signup_starting {
    return Intl.message(
      'Sign up starting',
      name: 'signup_starting',
      desc: '',
      args: [],
    );
  }

  /// `Registration page error`
  String get registration_page_error {
    return Intl.message(
      'Registration page error',
      name: 'registration_page_error',
      desc: '',
      args: [],
    );
  }

  /// `Processing`
  String get processing {
    return Intl.message('Processing', name: 'processing', desc: '', args: []);
  }

  /// `Operation failed`
  String get operation_failed {
    return Intl.message(
      'Operation failed',
      name: 'operation_failed',
      desc: '',
      args: [],
    );
  }

  /// `Email is unavailable`
  String get email_unavailable {
    return Intl.message(
      'Email is unavailable',
      name: 'email_unavailable',
      desc: '',
      args: [],
    );
  }

  /// `Sign up restricted, please try again`
  String get sign_up_restricted {
    return Intl.message(
      'Sign up restricted, please try again',
      name: 'sign_up_restricted',
      desc: '',
      args: [],
    );
  }

  /// `Verification code error`
  String get verification_code_error {
    return Intl.message(
      'Verification code error',
      name: 'verification_code_error',
      desc: '',
      args: [],
    );
  }

  /// `Waiting`
  String get waiting {
    return Intl.message('Waiting', name: 'waiting', desc: '', args: []);
  }

  /// `Usage limit`
  String get usage_limit {
    return Intl.message('Usage limit', name: 'usage_limit', desc: '', args: []);
  }

  /// `Could not get usage limit`
  String get usage_limit_error {
    return Intl.message(
      'Could not get usage limit',
      name: 'usage_limit_error',
      desc: '',
      args: [],
    );
  }

  /// `Registration successful`
  String get registration_success {
    return Intl.message(
      'Registration successful',
      name: 'registration_success',
      desc: '',
      args: [],
    );
  }

  /// `Account created`
  String get account_created {
    return Intl.message(
      'Account created',
      name: 'account_created',
      desc: '',
      args: [],
    );
  }

  /// `Completed`
  String get completed {
    return Intl.message('Completed', name: 'completed', desc: '', args: []);
  }

  /// `Authentication updated`
  String get auth_update_success {
    return Intl.message(
      'Authentication updated',
      name: 'auth_update_success',
      desc: '',
      args: [],
    );
  }

  /// `Browser quit error`
  String get browser_quit_error {
    return Intl.message(
      'Browser quit error',
      name: 'browser_quit_error',
      desc: '',
      args: [],
    );
  }

  /// `No values were updated`
  String get no_update_values {
    return Intl.message(
      'No values were updated',
      name: 'no_update_values',
      desc: '',
      args: [],
    );
  }

  /// `Database error`
  String get database_error {
    return Intl.message(
      'Database error',
      name: 'database_error',
      desc: '',
      args: [],
    );
  }

  /// `Authentication error`
  String get auth_error {
    return Intl.message(
      'Authentication error',
      name: 'auth_error',
      desc: '',
      args: [],
    );
  }

  /// `Account details`
  String get account_details {
    return Intl.message(
      'Account details',
      name: 'account_details',
      desc: '',
      args: [],
    );
  }

  /// `Email`
  String get email {
    return Intl.message('Email', name: 'email', desc: '', args: []);
  }

  /// `User ID`
  String get user_id {
    return Intl.message('User ID', name: 'user_id', desc: '', args: []);
  }

  /// `Type`
  String get type {
    return Intl.message('Type', name: 'type', desc: '', args: []);
  }

  /// `Created date`
  String get created {
    return Intl.message('Created date', name: 'created', desc: '', args: []);
  }

  /// `Limit`
  String get limit {
    return Intl.message('Limit', name: 'limit', desc: '', args: []);
  }

  /// `Token`
  String get token {
    return Intl.message('Token', name: 'token', desc: '', args: []);
  }

  /// `Accounts`
  String get accounts {
    return Intl.message('Accounts', name: 'accounts', desc: '', args: []);
  }

  /// `Delete account`
  String get delete_account {
    return Intl.message(
      'Delete account',
      name: 'delete_account',
      desc: '',
      args: [],
    );
  }

  /// `Are you sure you want to delete the account?`
  String get delete_account_confirmation {
    return Intl.message(
      'Are you sure you want to delete the account?',
      name: 'delete_account_confirmation',
      desc: '',
      args: [],
    );
  }

  /// `Cancel`
  String get cancel {
    return Intl.message('Cancel', name: 'cancel', desc: '', args: []);
  }

  /// `Delete`
  String get delete {
    return Intl.message('Delete', name: 'delete', desc: '', args: []);
  }

  /// `Console`
  String get console {
    return Intl.message('Console', name: 'console', desc: '', args: []);
  }

  /// `Stop`
  String get stop {
    return Intl.message('Stop', name: 'stop', desc: '', args: []);
  }

  /// `Start proxy`
  String get start_proxy {
    return Intl.message('Start proxy', name: 'start_proxy', desc: '', args: []);
  }

  /// `Enable proxy while using Cursor. This manipulates web requests to prevent trial period error.`
  String get enable_proxy {
    return Intl.message(
      'Enable proxy while using Cursor. This manipulates web requests to prevent trial period error.',
      name: 'enable_proxy',
      desc: '',
      args: [],
    );
  }

  /// `Create Cursor account`
  String get create_cursor_account {
    return Intl.message(
      'Create Cursor account',
      name: 'create_cursor_account',
      desc: '',
      args: [],
    );
  }

  /// `Cursor`
  String get cursor {
    return Intl.message('Cursor', name: 'cursor', desc: '', args: []);
  }

  /// `Windsurf`
  String get windsurf {
    return Intl.message('Windsurf', name: 'windsurf', desc: '', args: []);
  }

  /// `Create Windsurf account`
  String get create_windsurf_account {
    return Intl.message(
      'Create Windsurf account',
      name: 'create_windsurf_account',
      desc: '',
      args: [],
    );
  }

  /// `Settings`
  String get settings {
    return Intl.message('Settings', name: 'settings', desc: '', args: []);
  }

  /// `Browser visibility`
  String get browser_visibility {
    return Intl.message(
      'Browser visibility',
      name: 'browser_visibility',
      desc: '',
      args: [],
    );
  }

  /// `Email validator type`
  String get email_validator_type {
    return Intl.message(
      'Email validator type',
      name: 'email_validator_type',
      desc: '',
      args: [],
    );
  }

  /// `IMAP settings`
  String get imap_settings {
    return Intl.message(
      'IMAP settings',
      name: 'imap_settings',
      desc: '',
      args: [],
    );
  }

  /// `Server`
  String get server {
    return Intl.message('Server', name: 'server', desc: '', args: []);
  }

  /// `Username`
  String get username {
    return Intl.message('Username', name: 'username', desc: '', args: []);
  }

  /// `Password`
  String get password {
    return Intl.message('Password', name: 'password', desc: '', args: []);
  }

  /// `Port`
  String get port {
    return Intl.message('Port', name: 'port', desc: '', args: []);
  }

  /// `IMAP settings saved`
  String get imap_settings_saved {
    return Intl.message(
      'IMAP settings saved',
      name: 'imap_settings_saved',
      desc: '',
      args: [],
    );
  }

  /// `Save IMAP settings`
  String get save_imap_settings {
    return Intl.message(
      'Save IMAP settings',
      name: 'save_imap_settings',
      desc: '',
      args: [],
    );
  }

  /// `About`
  String get about {
    return Intl.message('About', name: 'about', desc: '', args: []);
  }

  /// `Version`
  String get version {
    return Intl.message('Version', name: 'version', desc: '', args: []);
  }

  /// `Welcome to AI Auto Free`
  String get welcome_to_ai_auto_free {
    return Intl.message(
      'Welcome to AI Auto Free',
      name: 'welcome_to_ai_auto_free',
      desc: '',
      args: [],
    );
  }

  /// `Settings are being configured`
  String get settings_are_being_configured {
    return Intl.message(
      'Settings are being configured',
      name: 'settings_are_being_configured',
      desc: '',
      args: [],
    );
  }

  /// `Python is not available in PATH. If you are installing for the first time, restart your computer. Otherwise, you may need to add Python to PATH.`
  String get you_should_restart_your_computer {
    return Intl.message(
      'Python is not available in PATH. If you are installing for the first time, restart your computer. Otherwise, you may need to add Python to PATH.',
      name: 'you_should_restart_your_computer',
      desc: '',
      args: [],
    );
  }

  /// `Retry`
  String get retry {
    return Intl.message('Retry', name: 'retry', desc: '', args: []);
  }

  /// `Checking Python`
  String get checking_python {
    return Intl.message(
      'Checking Python',
      name: 'checking_python',
      desc: '',
      args: [],
    );
  }

  /// `Checking others`
  String get checking_others {
    return Intl.message(
      'Checking others',
      name: 'checking_others',
      desc: '',
      args: [],
    );
  }

  /// `Python not available`
  String get python_not_available {
    return Intl.message(
      'Python not available',
      name: 'python_not_available',
      desc: '',
      args: [],
    );
  }

  /// `Python installation failed`
  String get python_installation_failed {
    return Intl.message(
      'Python installation failed',
      name: 'python_installation_failed',
      desc: '',
      args: [],
    );
  }

  /// `Python available`
  String get python_available {
    return Intl.message(
      'Python available',
      name: 'python_available',
      desc: '',
      args: [],
    );
  }

  /// `Checking Google Chrome`
  String get checking_chrome {
    return Intl.message(
      'Checking Google Chrome',
      name: 'checking_chrome',
      desc: '',
      args: [],
    );
  }

  /// `Please install Google Chrome`
  String get please_install_google_chrome {
    return Intl.message(
      'Please install Google Chrome',
      name: 'please_install_google_chrome',
      desc: '',
      args: [],
    );
  }

  /// `Getting required codes`
  String get getting_required_codes {
    return Intl.message(
      'Getting required codes',
      name: 'getting_required_codes',
      desc: '',
      args: [],
    );
  }

  /// `Error during dependency installation`
  String get error_during_dependency_installation {
    return Intl.message(
      'Error during dependency installation',
      name: 'error_during_dependency_installation',
      desc: '',
      args: [],
    );
  }

  /// `Checking pip installation`
  String get checking_pip_installation {
    return Intl.message(
      'Checking pip installation',
      name: 'checking_pip_installation',
      desc: '',
      args: [],
    );
  }

  /// `Pip is not installed, installing pip`
  String get pip_is_not_installed_installing_pip {
    return Intl.message(
      'Pip is not installed, installing pip',
      name: 'pip_is_not_installed_installing_pip',
      desc: '',
      args: [],
    );
  }

  /// `Pip is already installed`
  String get pip_is_already_installed {
    return Intl.message(
      'Pip is already installed',
      name: 'pip_is_already_installed',
      desc: '',
      args: [],
    );
  }

  /// `Pip installed successfully`
  String get pip_installed_successfully {
    return Intl.message(
      'Pip installed successfully',
      name: 'pip_installed_successfully',
      desc: '',
      args: [],
    );
  }

  /// `Requirements could not be installed automatically. Please run the following command in the terminal: '{dependency}'`
  String failed_to_install_pip_please_install_python_with_pip_included(
    Object dependency,
  ) {
    return Intl.message(
      'Requirements could not be installed automatically. Please run the following command in the terminal: `$dependency`',
      name: 'failed_to_install_pip_please_install_python_with_pip_included',
      desc: '',
      args: [dependency],
    );
  }

  /// `Checking`
  String get checking {
    return Intl.message('Checking', name: 'checking', desc: '', args: []);
  }

  /// `Installing`
  String get installing {
    return Intl.message('Installing', name: 'installing', desc: '', args: []);
  }

  /// `Installed successfully`
  String get installed_successfully {
    return Intl.message(
      'Installed successfully',
      name: 'installed_successfully',
      desc: '',
      args: [],
    );
  }

  /// `Is already installed`
  String get is_already_installed {
    return Intl.message(
      'Is already installed',
      name: 'is_already_installed',
      desc: '',
      args: [],
    );
  }

  /// `Error installing dependencies, please try manually. Run the following command in the terminal: '{dependency}'`
  String error_installing_dependencies(Object dependency) {
    return Intl.message(
      'Error installing dependencies, please try manually. Run the following command in the terminal: `$dependency`',
      name: 'error_installing_dependencies',
      desc: '',
      args: [dependency],
    );
  }

  /// `Please install Python from the website`
  String get please_install_python_from_the_website {
    return Intl.message(
      'Please install Python from the website',
      name: 'please_install_python_from_the_website',
      desc: '',
      args: [],
    );
  }

  /// `Downloading Python installer`
  String get downloading_python_installer {
    return Intl.message(
      'Downloading Python installer',
      name: 'downloading_python_installer',
      desc: '',
      args: [],
    );
  }

  /// `Downloading Python`
  String get downloading_python {
    return Intl.message(
      'Downloading Python',
      name: 'downloading_python',
      desc: '',
      args: [],
    );
  }

  /// `Installing Python`
  String get installing_python {
    return Intl.message(
      'Installing Python',
      name: 'installing_python',
      desc: '',
      args: [],
    );
  }

  /// `Installing Python silently`
  String get installing_python_silently {
    return Intl.message(
      'Installing Python silently',
      name: 'installing_python_silently',
      desc: '',
      args: [],
    );
  }

  /// `Error installing Python`
  String get error_installing_python {
    return Intl.message(
      'Error installing Python',
      name: 'error_installing_python',
      desc: '',
      args: [],
    );
  }

  /// `Downloading Python installer for macOS`
  String get downloading_python_installer_for_macos {
    return Intl.message(
      'Downloading Python installer for macOS',
      name: 'downloading_python_installer_for_macos',
      desc: '',
      args: [],
    );
  }

  /// `Downloading Python installer for Windows`
  String get downloading_python_installer_for_windows {
    return Intl.message(
      'Downloading Python installer for Windows',
      name: 'downloading_python_installer_for_windows',
      desc: '',
      args: [],
    );
  }

  /// `Installing Python using package manager`
  String get installing_python_using_package_manager {
    return Intl.message(
      'Installing Python using package manager',
      name: 'installing_python_using_package_manager',
      desc: '',
      args: [],
    );
  }

  /// `Failed to update package list`
  String get failed_to_update_package_list {
    return Intl.message(
      'Failed to update package list',
      name: 'failed_to_update_package_list',
      desc: '',
      args: [],
    );
  }

  /// `Error installing Python using package manager`
  String get installing_python_using_package_manager_error {
    return Intl.message(
      'Error installing Python using package manager',
      name: 'installing_python_using_package_manager_error',
      desc: '',
      args: [],
    );
  }

  /// `Reset Cursor Trial`
  String get patch_cursor {
    return Intl.message(
      'Reset Cursor Trial',
      name: 'patch_cursor',
      desc: '',
      args: [],
    );
  }

  /// `Login Account`
  String get switch_cursor_account {
    return Intl.message(
      'Login Account',
      name: 'switch_cursor_account',
      desc: '',
      args: [],
    );
  }

  /// `Open Account in Browser`
  String get open_cursor_account {
    return Intl.message(
      'Open Account in Browser',
      name: 'open_cursor_account',
      desc: '',
      args: [],
    );
  }

  /// `Update ({version})`
  String update(Object version) {
    return Intl.message(
      'Update ($version)',
      name: 'update',
      desc: '',
      args: [version],
    );
  }

  /// `Redirected emails`
  String get redirected_emails {
    return Intl.message(
      'Redirected emails',
      name: 'redirected_emails',
      desc: '',
      args: [],
    );
  }

  /// `Add redirected email`
  String get add_redirected_email {
    return Intl.message(
      'Add redirected email',
      name: 'add_redirected_email',
      desc: '',
      args: [],
    );
  }

  /// `Remove redirected email`
  String get remove_redirected_email {
    return Intl.message(
      'Remove redirected email',
      name: 'remove_redirected_email',
      desc: '',
      args: [],
    );
  }

  /// `Enter email`
  String get enter_email {
    return Intl.message('Enter email', name: 'enter_email', desc: '', args: []);
  }

  /// `Enter the email addresses you want to redirect to the IMAP server. These email addresses will be used when creating an account.`
  String get redirected_email_info {
    return Intl.message(
      'Enter the email addresses you want to redirect to the IMAP server. These email addresses will be used when creating an account.',
      name: 'redirected_email_info',
      desc: '',
      args: [],
    );
  }

  /// `New Version Available`
  String get new_version_available {
    return Intl.message(
      'New Version Available',
      name: 'new_version_available',
      desc: '',
      args: [],
    );
  }

  /// `Changes`
  String get changes {
    return Intl.message('Changes', name: 'changes', desc: '', args: []);
  }

  /// `Install Update`
  String get download_update {
    return Intl.message(
      'Install Update',
      name: 'download_update',
      desc: '',
      args: [],
    );
  }

  /// `Not Now`
  String get not_now {
    return Intl.message('Not Now', name: 'not_now', desc: '', args: []);
  }

  /// `This update is mandatory. Please download the new version.`
  String get mandatory_update_message {
    return Intl.message(
      'This update is mandatory. Please download the new version.',
      name: 'mandatory_update_message',
      desc: '',
      args: [],
    );
  }

  /// `Update information not found`
  String get update_info_not_found {
    return Intl.message(
      'Update information not found',
      name: 'update_info_not_found',
      desc: '',
      args: [],
    );
  }

  /// `Continue`
  String get continue_ {
    return Intl.message('Continue', name: 'continue_', desc: '', args: []);
  }

  /// `Connection error: {message}`
  String update_connection_error(Object message) {
    return Intl.message(
      'Connection error: $message',
      name: 'update_connection_error',
      desc: '',
      args: [message],
    );
  }

  /// `An unexpected error occurred: {message}`
  String unexpected_error(Object message) {
    return Intl.message(
      'An unexpected error occurred: $message',
      name: 'unexpected_error',
      desc: '',
      args: [message],
    );
  }

  /// `Invalid server response`
  String get invalid_server_response {
    return Intl.message(
      'Invalid server response',
      name: 'invalid_server_response',
      desc: '',
      args: [],
    );
  }

  /// `Checking auth`
  String get checking_auth {
    return Intl.message(
      'Checking auth',
      name: 'checking_auth',
      desc: '',
      args: [],
    );
  }

  /// `Remaining credits`
  String get remaining_credits {
    return Intl.message(
      'Remaining credits',
      name: 'remaining_credits',
      desc: '',
      args: [],
    );
  }

  /// `Not enough credits`
  String get not_enough_credits {
    return Intl.message(
      'Not enough credits',
      name: 'not_enough_credits',
      desc: '',
      args: [],
    );
  }

  /// `Please buy credits to continue.`
  String get not_enough_credits_message {
    return Intl.message(
      'Please buy credits to continue.',
      name: 'not_enough_credits_message',
      desc: '',
      args: [],
    );
  }

  /// `days`
  String get days {
    return Intl.message('days', name: 'days', desc: '', args: []);
  }

  /// `today`
  String get today {
    return Intl.message('today', name: 'today', desc: '', args: []);
  }

  /// `credits`
  String get credits {
    return Intl.message('credits', name: 'credits', desc: '', args: []);
  }

  /// `Credits`
  String get credits_b {
    return Intl.message('Credits', name: 'credits_b', desc: '', args: []);
  }

  /// `Price`
  String get price {
    return Intl.message('Price', name: 'price', desc: '', args: []);
  }

  /// `Your ID`
  String get your_id {
    return Intl.message('Your ID', name: 'your_id', desc: '', args: []);
  }

  /// `Your ID copied`
  String get your_id_copied {
    return Intl.message(
      'Your ID copied',
      name: 'your_id_copied',
      desc: '',
      args: [],
    );
  }

  /// `Contact us for payment`
  String get socials_title {
    return Intl.message(
      'Contact us for payment',
      name: 'socials_title',
      desc: '',
      args: [],
    );
  }

  /// `Running required commands`
  String get running_required_commands {
    return Intl.message(
      'Running required commands',
      name: 'running_required_commands',
      desc: '',
      args: [],
    );
  }

  /// `Test Cursor Account`
  String get test_cursor_account {
    return Intl.message(
      'Test Cursor Account',
      name: 'test_cursor_account',
      desc: '',
      args: [],
    );
  }

  /// `Testing account`
  String get testing_account {
    return Intl.message(
      'Testing account',
      name: 'testing_account',
      desc: '',
      args: [],
    );
  }

  /// `Account valid`
  String get account_valid {
    return Intl.message(
      'Account valid',
      name: 'account_valid',
      desc: '',
      args: [],
    );
  }

  /// `Account blocked by Cursor`
  String get account_invalid {
    return Intl.message(
      'Account blocked by Cursor',
      name: 'account_invalid',
      desc: '',
      args: [],
    );
  }

  /// `Account test error`
  String get account_test_error {
    return Intl.message(
      'Account test error',
      name: 'account_test_error',
      desc: '',
      args: [],
    );
  }

  /// `Show notifications`
  String get show_notifications {
    return Intl.message(
      'Show notifications',
      name: 'show_notifications',
      desc: '',
      args: [],
    );
  }

  /// `Notifications`
  String get notifications {
    return Intl.message(
      'Notifications',
      name: 'notifications',
      desc: '',
      args: [],
    );
  }

  /// `Clear notifications`
  String get clear_notifications {
    return Intl.message(
      'Clear notifications',
      name: 'clear_notifications',
      desc: '',
      args: [],
    );
  }

  /// `No notifications`
  String get no_notifications {
    return Intl.message(
      'No notifications',
      name: 'no_notifications',
      desc: '',
      args: [],
    );
  }

  /// `Random name generation failed`
  String get random_name_generation_failed {
    return Intl.message(
      'Random name generation failed',
      name: 'random_name_generation_failed',
      desc: '',
      args: [],
    );
  }

  /// `Email secret key failed`
  String get email_secret_failed {
    return Intl.message(
      'Email secret key failed',
      name: 'email_secret_failed',
      desc: '',
      args: [],
    );
  }

  /// `Inbox check failed`
  String get inbox_check_failed {
    return Intl.message(
      'Inbox check failed',
      name: 'inbox_check_failed',
      desc: '',
      args: [],
    );
  }

  /// `View mail failed`
  String get view_mail_failed {
    return Intl.message(
      'View mail failed',
      name: 'view_mail_failed',
      desc: '',
      args: [],
    );
  }

  /// `Email rate limit exceeded`
  String get email_rate_limit {
    return Intl.message(
      'Email rate limit exceeded',
      name: 'email_rate_limit',
      desc: '',
      args: [],
    );
  }

  /// `Buy credits`
  String get buy_credits {
    return Intl.message('Buy credits', name: 'buy_credits', desc: '', args: []);
  }

  /// `Pool has {count} account`
  String pool_account_count(Object count) {
    return Intl.message(
      'Pool has $count account',
      name: 'pool_account_count',
      desc: '',
      args: [count],
    );
  }

  /// `Assigning account from pool`
  String get assigning_account {
    return Intl.message(
      'Assigning account from pool',
      name: 'assigning_account',
      desc: '',
      args: [],
    );
  }

  /// `Account assigned from pool`
  String get assigning_account_success {
    return Intl.message(
      'Account assigned from pool',
      name: 'assigning_account_success',
      desc: '',
      args: [],
    );
  }

  /// `Failed to assign account from pool`
  String get assigning_account_error {
    return Intl.message(
      'Failed to assign account from pool',
      name: 'assigning_account_error',
      desc: '',
      args: [],
    );
  }

  /// `Currently, there is no account in the pool`
  String get pool_deactivated {
    return Intl.message(
      'Currently, there is no account in the pool',
      name: 'pool_deactivated',
      desc: '',
      args: [],
    );
  }

  /// `Windsurf Token Guide`
  String get windsurf_token_guide_title {
    return Intl.message(
      'Windsurf Token Guide',
      name: 'windsurf_token_guide_title',
      desc: '',
      args: [],
    );
  }

  /// `Open Windsurf Editor`
  String get windsurf_token_guide_1 {
    return Intl.message(
      'Open Windsurf Editor',
      name: 'windsurf_token_guide_1',
      desc: '',
      args: [],
    );
  }

  /// `Press CTRL + SHIFT + P`
  String get windsurf_token_guide_2 {
    return Intl.message(
      'Press CTRL + SHIFT + P',
      name: 'windsurf_token_guide_2',
      desc: '',
      args: [],
    );
  }

  /// `Type 'login' and select the first option`
  String get windsurf_token_guide_3 {
    return Intl.message(
      'Type \'login\' and select the first option',
      name: 'windsurf_token_guide_3',
      desc: '',
      args: [],
    );
  }

  /// `A browser will open, close it and return to the editor.`
  String get windsurf_token_guide_4 {
    return Intl.message(
      'A browser will open, close it and return to the editor.',
      name: 'windsurf_token_guide_4',
      desc: '',
      args: [],
    );
  }

  /// `Paste the token you received into the application.`
  String get windsurf_token_guide_5 {
    return Intl.message(
      'Paste the token you received into the application.',
      name: 'windsurf_token_guide_5',
      desc: '',
      args: [],
    );
  }

  /// `Close`
  String get windsurf_token_guide_close_button_text {
    return Intl.message(
      'Close',
      name: 'windsurf_token_guide_close_button_text',
      desc: '',
      args: [],
    );
  }

  /// `Token copied`
  String get token_copied {
    return Intl.message(
      'Token copied',
      name: 'token_copied',
      desc: '',
      args: [],
    );
  }

  /// `Note: The token is valid for 1 hour.`
  String get windsurf_token_note {
    return Intl.message(
      'Note: The token is valid for 1 hour.',
      name: 'windsurf_token_note',
      desc: '',
      args: [],
    );
  }

  /// `Pricing`
  String get pricing_title {
    return Intl.message('Pricing', name: 'pricing_title', desc: '', args: []);
  }

  /// `Pricing information`
  String get pricing_message {
    return Intl.message(
      'Pricing information',
      name: 'pricing_message',
      desc: '',
      args: [],
    );
  }

  /// `Buy Credits`
  String get pricing_buy_credits {
    return Intl.message(
      'Buy Credits',
      name: 'pricing_buy_credits',
      desc: '',
      args: [],
    );
  }

  /// `Credits per dollar`
  String get pricing_credits_per_dollar {
    return Intl.message(
      'Credits per dollar',
      name: 'pricing_credits_per_dollar',
      desc: '',
      args: [],
    );
  }

  /// `Credits per dollar (Daily)`
  String get pricing_credits_per_dollar_per_day {
    return Intl.message(
      'Credits per dollar (Daily)',
      name: 'pricing_credits_per_dollar_per_day',
      desc: '',
      args: [],
    );
  }

  /// `Credits per dollar (Monthly)`
  String get pricing_credits_per_dollar_per_month {
    return Intl.message(
      'Credits per dollar (Monthly)',
      name: 'pricing_credits_per_dollar_per_month',
      desc: '',
      args: [],
    );
  }

  /// `Custom Amount`
  String get pricing_custom_amount {
    return Intl.message(
      'Custom Amount',
      name: 'pricing_custom_amount',
      desc: '',
      args: [],
    );
  }

  /// `Total Price`
  String get pricing_total_price {
    return Intl.message(
      'Total Price',
      name: 'pricing_total_price',
      desc: '',
      args: [],
    );
  }

  /// `You will need to use this ID when making a payment`
  String get pricing_payment_id_note {
    return Intl.message(
      'You will need to use this ID when making a payment',
      name: 'pricing_payment_id_note',
      desc: '',
      args: [],
    );
  }

  /// `Contact`
  String get pricing_contact {
    return Intl.message('Contact', name: 'pricing_contact', desc: '', args: []);
  }

  /// `Contact us for payment`
  String get pricing_contact_message {
    return Intl.message(
      'Contact us for payment',
      name: 'pricing_contact_message',
      desc: '',
      args: [],
    );
  }

  /// `Payment ID`
  String get pricing_payment_id {
    return Intl.message(
      'Payment ID',
      name: 'pricing_payment_id',
      desc: '',
      args: [],
    );
  }

  /// `Copy`
  String get pricing_payment_id_copy {
    return Intl.message(
      'Copy',
      name: 'pricing_payment_id_copy',
      desc: '',
      args: [],
    );
  }

  /// `Payment ID copied`
  String get pricing_payment_id_copied {
    return Intl.message(
      'Payment ID copied',
      name: 'pricing_payment_id_copied',
      desc: '',
      args: [],
    );
  }

  /// `You will need to use this ID when making a payment`
  String get pricing_payment_id_copied_note {
    return Intl.message(
      'You will need to use this ID when making a payment',
      name: 'pricing_payment_id_copied_note',
      desc: '',
      args: [],
    );
  }

  /// `Credits Amount`
  String get pricing_credits_amount {
    return Intl.message(
      'Credits Amount',
      name: 'pricing_credits_amount',
      desc: '',
      args: [],
    );
  }

  /// `You can set the credits amount as you want.`
  String get pricing_credits_amount_note {
    return Intl.message(
      'You can set the credits amount as you want.',
      name: 'pricing_credits_amount_note',
      desc: '',
      args: [],
    );
  }

  /// `Manual`
  String get manual {
    return Intl.message('Manual', name: 'manual', desc: '', args: []);
  }

  /// `Browser`
  String get browser_message {
    return Intl.message('Browser', name: 'browser_message', desc: '', args: []);
  }

  /// `Browser initialized`
  String get browser_initialized {
    return Intl.message(
      'Browser initialized',
      name: 'browser_initialized',
      desc: '',
      args: [],
    );
  }

  /// `Failed to open auth page`
  String get failed_open_auth_page {
    return Intl.message(
      'Failed to open auth page',
      name: 'failed_open_auth_page',
      desc: '',
      args: [],
    );
  }

  /// `Failed to get cursor session token`
  String get failed_get_cursor_session_token {
    return Intl.message(
      'Failed to get cursor session token',
      name: 'failed_get_cursor_session_token',
      desc: '',
      args: [],
    );
  }

  /// `Opening auth page, please login to the opened page.`
  String get opening_auth_page {
    return Intl.message(
      'Opening auth page, please login to the opened page.',
      name: 'opening_auth_page',
      desc: '',
      args: [],
    );
  }

  /// `Auth detected, getting account details`
  String get auth_detected {
    return Intl.message(
      'Auth detected, getting account details',
      name: 'auth_detected',
      desc: '',
      args: [],
    );
  }

  /// `Auth page error`
  String get auth_page_error {
    return Intl.message(
      'Auth page error',
      name: 'auth_page_error',
      desc: '',
      args: [],
    );
  }

  /// `Getting account details`
  String get getting_cursor_session_token {
    return Intl.message(
      'Getting account details',
      name: 'getting_cursor_session_token',
      desc: '',
      args: [],
    );
  }

  /// `Python installation completed, checking PATH`
  String get python_path_progress {
    return Intl.message(
      'Python installation completed, checking PATH',
      name: 'python_path_progress',
      desc: '',
      args: [],
    );
  }

  /// `Python PATH not found, you may need to restart your computer.`
  String get python_path_error {
    return Intl.message(
      'Python PATH not found, you may need to restart your computer.',
      name: 'python_path_error',
      desc: '',
      args: [],
    );
  }

  /// `Python installation completed. Restart your computer.`
  String get python_path_success {
    return Intl.message(
      'Python installation completed. Restart your computer.',
      name: 'python_path_success',
      desc: '',
      args: [],
    );
  }

  /// `Downloading update`
  String get downloading_update {
    return Intl.message(
      'Downloading update',
      name: 'downloading_update',
      desc: '',
      args: [],
    );
  }

  /// `Download failed`
  String get download_failed {
    return Intl.message(
      'Download failed',
      name: 'download_failed',
      desc: '',
      args: [],
    );
  }

  /// `Installing update`
  String get installing_update {
    return Intl.message(
      'Installing update',
      name: 'installing_update',
      desc: '',
      args: [],
    );
  }

  /// `Update failed: {message}`
  String update_failed(Object message) {
    return Intl.message(
      'Update failed: $message',
      name: 'update_failed',
      desc: '',
      args: [message],
    );
  }

  /// `Download completed`
  String get download_completed {
    return Intl.message(
      'Download completed',
      name: 'download_completed',
      desc: '',
      args: [],
    );
  }

  /// `No download URL found`
  String get no_download_url {
    return Intl.message(
      'No download URL found',
      name: 'no_download_url',
      desc: '',
      args: [],
    );
  }

  /// `Downloading: `
  String get downloading {
    return Intl.message(
      'Downloading: ',
      name: 'downloading',
      desc: '',
      args: [],
    );
  }

  /// `Download error: {message}`
  String download_error(Object message) {
    return Intl.message(
      'Download error: $message',
      name: 'download_error',
      desc: '',
      args: [message],
    );
  }

  /// `Close`
  String get close {
    return Intl.message('Close', name: 'close', desc: '', args: []);
  }

  /// `Manual Download`
  String get manual_download {
    return Intl.message(
      'Manual Download',
      name: 'manual_download',
      desc: '',
      args: [],
    );
  }

  /// `Status`
  String get status {
    return Intl.message('Status', name: 'status', desc: '', args: []);
  }

  /// `Components`
  String get components {
    return Intl.message('Components', name: 'components', desc: '', args: []);
  }

  /// `Active Incidents`
  String get active_incidents {
    return Intl.message(
      'Active Incidents',
      name: 'active_incidents',
      desc: '',
      args: [],
    );
  }

  /// `Status details not available`
  String get status_details_not_available {
    return Intl.message(
      'Status details not available',
      name: 'status_details_not_available',
      desc: '',
      args: [],
    );
  }

  /// `Operational`
  String get operational {
    return Intl.message('Operational', name: 'operational', desc: '', args: []);
  }

  /// `Degraded Performance`
  String get degraded_performance {
    return Intl.message(
      'Degraded Performance',
      name: 'degraded_performance',
      desc: '',
      args: [],
    );
  }

  /// `Partial Outage`
  String get partial_outage {
    return Intl.message(
      'Partial Outage',
      name: 'partial_outage',
      desc: '',
      args: [],
    );
  }

  /// `Major Outage`
  String get major_outage {
    return Intl.message(
      'Major Outage',
      name: 'major_outage',
      desc: '',
      args: [],
    );
  }

  /// `Auto login starting`
  String get auto_login_starting {
    return Intl.message(
      'Auto login starting',
      name: 'auto_login_starting',
      desc: '',
      args: [],
    );
  }

  /// `Navigated to Cursor`
  String get navigated_to_cursor {
    return Intl.message(
      'Navigated to Cursor',
      name: 'navigated_to_cursor',
      desc: '',
      args: [],
    );
  }

  /// `Browser logged in`
  String get account_logged_in {
    return Intl.message(
      'Browser logged in',
      name: 'account_logged_in',
      desc: '',
      args: [],
    );
  }

  /// `READY`
  String get cursor_browser_login_info {
    return Intl.message(
      'READY',
      name: 'cursor_browser_login_info',
      desc: '',
      args: [],
    );
  }

  /// `No accounts found`
  String get no_accounts_found {
    return Intl.message(
      'No accounts found',
      name: 'no_accounts_found',
      desc: '',
      args: [],
    );
  }

  /// `Swipe left to delete`
  String get swipe_to_delete {
    return Intl.message(
      'Swipe left to delete',
      name: 'swipe_to_delete',
      desc: '',
      args: [],
    );
  }

  /// `Daily login`
  String get daily_login {
    return Intl.message('Daily login', name: 'daily_login', desc: '', args: []);
  }

  /// `Create Gift Code`
  String get create_gift_code {
    return Intl.message(
      'Create Gift Code',
      name: 'create_gift_code',
      desc: '',
      args: [],
    );
  }

  /// `Gift Code`
  String get gift_code {
    return Intl.message('Gift Code', name: 'gift_code', desc: '', args: []);
  }

  /// `Redeem Gift Code`
  String get redeem_gift_code {
    return Intl.message(
      'Redeem Gift Code',
      name: 'redeem_gift_code',
      desc: '',
      args: [],
    );
  }

  /// `Credits Amount`
  String get credits_amount {
    return Intl.message(
      'Credits Amount',
      name: 'credits_amount',
      desc: '',
      args: [],
    );
  }

  /// `Enter credits amount`
  String get enter_credits_amount {
    return Intl.message(
      'Enter credits amount',
      name: 'enter_credits_amount',
      desc: '',
      args: [],
    );
  }

  /// `Generate Code`
  String get generate_code {
    return Intl.message(
      'Generate Code',
      name: 'generate_code',
      desc: '',
      args: [],
    );
  }

  /// `No gift codes created yet`
  String get no_gift_codes_created {
    return Intl.message(
      'No gift codes created yet',
      name: 'no_gift_codes_created',
      desc: '',
      args: [],
    );
  }

  /// `Redeem Code`
  String get redeem_code {
    return Intl.message('Redeem Code', name: 'redeem_code', desc: '', args: []);
  }

  /// `How to Use Gift Code?`
  String get gift_code_info_title {
    return Intl.message(
      'How to Use Gift Code?',
      name: 'gift_code_info_title',
      desc: '',
      args: [],
    );
  }

  /// `Enter the gift code you received here to add credits to your account. Gift codes should be in XXXX-XXXX format.`
  String get gift_code_info_description {
    return Intl.message(
      'Enter the gift code you received here to add credits to your account. Gift codes should be in XXXX-XXXX format.',
      name: 'gift_code_info_description',
      desc: '',
      args: [],
    );
  }

  /// `Copied to clipboard`
  String get copied_to_clipboard {
    return Intl.message(
      'Copied to clipboard',
      name: 'copied_to_clipboard',
      desc: '',
      args: [],
    );
  }

  /// `Used`
  String get used {
    return Intl.message('Used', name: 'used', desc: '', args: []);
  }

  /// `Active`
  String get active {
    return Intl.message('Active', name: 'active', desc: '', args: []);
  }

  /// `Created At`
  String get created_at {
    return Intl.message('Created At', name: 'created_at', desc: '', args: []);
  }

  /// `Please enter credit amount`
  String get please_enter_credit_amount {
    return Intl.message(
      'Please enter credit amount',
      name: 'please_enter_credit_amount',
      desc: '',
      args: [],
    );
  }

  /// `Please enter a valid credit amount`
  String get please_enter_valid_credit_amount {
    return Intl.message(
      'Please enter a valid credit amount',
      name: 'please_enter_valid_credit_amount',
      desc: '',
      args: [],
    );
  }

  /// `You don't have enough credits`
  String get not_enough_credits_for_gift {
    return Intl.message(
      'You don\'t have enough credits',
      name: 'not_enough_credits_for_gift',
      desc: '',
      args: [],
    );
  }

  /// `Please enter a gift code`
  String get please_enter_gift_code {
    return Intl.message(
      'Please enter a gift code',
      name: 'please_enter_gift_code',
      desc: '',
      args: [],
    );
  }

  /// `Gift code successfully created: {code}`
  String gift_code_created_success(Object code) {
    return Intl.message(
      'Gift code successfully created: $code',
      name: 'gift_code_created_success',
      desc: '',
      args: [code],
    );
  }

  /// `{credits} credits added to your account`
  String credits_added_to_account(Object credits) {
    return Intl.message(
      '$credits credits added to your account',
      name: 'credits_added_to_account',
      desc: '',
      args: [credits],
    );
  }

  /// `An error occurred while creating gift code`
  String get gift_code_error {
    return Intl.message(
      'An error occurred while creating gift code',
      name: 'gift_code_error',
      desc: '',
      args: [],
    );
  }

  /// `An error occurred while redeeming gift code`
  String get redeem_code_error {
    return Intl.message(
      'An error occurred while redeeming gift code',
      name: 'redeem_code_error',
      desc: '',
      args: [],
    );
  }

  /// `Important Notice`
  String get notice_title {
    return Intl.message(
      'Important Notice',
      name: 'notice_title',
      desc: '',
      args: [],
    );
  }

  /// `Desktop Application Support Ending`
  String get desktop_support_ending {
    return Intl.message(
      'Desktop Application Support Ending',
      name: 'desktop_support_ending',
      desc: '',
      args: [],
    );
  }

  /// `Continuing on the Website`
  String get continue_on_web {
    return Intl.message(
      'Continuing on the Website',
      name: 'continue_on_web',
      desc: '',
      args: [],
    );
  }

  /// `https://aiaccounts.online`
  String get web_site_url {
    return Intl.message(
      'https://aiaccounts.online',
      name: 'web_site_url',
      desc: '',
      args: [],
    );
  }

  /// `Transferring Your Credits to the Website`
  String get transfer_credits_info {
    return Intl.message(
      'Transferring Your Credits to the Website',
      name: 'transfer_credits_info',
      desc: '',
      args: [],
    );
  }

  /// `You can convert your existing credits into a gift code using the "Generate Gift Code" button on the homepage and then use this code on our website to transfer your credits.`
  String get credits_transfer_steps {
    return Intl.message(
      'You can convert your existing credits into a gift code using the "Generate Gift Code" button on the homepage and then use this code on our website to transfer your credits.',
      name: 'credits_transfer_steps',
      desc: '',
      args: [],
    );
  }

  /// `Thank you for your support`
  String get thank_you_for_support {
    return Intl.message(
      'Thank you for your support',
      name: 'thank_you_for_support',
      desc: '',
      args: [],
    );
  }

  /// `Continue to App`
  String get continue_to_app {
    return Intl.message(
      'Continue to App',
      name: 'continue_to_app',
      desc: '',
      args: [],
    );
  }
}

class AppLocalizationDelegate extends LocalizationsDelegate<S> {
  const AppLocalizationDelegate();

  List<Locale> get supportedLocales {
    return const <Locale>[
      Locale.fromSubtags(languageCode: 'en'),
      Locale.fromSubtags(languageCode: 'de'),
      Locale.fromSubtags(languageCode: 'fr'),
      Locale.fromSubtags(languageCode: 'pt'),
      Locale.fromSubtags(languageCode: 'ru'),
      Locale.fromSubtags(languageCode: 'tr'),
      Locale.fromSubtags(languageCode: 'zh'),
    ];
  }

  @override
  bool isSupported(Locale locale) => _isSupported(locale);
  @override
  Future<S> load(Locale locale) => S.load(locale);
  @override
  bool shouldReload(AppLocalizationDelegate old) => false;

  bool _isSupported(Locale locale) {
    for (var supportedLocale in supportedLocales) {
      if (supportedLocale.languageCode == locale.languageCode) {
        return true;
      }
    }
    return false;
  }
}
