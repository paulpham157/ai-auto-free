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

  /// `You should restart your computer`
  String get you_should_restart_your_computer {
    return Intl.message(
      'You should restart your computer',
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

  /// `Failed to install pip, please install Python with pip included`
  String get failed_to_install_pip_please_install_python_with_pip_included {
    return Intl.message(
      'Failed to install pip, please install Python with pip included',
      name: 'failed_to_install_pip_please_install_python_with_pip_included',
      desc: '',
      args: [],
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

  /// `Error installing dependencies`
  String get error_installing_dependencies {
    return Intl.message(
      'Error installing dependencies',
      name: 'error_installing_dependencies',
      desc: '',
      args: [],
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

  /// `Patch Cursor`
  String get patch_cursor {
    return Intl.message(
      'Patch Cursor',
      name: 'patch_cursor',
      desc: '',
      args: [],
    );
  }

  /// `Switch Account`
  String get switch_cursor_account {
    return Intl.message(
      'Switch Account',
      name: 'switch_cursor_account',
      desc: '',
      args: [],
    );
  }

  /// `Update ({version})`
  String update(String version) {
    return Intl.message(
      'Update ($version)',
      name: 'update',
      desc: '',
      args: [version],
    );
  }
}

class AppLocalizationDelegate extends LocalizationsDelegate<S> {
  const AppLocalizationDelegate();

  List<Locale> get supportedLocales {
    return const <Locale>[
      Locale.fromSubtags(languageCode: 'en'),
      Locale.fromSubtags(languageCode: 'tr'),
      Locale.fromSubtags(languageCode: 'zh', countryCode: 'CN'),
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
