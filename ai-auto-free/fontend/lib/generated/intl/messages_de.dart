// DO NOT EDIT. This is code generated via package:intl/generate_localized.dart
// This is a library that provides messages for a de locale. All the
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
  String get localeName => 'de';

  static String m0(credits) =>
      "${credits} Guthaben wurde Ihrem Konto hinzugefügt";

  static String m1(message) => "Download-Fehler: ${message}";

  static String m2(dependency) =>
      "Fehler bei der Installation von Abhängigkeiten, bitte versuchen Sie es manuell. Führen Sie den folgenden Befehl im Terminal aus: `${dependency}`";

  static String m3(dependency) =>
      "Abhängigkeiten konnten nicht automatisch installiert werden. Bitte führen Sie den folgenden Befehl im Terminal aus: `${dependency}`";

  static String m4(code) => "Geschenkcode erfolgreich erstellt: ${code}";

  static String m5(count) => "Pool hat ${count} Konto";

  static String m6(message) =>
      "Ein unerwarteter Fehler ist aufgetreten: ${message}";

  static String m7(version) => "Aktualisieren (${version})";

  static String m8(message) => "Verbindungsfehler: ${message}";

  static String m9(message) => "Update fehlgeschlagen: ${message}";

  final messages = _notInlinedMessages(_notInlinedMessages);
  static Map<String, Function> _notInlinedMessages(_) => <String, Function>{
    "about": MessageLookupByLibrary.simpleMessage("Über"),
    "account_created": MessageLookupByLibrary.simpleMessage("Konto erstellt"),
    "account_details": MessageLookupByLibrary.simpleMessage("Kontodetails"),
    "account_invalid": MessageLookupByLibrary.simpleMessage(
      "Konto von Cursor blockiert",
    ),
    "account_logged_in": MessageLookupByLibrary.simpleMessage(
      "Browser angemeldet",
    ),
    "account_test_error": MessageLookupByLibrary.simpleMessage(
      "Konto-Test-Fehler",
    ),
    "account_valid": MessageLookupByLibrary.simpleMessage("Konto gültig"),
    "accounts": MessageLookupByLibrary.simpleMessage("Konten"),
    "active": MessageLookupByLibrary.simpleMessage("Aktiv"),
    "active_incidents": MessageLookupByLibrary.simpleMessage(
      "Aktive Ereignisse",
    ),
    "add_redirected_email": MessageLookupByLibrary.simpleMessage(
      "Weitergeleitete E-Mail hinzufügen",
    ),
    "and": MessageLookupByLibrary.simpleMessage("und"),
    "assigning_account": MessageLookupByLibrary.simpleMessage(
      "Konto wird zugewiesen",
    ),
    "assigning_account_error": MessageLookupByLibrary.simpleMessage(
      "Kontozuweisung fehlgeschlagen",
    ),
    "assigning_account_success": MessageLookupByLibrary.simpleMessage(
      "Konto aus dem Pool zugewiesen",
    ),
    "auth_detected": MessageLookupByLibrary.simpleMessage(
      "Authentifizierung erkannt, Kontodetails werden abgerufen",
    ),
    "auth_error": MessageLookupByLibrary.simpleMessage(
      "Authentifizierungsfehler",
    ),
    "auth_page_error": MessageLookupByLibrary.simpleMessage(
      "Auth-Seiten-Fehler",
    ),
    "auth_update_success": MessageLookupByLibrary.simpleMessage(
      "Authentifizierung aktualisiert",
    ),
    "auto_login_starting": MessageLookupByLibrary.simpleMessage(
      "Automatische Anmeldung beginnt",
    ),
    "browser_initialized": MessageLookupByLibrary.simpleMessage(
      "Browser initialisiert",
    ),
    "browser_message": MessageLookupByLibrary.simpleMessage("Browser"),
    "browser_quit_error": MessageLookupByLibrary.simpleMessage(
      "Browser-Beenden-Fehler",
    ),
    "browser_visibility": MessageLookupByLibrary.simpleMessage(
      "Browser-Sichtbarkeit",
    ),
    "buy_credits": MessageLookupByLibrary.simpleMessage("Credits kaufen"),
    "cancel": MessageLookupByLibrary.simpleMessage("Abbrechen"),
    "changes": MessageLookupByLibrary.simpleMessage("Änderungen"),
    "checking": MessageLookupByLibrary.simpleMessage("Überprüfung"),
    "checking_auth": MessageLookupByLibrary.simpleMessage(
      "Authentifizierung wird überprüft",
    ),
    "checking_chrome": MessageLookupByLibrary.simpleMessage(
      "Google Chrome wird überprüft",
    ),
    "checking_inbox": MessageLookupByLibrary.simpleMessage(
      "Posteingang wird überprüft",
    ),
    "checking_others": MessageLookupByLibrary.simpleMessage(
      "Andere werden überprüft",
    ),
    "checking_pip_installation": MessageLookupByLibrary.simpleMessage(
      "Pip-Installation wird überprüft",
    ),
    "checking_python": MessageLookupByLibrary.simpleMessage(
      "Python wird überprüft",
    ),
    "clear_notifications": MessageLookupByLibrary.simpleMessage(
      "Benachrichtigungen löschen",
    ),
    "close": MessageLookupByLibrary.simpleMessage("Schließen"),
    "code_found": MessageLookupByLibrary.simpleMessage("Code gefunden"),
    "completed": MessageLookupByLibrary.simpleMessage("Abgeschlossen"),
    "components": MessageLookupByLibrary.simpleMessage("Komponenten"),
    "connecting_imap": MessageLookupByLibrary.simpleMessage(
      "IMAP-Verbindung wird hergestellt",
    ),
    "console": MessageLookupByLibrary.simpleMessage("Konsole"),
    "continue_": MessageLookupByLibrary.simpleMessage("Fortfahren"),
    "continue_on_web": MessageLookupByLibrary.simpleMessage(
      "Wir setzen auf der Webseite fort",
    ),
    "continue_to_app": MessageLookupByLibrary.simpleMessage("Weiter zur App"),
    "copied_to_clipboard": MessageLookupByLibrary.simpleMessage(
      "In die Zwischenablage kopiert",
    ),
    "create_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Cursor-Konto erstellen",
    ),
    "create_gift_code": MessageLookupByLibrary.simpleMessage(
      "Geschenkcode erstellen",
    ),
    "create_windsurf_account": MessageLookupByLibrary.simpleMessage(
      "Windsurf-Konto erstellen",
    ),
    "created": MessageLookupByLibrary.simpleMessage("Erstellungsdatum"),
    "created_at": MessageLookupByLibrary.simpleMessage("Erstellt am"),
    "creating_email": MessageLookupByLibrary.simpleMessage(
      "E-Mail wird erstellt",
    ),
    "credits": MessageLookupByLibrary.simpleMessage("credits"),
    "credits_added_to_account": m0,
    "credits_amount": MessageLookupByLibrary.simpleMessage("Guthaben-Menge"),
    "credits_b": MessageLookupByLibrary.simpleMessage("Credits"),
    "credits_transfer_steps": MessageLookupByLibrary.simpleMessage(
      "Sie können Ihre bestehenden Credits über die Schaltfläche \"Geschenkkode erstellen\" auf der Startseite in einen Geschenkkode umwandeln und diesen Kode auf unserer Webseite verwenden, um Ihre Credits zu übertragen.",
    ),
    "cursor": MessageLookupByLibrary.simpleMessage("Cursor"),
    "cursor_browser_login_info": MessageLookupByLibrary.simpleMessage("BEREIT"),
    "daily_login": MessageLookupByLibrary.simpleMessage("Tägliche Anmeldung"),
    "database_error": MessageLookupByLibrary.simpleMessage("Datenbankfehler"),
    "days": MessageLookupByLibrary.simpleMessage("Tage"),
    "degraded_performance": MessageLookupByLibrary.simpleMessage("Degradiert"),
    "delete": MessageLookupByLibrary.simpleMessage("Löschen"),
    "delete_account": MessageLookupByLibrary.simpleMessage("Konto löschen"),
    "delete_account_confirmation": MessageLookupByLibrary.simpleMessage(
      "Sind Sie sicher, dass Sie das Konto löschen möchten?",
    ),
    "desktop_support_ending": MessageLookupByLibrary.simpleMessage(
      "Desktop-Anwendungsunterstützung endet",
    ),
    "download_completed": MessageLookupByLibrary.simpleMessage(
      "Download abgeschlossen",
    ),
    "download_error": m1,
    "download_failed": MessageLookupByLibrary.simpleMessage(
      "Download fehlgeschlagen",
    ),
    "download_update": MessageLookupByLibrary.simpleMessage(
      "Update installieren",
    ),
    "downloading": MessageLookupByLibrary.simpleMessage("Download: "),
    "downloading_python": MessageLookupByLibrary.simpleMessage(
      "Python wird heruntergeladen",
    ),
    "downloading_python_installer": MessageLookupByLibrary.simpleMessage(
      "Python-Installationsprogramm wird heruntergeladen",
    ),
    "downloading_python_installer_for_macos":
        MessageLookupByLibrary.simpleMessage(
          "Python-Installationsprogramm für macOS wird heruntergeladen",
        ),
    "downloading_python_installer_for_windows":
        MessageLookupByLibrary.simpleMessage(
          "Python-Installationsprogramm für Windows wird heruntergeladen",
        ),
    "downloading_update": MessageLookupByLibrary.simpleMessage(
      "Update wird heruntergeladen",
    ),
    "email": MessageLookupByLibrary.simpleMessage("E-Mail"),
    "email_created": MessageLookupByLibrary.simpleMessage("E-Mail erstellt"),
    "email_creation_failed": MessageLookupByLibrary.simpleMessage(
      "E-Mail-Erstellung fehlgeschlagen",
    ),
    "email_rate_limit": MessageLookupByLibrary.simpleMessage(
      "E-Mail-Ratenlimit überschritten",
    ),
    "email_secret_failed": MessageLookupByLibrary.simpleMessage(
      "E-Mail-Secret-Key fehlgeschlagen",
    ),
    "email_unavailable": MessageLookupByLibrary.simpleMessage(
      "E-Mail nicht verfügbar",
    ),
    "email_validator_type": MessageLookupByLibrary.simpleMessage(
      "E-Mail-Validator-Typ",
    ),
    "enable_proxy": MessageLookupByLibrary.simpleMessage(
      "Proxy bei Verwendung von Cursor aktivieren. Dies manipuliert Webanfragen, um Testzeitraumfehler zu vermeiden.",
    ),
    "enter_credits_amount": MessageLookupByLibrary.simpleMessage(
      "Guthaben-Menge eingeben",
    ),
    "enter_email": MessageLookupByLibrary.simpleMessage("E-Mail eingeben"),
    "error_during_dependency_installation":
        MessageLookupByLibrary.simpleMessage(
          "Fehler bei der Abhängigkeitsinstallation",
        ),
    "error_installing_dependencies": m2,
    "error_installing_python": MessageLookupByLibrary.simpleMessage(
      "Fehler bei der Installation von Python",
    ),
    "failed_get_cursor_session_token": MessageLookupByLibrary.simpleMessage(
      "Abrufen des Cursor-Sitzungs-Tokens fehlgeschlagen",
    ),
    "failed_open_auth_page": MessageLookupByLibrary.simpleMessage(
      "Öffnen der Auth-Seite fehlgeschlagen",
    ),
    "failed_to_install_pip_please_install_python_with_pip_included": m3,
    "failed_to_update_package_list": MessageLookupByLibrary.simpleMessage(
      "Fehler beim Aktualisieren der Paketliste",
    ),
    "free": MessageLookupByLibrary.simpleMessage("Kostenlos"),
    "generate_code": MessageLookupByLibrary.simpleMessage("Code generieren"),
    "getting_cursor_session_token": MessageLookupByLibrary.simpleMessage(
      "Kontodetails werden abgerufen",
    ),
    "getting_required_codes": MessageLookupByLibrary.simpleMessage(
      "Erforderliche Codes werden abgerufen",
    ),
    "getting_token": MessageLookupByLibrary.simpleMessage(
      "Token wird abgerufen",
    ),
    "gift_code": MessageLookupByLibrary.simpleMessage("Geschenkcode"),
    "gift_code_created_success": m4,
    "gift_code_error": MessageLookupByLibrary.simpleMessage(
      "Beim Erstellen des Geschenkcodes ist ein Fehler aufgetreten",
    ),
    "gift_code_info_description": MessageLookupByLibrary.simpleMessage(
      "Geben Sie hier den erhaltenen Geschenkcode ein, um Ihrem Konto Guthaben hinzuzufügen. Geschenkcodes sollten im Format XXXX-XXXX sein.",
    ),
    "gift_code_info_title": MessageLookupByLibrary.simpleMessage(
      "Wie verwendet man einen Geschenkcode?",
    ),
    "imap_connected": MessageLookupByLibrary.simpleMessage("IMAP verbunden"),
    "imap_content_read_error": MessageLookupByLibrary.simpleMessage(
      "IMAP-Inhaltslesefehler",
    ),
    "imap_error": MessageLookupByLibrary.simpleMessage("IMAP-Fehler"),
    "imap_settings": MessageLookupByLibrary.simpleMessage("IMAP-Einstellungen"),
    "imap_settings_saved": MessageLookupByLibrary.simpleMessage(
      "IMAP-Einstellungen gespeichert",
    ),
    "inbox_check_failed": MessageLookupByLibrary.simpleMessage(
      "Posteingangsüberprüfung fehlgeschlagen",
    ),
    "init_browser_starting": MessageLookupByLibrary.simpleMessage(
      "Browser wird initialisiert",
    ),
    "installed_successfully": MessageLookupByLibrary.simpleMessage(
      "Erfolgreich installiert",
    ),
    "installing": MessageLookupByLibrary.simpleMessage("Installation"),
    "installing_python": MessageLookupByLibrary.simpleMessage(
      "Python wird installiert",
    ),
    "installing_python_silently": MessageLookupByLibrary.simpleMessage(
      "Python wird still installiert",
    ),
    "installing_python_using_package_manager":
        MessageLookupByLibrary.simpleMessage(
          "Python wird mit dem Paketmanager installiert",
        ),
    "installing_python_using_package_manager_error":
        MessageLookupByLibrary.simpleMessage(
          "Fehler bei der Installation von Python mit dem Paketmanager",
        ),
    "installing_update": MessageLookupByLibrary.simpleMessage(
      "Update wird installiert",
    ),
    "invalid_server_response": MessageLookupByLibrary.simpleMessage(
      "Ungültige Serverantwort",
    ),
    "is_already_installed": MessageLookupByLibrary.simpleMessage(
      "Ist bereits installiert",
    ),
    "limit": MessageLookupByLibrary.simpleMessage("Limit"),
    "mail_api_error": MessageLookupByLibrary.simpleMessage(
      "Mail-Server-Fehler",
    ),
    "major_outage": MessageLookupByLibrary.simpleMessage("Großer Ausfall"),
    "mandatory_update_message": MessageLookupByLibrary.simpleMessage(
      "Dieses Update ist obligatorisch. Bitte laden Sie die neue Version herunter.",
    ),
    "manual": MessageLookupByLibrary.simpleMessage("Handbuch"),
    "manual_download": MessageLookupByLibrary.simpleMessage(
      "Manuelle Herunterladen",
    ),
    "max_attempts_reached": MessageLookupByLibrary.simpleMessage(
      "Maximale Anzahl an Versuchen erreicht",
    ),
    "navigated_to_cursor": MessageLookupByLibrary.simpleMessage(
      "Zu Cursor navigiert",
    ),
    "new_version_available": MessageLookupByLibrary.simpleMessage(
      "Neue Version verfügbar",
    ),
    "no_accounts_found": MessageLookupByLibrary.simpleMessage(
      "Keine Konten gefunden",
    ),
    "no_download_url": MessageLookupByLibrary.simpleMessage(
      "Download-URL nicht gefunden",
    ),
    "no_gift_codes_created": MessageLookupByLibrary.simpleMessage(
      "Noch keine Geschenkcodes erstellt",
    ),
    "no_notifications": MessageLookupByLibrary.simpleMessage(
      "Keine Benachrichtigungen",
    ),
    "no_update_values": MessageLookupByLibrary.simpleMessage(
      "Keine Werte wurden aktualisiert",
    ),
    "not_enough_credits": MessageLookupByLibrary.simpleMessage(
      "Nicht genügend Credits",
    ),
    "not_enough_credits_for_gift": MessageLookupByLibrary.simpleMessage(
      "Sie haben nicht genügend Guthaben",
    ),
    "not_enough_credits_message": MessageLookupByLibrary.simpleMessage(
      "Bitte kaufen Sie Credits, um fortzufahren.",
    ),
    "not_now": MessageLookupByLibrary.simpleMessage("Nicht jetzt"),
    "notice_title": MessageLookupByLibrary.simpleMessage(
      "Wichtige Information",
    ),
    "notifications": MessageLookupByLibrary.simpleMessage("Benachrichtigungen"),
    "open_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Konto im Browser öffnen",
    ),
    "opening_auth_page": MessageLookupByLibrary.simpleMessage(
      "Auth-Seite wird geöffnet, bitte melden Sie sich auf der geöffneten Seite an.",
    ),
    "operation_failed": MessageLookupByLibrary.simpleMessage(
      "Operation fehlgeschlagen",
    ),
    "operational": MessageLookupByLibrary.simpleMessage("Betriebsbereit"),
    "partial_outage": MessageLookupByLibrary.simpleMessage("Teilausfall"),
    "password": MessageLookupByLibrary.simpleMessage("Passwort"),
    "patch_cursor": MessageLookupByLibrary.simpleMessage(
      "Cursor-Testzeitraum zurücksetzen",
    ),
    "pip_installed_successfully": MessageLookupByLibrary.simpleMessage(
      "Pip erfolgreich installiert",
    ),
    "pip_is_already_installed": MessageLookupByLibrary.simpleMessage(
      "Pip ist bereits installiert",
    ),
    "pip_is_not_installed_installing_pip": MessageLookupByLibrary.simpleMessage(
      "Pip ist nicht installiert, Pip wird installiert",
    ),
    "please_enter_credit_amount": MessageLookupByLibrary.simpleMessage(
      "Bitte geben Sie einen Kreditbetrag ein",
    ),
    "please_enter_gift_code": MessageLookupByLibrary.simpleMessage(
      "Bitte geben Sie einen Geschenkcode ein",
    ),
    "please_enter_valid_credit_amount": MessageLookupByLibrary.simpleMessage(
      "Bitte geben Sie einen gültigen Kreditbetrag ein",
    ),
    "please_install_google_chrome": MessageLookupByLibrary.simpleMessage(
      "Bitte installieren Sie Google Chrome",
    ),
    "please_install_python_from_the_website":
        MessageLookupByLibrary.simpleMessage(
          "Bitte installieren Sie Python von der Website",
        ),
    "pool_account_count": m5,
    "pool_deactivated": MessageLookupByLibrary.simpleMessage(
      "Kein Konto im Pool verfügbar",
    ),
    "port": MessageLookupByLibrary.simpleMessage("Port"),
    "premium": MessageLookupByLibrary.simpleMessage("Premium"),
    "price": MessageLookupByLibrary.simpleMessage("Preis"),
    "pricing_buy_credits": MessageLookupByLibrary.simpleMessage(
      "Credits kaufen",
    ),
    "pricing_contact": MessageLookupByLibrary.simpleMessage("Kontakt"),
    "pricing_contact_message": MessageLookupByLibrary.simpleMessage(
      "Kontaktieren Sie uns für die Zahlung",
    ),
    "pricing_credits_amount": MessageLookupByLibrary.simpleMessage(
      "Credits-Betrag",
    ),
    "pricing_credits_amount_note": MessageLookupByLibrary.simpleMessage(
      "Sie können den Credits-Betrag nach Belieben festlegen.",
    ),
    "pricing_credits_per_dollar": MessageLookupByLibrary.simpleMessage(
      "Credits pro Dollar",
    ),
    "pricing_credits_per_dollar_per_day": MessageLookupByLibrary.simpleMessage(
      "Credits pro Dollar (täglich)",
    ),
    "pricing_credits_per_dollar_per_month":
        MessageLookupByLibrary.simpleMessage("Credits pro Dollar (monatlich)"),
    "pricing_custom_amount": MessageLookupByLibrary.simpleMessage(
      "Benutzerdefinierter Betrag",
    ),
    "pricing_message": MessageLookupByLibrary.simpleMessage(
      "Preisinformationen",
    ),
    "pricing_payment_id": MessageLookupByLibrary.simpleMessage("Zahlungs-ID"),
    "pricing_payment_id_copied": MessageLookupByLibrary.simpleMessage(
      "Zahlungs-ID kopiert",
    ),
    "pricing_payment_id_copied_note": MessageLookupByLibrary.simpleMessage(
      "Sie müssen diese ID bei der Zahlung verwenden",
    ),
    "pricing_payment_id_copy": MessageLookupByLibrary.simpleMessage("Kopieren"),
    "pricing_payment_id_note": MessageLookupByLibrary.simpleMessage(
      "Sie müssen diese ID bei der Zahlung verwenden",
    ),
    "pricing_title": MessageLookupByLibrary.simpleMessage("Preisgestaltung"),
    "pricing_total_price": MessageLookupByLibrary.simpleMessage("Gesamtpreis"),
    "processing": MessageLookupByLibrary.simpleMessage("Verarbeitung"),
    "python_available": MessageLookupByLibrary.simpleMessage(
      "Python verfügbar",
    ),
    "python_installation_failed": MessageLookupByLibrary.simpleMessage(
      "Python-Installation fehlgeschlagen",
    ),
    "python_not_available": MessageLookupByLibrary.simpleMessage(
      "Python nicht verfügbar",
    ),
    "python_path_error": MessageLookupByLibrary.simpleMessage(
      "Python-PATH nicht gefunden, Sie müssen möglicherweise Ihren Computer neu starten.",
    ),
    "python_path_progress": MessageLookupByLibrary.simpleMessage(
      "Python-Installation abgeschlossen, PATH wird überprüft",
    ),
    "python_path_success": MessageLookupByLibrary.simpleMessage(
      "Python-Installation abgeschlossen. Starten Sie Ihren Computer neu.",
    ),
    "random_name_generation_failed": MessageLookupByLibrary.simpleMessage(
      "Zufällige Namensgenerierung fehlgeschlagen",
    ),
    "redeem_code": MessageLookupByLibrary.simpleMessage("Code einlösen"),
    "redeem_code_error": MessageLookupByLibrary.simpleMessage(
      "Beim Einlösen des Geschenkcodes ist ein Fehler aufgetreten",
    ),
    "redeem_gift_code": MessageLookupByLibrary.simpleMessage(
      "Geschenkcode einlösen",
    ),
    "redirected_email_info": MessageLookupByLibrary.simpleMessage(
      "Geben Sie die E-Mail-Adressen ein, die Sie an den IMAP-Server weiterleiten möchten. Diese E-Mail-Adressen werden bei der Kontoerstellung verwendet.",
    ),
    "redirected_emails": MessageLookupByLibrary.simpleMessage(
      "Weitergeleitete E-Mails",
    ),
    "registration_page_error": MessageLookupByLibrary.simpleMessage(
      "Registrierungsseite-Fehler",
    ),
    "registration_success": MessageLookupByLibrary.simpleMessage(
      "Registrierung erfolgreich",
    ),
    "remaining_credits": MessageLookupByLibrary.simpleMessage(
      "Verbleibende Credits",
    ),
    "remove_redirected_email": MessageLookupByLibrary.simpleMessage(
      "Weitergeleitete E-Mail entfernen",
    ),
    "retry": MessageLookupByLibrary.simpleMessage("Wiederholen"),
    "running_required_commands": MessageLookupByLibrary.simpleMessage(
      "Erforderliche Befehle werden ausgeführt",
    ),
    "save_imap_settings": MessageLookupByLibrary.simpleMessage(
      "IMAP-Einstellungen speichern",
    ),
    "server": MessageLookupByLibrary.simpleMessage("Server"),
    "settings": MessageLookupByLibrary.simpleMessage("Einstellungen"),
    "settings_are_being_configured": MessageLookupByLibrary.simpleMessage(
      "Einstellungen werden konfiguriert",
    ),
    "show_notifications": MessageLookupByLibrary.simpleMessage(
      "Benachrichtigungen anzeigen",
    ),
    "sign_up_restricted": MessageLookupByLibrary.simpleMessage(
      "Registrierung eingeschränkt, bitte versuchen Sie es erneut",
    ),
    "signup_starting": MessageLookupByLibrary.simpleMessage(
      "Registrierung beginnt",
    ),
    "socials_title": MessageLookupByLibrary.simpleMessage(
      "Kontaktieren Sie uns für die Zahlung",
    ),
    "start_proxy": MessageLookupByLibrary.simpleMessage("Proxy starten"),
    "status": MessageLookupByLibrary.simpleMessage("Status"),
    "status_details_not_available": MessageLookupByLibrary.simpleMessage(
      "Statusdetails nicht verfügbar",
    ),
    "stop": MessageLookupByLibrary.simpleMessage("Stopp"),
    "swipe_to_delete": MessageLookupByLibrary.simpleMessage(
      "Nach links wischen zum Löschen",
    ),
    "switch_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Automatische Anmeldung",
    ),
    "test_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Cursor-Konto testen",
    ),
    "testing_account": MessageLookupByLibrary.simpleMessage(
      "Konto wird getestet",
    ),
    "thank_you_for_support": MessageLookupByLibrary.simpleMessage(
      "Vielen Dank für Ihre Unterstützung",
    ),
    "today": MessageLookupByLibrary.simpleMessage("heute"),
    "token": MessageLookupByLibrary.simpleMessage("Token"),
    "token_copied": MessageLookupByLibrary.simpleMessage("Token kopiert"),
    "token_error": MessageLookupByLibrary.simpleMessage("Token-Fehler"),
    "token_retry": MessageLookupByLibrary.simpleMessage(
      "Token wird erneut abgerufen",
    ),
    "transfer_credits_info": MessageLookupByLibrary.simpleMessage(
      "Übertragung Ihrer Credits auf die Webseite",
    ),
    "turnstile_failed": MessageLookupByLibrary.simpleMessage(
      "Roboterverifizierung fehlgeschlagen",
    ),
    "turnstile_started": MessageLookupByLibrary.simpleMessage(
      "Roboterverifizierung gestartet",
    ),
    "turnstile_starting": MessageLookupByLibrary.simpleMessage(
      "Roboterverifizierung beginnt",
    ),
    "turnstile_success": MessageLookupByLibrary.simpleMessage(
      "Roboterverifizierung erfolgreich",
    ),
    "type": MessageLookupByLibrary.simpleMessage("Typ"),
    "unexpected_error": m6,
    "update": m7,
    "update_connection_error": m8,
    "update_failed": m9,
    "update_info_not_found": MessageLookupByLibrary.simpleMessage(
      "Update-Informationen nicht gefunden",
    ),
    "usage_limit": MessageLookupByLibrary.simpleMessage("Nutzungslimit"),
    "usage_limit_error": MessageLookupByLibrary.simpleMessage(
      "Nutzungslimit konnte nicht abgerufen werden",
    ),
    "used": MessageLookupByLibrary.simpleMessage("Verwendet"),
    "user_agent_set": MessageLookupByLibrary.simpleMessage(
      "User-Agent festgelegt",
    ),
    "user_id": MessageLookupByLibrary.simpleMessage("Benutzer-ID"),
    "username": MessageLookupByLibrary.simpleMessage("Benutzername"),
    "verification_code_error": MessageLookupByLibrary.simpleMessage(
      "Verifizierungscode-Fehler",
    ),
    "verification_failed": MessageLookupByLibrary.simpleMessage(
      "Verifizierung fehlgeschlagen",
    ),
    "verification_starting": MessageLookupByLibrary.simpleMessage(
      "Verifizierung beginnt",
    ),
    "version": MessageLookupByLibrary.simpleMessage("Version"),
    "view_mail_failed": MessageLookupByLibrary.simpleMessage(
      "E-Mail-Anzeige fehlgeschlagen",
    ),
    "waiting": MessageLookupByLibrary.simpleMessage("Warten"),
    "waiting_for_email": MessageLookupByLibrary.simpleMessage(
      "Warten auf E-Mail",
    ),
    "web_site_url": MessageLookupByLibrary.simpleMessage(
      "https://aiaccounts.online",
    ),
    "welcome_to_ai_auto_free": MessageLookupByLibrary.simpleMessage(
      "Willkommen bei AI Auto Free",
    ),
    "windsurf": MessageLookupByLibrary.simpleMessage("Windsurf"),
    "windsurf_token_guide_1": MessageLookupByLibrary.simpleMessage(
      "Öffnen Sie den Windsurf-Editor",
    ),
    "windsurf_token_guide_2": MessageLookupByLibrary.simpleMessage(
      "Drücken Sie STRG + UMSCHALT + P",
    ),
    "windsurf_token_guide_3": MessageLookupByLibrary.simpleMessage(
      "Geben Sie \'login\' ein und wählen Sie die erste Option",
    ),
    "windsurf_token_guide_4": MessageLookupByLibrary.simpleMessage(
      "Ein Browser wird geöffnet, schließen Sie ihn und kehren Sie zum Editor zurück.",
    ),
    "windsurf_token_guide_5": MessageLookupByLibrary.simpleMessage(
      "Fügen Sie das Token, das Sie erhalten haben, in die Anwendung ein.",
    ),
    "windsurf_token_guide_close_button_text":
        MessageLookupByLibrary.simpleMessage("Schließen"),
    "windsurf_token_guide_title": MessageLookupByLibrary.simpleMessage(
      "Windsurf-Token-Anleitung",
    ),
    "windsurf_token_note": MessageLookupByLibrary.simpleMessage(
      "Hinweis: Das Token ist 1 Stunde gültig.",
    ),
    "you_should_restart_your_computer": MessageLookupByLibrary.simpleMessage(
      "Python ist nicht im PATH verfügbar. Wenn Sie zum ersten Mal installieren, starten Sie Ihren Computer neu. Andernfalls müssen Sie Python möglicherweise zum PATH hinzufügen.",
    ),
    "your_id": MessageLookupByLibrary.simpleMessage("Ihre ID"),
    "your_id_copied": MessageLookupByLibrary.simpleMessage("Ihre ID kopiert"),
  };
}
