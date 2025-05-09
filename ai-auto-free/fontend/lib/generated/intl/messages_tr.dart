// DO NOT EDIT. This is code generated via package:intl/generate_localized.dart
// This is a library that provides messages for a tr locale. All the
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
  String get localeName => 'tr';

  static String m0(credits) => "${credits} kredi hesabınıza eklendi";

  static String m1(message) => "İndirme hatası: ${message}";

  static String m2(dependency) =>
      "Bağımlılık yükleme hatası, lütfen manuel yüklemeyi deneyiniz. Şu komutu terminalde çalıştırınız: `${dependency}`";

  static String m3(dependency) =>
      "Gereksinimler otomatik yüklenemedi. Manuel yüklemek için şu komutu terminalde çalıştırınız: `${dependency}`";

  static String m4(code) => "Hediye kodu başarıyla oluşturuldu: ${code}";

  static String m5(count) => "Havuzda ${count} hesap bulunuyor";

  static String m6(message) => "Beklenmeyen bir hata oluştu: ${message}";

  static String m7(version) => "Güncelle (${version})";

  static String m8(message) => "Bağlantı hatası: ${message}";

  static String m9(message) => "Güncelleme başarısız: ${message}";

  final messages = _notInlinedMessages(_notInlinedMessages);
  static Map<String, Function> _notInlinedMessages(_) => <String, Function>{
    "about": MessageLookupByLibrary.simpleMessage("Hakkında"),
    "account_created": MessageLookupByLibrary.simpleMessage(
      "Hesap oluşturuldu",
    ),
    "account_details": MessageLookupByLibrary.simpleMessage("Hesap detayları"),
    "account_invalid": MessageLookupByLibrary.simpleMessage(
      "Hesap Cursor Tarafından Engellenmiş",
    ),
    "account_logged_in": MessageLookupByLibrary.simpleMessage(
      "Tarayıcıda giriş yapıldı",
    ),
    "account_test_error": MessageLookupByLibrary.simpleMessage(
      "Hesap kontrolü sırasında bir hata oluştu",
    ),
    "account_valid": MessageLookupByLibrary.simpleMessage("Hesap Aktif"),
    "accounts": MessageLookupByLibrary.simpleMessage("Hesaplar"),
    "active": MessageLookupByLibrary.simpleMessage("Aktif"),
    "active_incidents": MessageLookupByLibrary.simpleMessage("Aktif Olaylar"),
    "add_redirected_email": MessageLookupByLibrary.simpleMessage(
      "Yönlendirilen Email ekle",
    ),
    "and": MessageLookupByLibrary.simpleMessage("ve"),
    "assigning_account": MessageLookupByLibrary.simpleMessage(
      "Havuzdan hesap atanıyor",
    ),
    "assigning_account_error": MessageLookupByLibrary.simpleMessage(
      "Havuzdan hesap alınamadı",
    ),
    "assigning_account_success": MessageLookupByLibrary.simpleMessage(
      "Havuzdan hesap atandı",
    ),
    "auth_detected": MessageLookupByLibrary.simpleMessage(
      "Giriş yapıldı, hesap bilgileri alınıyor",
    ),
    "auth_error": MessageLookupByLibrary.simpleMessage(
      "Kimlik doğrulama hatası",
    ),
    "auth_page_error": MessageLookupByLibrary.simpleMessage(
      "Giriş sayfasında bir sorun oluştu",
    ),
    "auth_update_success": MessageLookupByLibrary.simpleMessage(
      "Kimlik bilgileri güncellendi",
    ),
    "auto_login_starting": MessageLookupByLibrary.simpleMessage(
      "Otomatik giriş yapılıyor",
    ),
    "browser_initialized": MessageLookupByLibrary.simpleMessage(
      "Tarayıcı başlatıldı",
    ),
    "browser_message": MessageLookupByLibrary.simpleMessage("Tarayıcı"),
    "browser_quit_error": MessageLookupByLibrary.simpleMessage(
      "Tarayıcı kapatma hatası",
    ),
    "browser_visibility": MessageLookupByLibrary.simpleMessage(
      "Tarayıcı görünürlüğü",
    ),
    "buy_credits": MessageLookupByLibrary.simpleMessage("Kredi Al"),
    "cancel": MessageLookupByLibrary.simpleMessage("İptal"),
    "changes": MessageLookupByLibrary.simpleMessage("Değişiklikler"),
    "checking": MessageLookupByLibrary.simpleMessage("Kontrol ediliyor"),
    "checking_auth": MessageLookupByLibrary.simpleMessage(
      "Kimlik doğrulanıyor",
    ),
    "checking_chrome": MessageLookupByLibrary.simpleMessage(
      "Google Chrome kontrol ediliyor",
    ),
    "checking_inbox": MessageLookupByLibrary.simpleMessage(
      "Posta kutusu kontrol ediliyor",
    ),
    "checking_others": MessageLookupByLibrary.simpleMessage(
      "Diğerleri kontrol ediliyor",
    ),
    "checking_pip_installation": MessageLookupByLibrary.simpleMessage(
      "Pip kontrol ediliyor",
    ),
    "checking_python": MessageLookupByLibrary.simpleMessage(
      "Python kontrol ediliyor",
    ),
    "clear_notifications": MessageLookupByLibrary.simpleMessage(
      "Tümünü Temizle",
    ),
    "close": MessageLookupByLibrary.simpleMessage("Kapat"),
    "code_found": MessageLookupByLibrary.simpleMessage("Kod bulundu"),
    "completed": MessageLookupByLibrary.simpleMessage("Tamamlandı"),
    "components": MessageLookupByLibrary.simpleMessage("Bileşenler"),
    "connecting_imap": MessageLookupByLibrary.simpleMessage(
      "IMAP bağlantısı kuruluyor",
    ),
    "console": MessageLookupByLibrary.simpleMessage("Konsol"),
    "continue_": MessageLookupByLibrary.simpleMessage("Devam Et"),
    "continue_on_web": MessageLookupByLibrary.simpleMessage(
      "Web Sitesi Üzerinden Devam Ediyoruz",
    ),
    "continue_to_app": MessageLookupByLibrary.simpleMessage(
      "Uygulamaya Devam Et",
    ),
    "copied_to_clipboard": MessageLookupByLibrary.simpleMessage(
      "Panoya kopyalandı",
    ),
    "create_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Cursor hesabı oluştur",
    ),
    "create_gift_code": MessageLookupByLibrary.simpleMessage(
      "Hediye Kodu Oluştur",
    ),
    "create_windsurf_account": MessageLookupByLibrary.simpleMessage(
      "Windsurf hesabı oluştur",
    ),
    "created": MessageLookupByLibrary.simpleMessage("Tarih"),
    "created_at": MessageLookupByLibrary.simpleMessage("Oluşturulma Tarihi"),
    "creating_email": MessageLookupByLibrary.simpleMessage(
      "Email oluşturuluyor",
    ),
    "credits": MessageLookupByLibrary.simpleMessage("kredi"),
    "credits_added_to_account": m0,
    "credits_amount": MessageLookupByLibrary.simpleMessage("Kredi Miktarı"),
    "credits_b": MessageLookupByLibrary.simpleMessage("Kredi"),
    "credits_transfer_steps": MessageLookupByLibrary.simpleMessage(
      "Ana sayfada yer alan \"Hediye Kodu Oluştur\" butonuyla mevcut kredilerinizi hediye koduna çevirebilir ve bu kodu web sitemizde kullanarak kredilerinizi aktarabilirsiniz.",
    ),
    "cursor": MessageLookupByLibrary.simpleMessage("Cursor"),
    "cursor_browser_login_info": MessageLookupByLibrary.simpleMessage("HAZIR"),
    "daily_login": MessageLookupByLibrary.simpleMessage("Günlük giriş"),
    "database_error": MessageLookupByLibrary.simpleMessage("Veritabanı hatası"),
    "days": MessageLookupByLibrary.simpleMessage("gün"),
    "degraded_performance": MessageLookupByLibrary.simpleMessage(
      "Performans Düşüklüğü",
    ),
    "delete": MessageLookupByLibrary.simpleMessage("Sil"),
    "delete_account": MessageLookupByLibrary.simpleMessage("Hesap sil"),
    "delete_account_confirmation": MessageLookupByLibrary.simpleMessage(
      "Hesap silmek istediğinize emin misiniz?",
    ),
    "desktop_support_ending": MessageLookupByLibrary.simpleMessage(
      "Masaüstü Uygulaması Desteği Sona Eriyor",
    ),
    "download_completed": MessageLookupByLibrary.simpleMessage(
      "İndirme tamamlandı",
    ),
    "download_error": m1,
    "download_failed": MessageLookupByLibrary.simpleMessage(
      "İndirme başarısız oldu",
    ),
    "download_update": MessageLookupByLibrary.simpleMessage("Güncellemeyi Kur"),
    "downloading": MessageLookupByLibrary.simpleMessage("İndiriliyor: "),
    "downloading_python": MessageLookupByLibrary.simpleMessage(
      "Python indiriyor",
    ),
    "downloading_python_installer": MessageLookupByLibrary.simpleMessage(
      "Python yükleyicisini indiriyor",
    ),
    "downloading_python_installer_for_macos":
        MessageLookupByLibrary.simpleMessage(
          "MacOS için Python yükleyicisini indiriyor",
        ),
    "downloading_python_installer_for_windows":
        MessageLookupByLibrary.simpleMessage(
          "Windows için Python yükleyicisini indiriyor",
        ),
    "downloading_update": MessageLookupByLibrary.simpleMessage(
      "Güncelleme indiriliyor...",
    ),
    "email": MessageLookupByLibrary.simpleMessage("Email"),
    "email_created": MessageLookupByLibrary.simpleMessage("Email oluşturuldu"),
    "email_creation_failed": MessageLookupByLibrary.simpleMessage(
      "Email oluşturma hatası",
    ),
    "email_rate_limit": MessageLookupByLibrary.simpleMessage(
      "Email oluşturma limiti aşıldı",
    ),
    "email_secret_failed": MessageLookupByLibrary.simpleMessage(
      "Email secret key alınamadı",
    ),
    "email_unavailable": MessageLookupByLibrary.simpleMessage(
      "Email mevcut değil",
    ),
    "email_validator_type": MessageLookupByLibrary.simpleMessage(
      "Email doğrulama tipi",
    ),
    "enable_proxy": MessageLookupByLibrary.simpleMessage(
      "Cursor kullanırken proxy\'i etkinleştir. Bu, deneme süresi hatasını önlemek için web isteklerini manipüle eder.",
    ),
    "enter_credits_amount": MessageLookupByLibrary.simpleMessage(
      "Kredi miktarını giriniz",
    ),
    "enter_email": MessageLookupByLibrary.simpleMessage("Email giriniz"),
    "error_during_dependency_installation":
        MessageLookupByLibrary.simpleMessage("Bağımlılık yükleme hatası"),
    "error_installing_dependencies": m2,
    "error_installing_python": MessageLookupByLibrary.simpleMessage(
      "Python yükleme hatası",
    ),
    "failed_get_cursor_session_token": MessageLookupByLibrary.simpleMessage(
      "Hesap bilgileriniz alınırken bir sorun oluştu",
    ),
    "failed_open_auth_page": MessageLookupByLibrary.simpleMessage(
      "Auth sayfası açılırken bir sorun oluştu",
    ),
    "failed_to_install_pip_please_install_python_with_pip_included": m3,
    "failed_to_update_package_list": MessageLookupByLibrary.simpleMessage(
      "Paket listesi güncellenemedi",
    ),
    "free": MessageLookupByLibrary.simpleMessage("Ücretsiz"),
    "generate_code": MessageLookupByLibrary.simpleMessage("Kod Oluştur"),
    "getting_cursor_session_token": MessageLookupByLibrary.simpleMessage(
      "Hesap bilgileri alınıyor",
    ),
    "getting_required_codes": MessageLookupByLibrary.simpleMessage(
      "Gerekli kodlar alınıyor",
    ),
    "getting_token": MessageLookupByLibrary.simpleMessage("Token alınıyor"),
    "gift_code": MessageLookupByLibrary.simpleMessage("Hediye Kodu"),
    "gift_code_created_success": m4,
    "gift_code_error": MessageLookupByLibrary.simpleMessage(
      "Hediye kodu oluşturulurken bir hata oluştu",
    ),
    "gift_code_info_description": MessageLookupByLibrary.simpleMessage(
      "Aldığınız hediye kodunu buraya girin ve hesabınıza kredi ekleyin. Hediye kodları XXXX-XXXX formatında olmalıdır.",
    ),
    "gift_code_info_title": MessageLookupByLibrary.simpleMessage(
      "Hediye Kodu Nasıl Kullanılır?",
    ),
    "imap_connected": MessageLookupByLibrary.simpleMessage(
      "IMAP bağlantısı kuruldu",
    ),
    "imap_content_read_error": MessageLookupByLibrary.simpleMessage(
      "IMAP içerik okuma hatası",
    ),
    "imap_error": MessageLookupByLibrary.simpleMessage("IMAP hatası"),
    "imap_settings": MessageLookupByLibrary.simpleMessage("IMAP ayarları"),
    "imap_settings_saved": MessageLookupByLibrary.simpleMessage(
      "IMAP ayarları kaydedildi",
    ),
    "inbox_check_failed": MessageLookupByLibrary.simpleMessage(
      "Posta kutusu kontrolü hatası",
    ),
    "init_browser_starting": MessageLookupByLibrary.simpleMessage(
      "Tarayıcı başlatılıyor",
    ),
    "installed_successfully": MessageLookupByLibrary.simpleMessage(
      "Başarıyla yüklendi",
    ),
    "installing": MessageLookupByLibrary.simpleMessage("Yükleniyor"),
    "installing_python": MessageLookupByLibrary.simpleMessage(
      "Python yükleniyor",
    ),
    "installing_python_silently": MessageLookupByLibrary.simpleMessage(
      "Python yükleniyor (sessiz)",
    ),
    "installing_python_using_package_manager":
        MessageLookupByLibrary.simpleMessage(
          "Paket yöneticisi ile Python yükleniyor",
        ),
    "installing_python_using_package_manager_error":
        MessageLookupByLibrary.simpleMessage(
          "Paket yöneticisi ile Python yükleme hatası",
        ),
    "installing_update": MessageLookupByLibrary.simpleMessage(
      "Güncelleme kuruluyor...",
    ),
    "invalid_server_response": MessageLookupByLibrary.simpleMessage(
      "Sunucudan geçersiz yanıt alındı",
    ),
    "is_already_installed": MessageLookupByLibrary.simpleMessage("Zaten yüklü"),
    "limit": MessageLookupByLibrary.simpleMessage("Limit"),
    "mail_api_error": MessageLookupByLibrary.simpleMessage(
      "Mail Sunucu Hatası",
    ),
    "major_outage": MessageLookupByLibrary.simpleMessage("Büyük Kesinti"),
    "mandatory_update_message": MessageLookupByLibrary.simpleMessage(
      "Bu güncelleme zorunludur. Lütfen yeni sürümü indiriniz.",
    ),
    "manual": MessageLookupByLibrary.simpleMessage("Manuel"),
    "manual_download": MessageLookupByLibrary.simpleMessage("Manuel İndir"),
    "max_attempts_reached": MessageLookupByLibrary.simpleMessage(
      "Token alma denemeleri sonlandı",
    ),
    "navigated_to_cursor": MessageLookupByLibrary.simpleMessage(
      "Cursor\'a yönlendiriliyor",
    ),
    "new_version_available": MessageLookupByLibrary.simpleMessage(
      "Yeni Sürüm Mevcut",
    ),
    "no_accounts_found": MessageLookupByLibrary.simpleMessage(
      "Hesap bulunamadı",
    ),
    "no_download_url": MessageLookupByLibrary.simpleMessage(
      "İndirme URL\'si bulunamadı",
    ),
    "no_gift_codes_created": MessageLookupByLibrary.simpleMessage(
      "Henüz oluşturulmuş hediye kodu yok",
    ),
    "no_notifications": MessageLookupByLibrary.simpleMessage(
      "Henüz bildirim yok",
    ),
    "no_update_values": MessageLookupByLibrary.simpleMessage(
      "Herhangi bir değer güncellenmedi",
    ),
    "not_enough_credits": MessageLookupByLibrary.simpleMessage(
      "Kredi yeterli değil",
    ),
    "not_enough_credits_for_gift": MessageLookupByLibrary.simpleMessage(
      "Yeterli krediniz bulunmuyor",
    ),
    "not_enough_credits_message": MessageLookupByLibrary.simpleMessage(
      "Lütfen devam etmek için kredi alınız.",
    ),
    "not_now": MessageLookupByLibrary.simpleMessage("Şimdi Değil"),
    "notice_title": MessageLookupByLibrary.simpleMessage(
      "Önemli Bilgilendirme",
    ),
    "notifications": MessageLookupByLibrary.simpleMessage("Bildirimler"),
    "open_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Hesabı Tarayıcıda Aç",
    ),
    "opening_auth_page": MessageLookupByLibrary.simpleMessage(
      "Giriş sayfası açılıyor, lütfen açılan sayfada hesabınıza giriş yapınız.",
    ),
    "operation_failed": MessageLookupByLibrary.simpleMessage("İşlem hatası"),
    "operational": MessageLookupByLibrary.simpleMessage("Çalışıyor"),
    "partial_outage": MessageLookupByLibrary.simpleMessage("Kısmi Kesinti"),
    "password": MessageLookupByLibrary.simpleMessage("Şifre"),
    "patch_cursor": MessageLookupByLibrary.simpleMessage(
      "Cursor Deneme Sıfırla",
    ),
    "pip_installed_successfully": MessageLookupByLibrary.simpleMessage(
      "Pip başarıyla yüklendi",
    ),
    "pip_is_already_installed": MessageLookupByLibrary.simpleMessage(
      "Pip zaten yüklü",
    ),
    "pip_is_not_installed_installing_pip": MessageLookupByLibrary.simpleMessage(
      "Pip yüklü değil, pip yükleniyor",
    ),
    "please_enter_credit_amount": MessageLookupByLibrary.simpleMessage(
      "Lütfen kredi miktarı girin",
    ),
    "please_enter_gift_code": MessageLookupByLibrary.simpleMessage(
      "Lütfen bir hediye kodu girin",
    ),
    "please_enter_valid_credit_amount": MessageLookupByLibrary.simpleMessage(
      "Geçerli bir kredi miktarı girin",
    ),
    "please_install_google_chrome": MessageLookupByLibrary.simpleMessage(
      "Google Chrome yükleyiniz",
    ),
    "please_install_python_from_the_website":
        MessageLookupByLibrary.simpleMessage(
          "Python\'ı web sitesinden yükleyiniz",
        ),
    "pool_account_count": m5,
    "pool_deactivated": MessageLookupByLibrary.simpleMessage(
      "Havuzda şu anda hesap bulunmamaktadır",
    ),
    "port": MessageLookupByLibrary.simpleMessage("Port"),
    "premium": MessageLookupByLibrary.simpleMessage("Premium"),
    "price": MessageLookupByLibrary.simpleMessage("Fiyat"),
    "pricing_buy_credits": MessageLookupByLibrary.simpleMessage("Kredi Al"),
    "pricing_contact": MessageLookupByLibrary.simpleMessage("İletişim"),
    "pricing_contact_message": MessageLookupByLibrary.simpleMessage(
      "Ödeme yapmak için bizimle iletişime geçin",
    ),
    "pricing_credits_amount": MessageLookupByLibrary.simpleMessage(
      "Kredi Miktarı",
    ),
    "pricing_credits_amount_note": MessageLookupByLibrary.simpleMessage(
      "Kredi miktarını özel olarak belirleyebilirsiniz.",
    ),
    "pricing_credits_per_dollar": MessageLookupByLibrary.simpleMessage(
      "Dolar başına kredi",
    ),
    "pricing_credits_per_dollar_per_day": MessageLookupByLibrary.simpleMessage(
      "Dolar başına kredi (Günlük)",
    ),
    "pricing_credits_per_dollar_per_month":
        MessageLookupByLibrary.simpleMessage("Dolar başına kredi (Aylık)"),
    "pricing_custom_amount": MessageLookupByLibrary.simpleMessage(
      "Özel Miktar",
    ),
    "pricing_message": MessageLookupByLibrary.simpleMessage(
      "Kredi fiyatlandırma bilgileri",
    ),
    "pricing_payment_id": MessageLookupByLibrary.simpleMessage("Ödeme ID"),
    "pricing_payment_id_copied": MessageLookupByLibrary.simpleMessage(
      "Ödeme ID kopyalandı",
    ),
    "pricing_payment_id_copied_note": MessageLookupByLibrary.simpleMessage(
      "Ödeme ID\'yi kopyaladıktan sonra, ödeme yaparken bu ID\'yi kullanmanız gerekecek",
    ),
    "pricing_payment_id_copy": MessageLookupByLibrary.simpleMessage("Kopyala"),
    "pricing_payment_id_note": MessageLookupByLibrary.simpleMessage(
      "Ödeme yaparken bu ID\'yi kullanmanız gerekecek",
    ),
    "pricing_title": MessageLookupByLibrary.simpleMessage(
      "Kredi Fiyatlandırma",
    ),
    "pricing_total_price": MessageLookupByLibrary.simpleMessage("Toplam Fiyat"),
    "processing": MessageLookupByLibrary.simpleMessage("İşleniyor"),
    "python_available": MessageLookupByLibrary.simpleMessage("Python mevcut"),
    "python_installation_failed": MessageLookupByLibrary.simpleMessage(
      "Python kurulum hatası",
    ),
    "python_not_available": MessageLookupByLibrary.simpleMessage(
      "Python mevcut değil",
    ),
    "python_path_error": MessageLookupByLibrary.simpleMessage(
      "Python PATH üzerinde bulunamadı, bilgisayarınızı yeniden başlatmanız gerekebilir.",
    ),
    "python_path_progress": MessageLookupByLibrary.simpleMessage(
      "Python kurulumu tamamlandı, PATH kontrolü yapılıyor...",
    ),
    "python_path_success": MessageLookupByLibrary.simpleMessage(
      "Python kurulumu tamamlandı. Bilgisayarınızı yeniden başlatınız.",
    ),
    "random_name_generation_failed": MessageLookupByLibrary.simpleMessage(
      "Rastgele isim oluşturma hatası",
    ),
    "redeem_code": MessageLookupByLibrary.simpleMessage("Kodu Kullan"),
    "redeem_code_error": MessageLookupByLibrary.simpleMessage(
      "Hediye kodu kullanılırken bir hata oluştu",
    ),
    "redeem_gift_code": MessageLookupByLibrary.simpleMessage(
      "Hediye Kodu Kullan",
    ),
    "redirected_email_info": MessageLookupByLibrary.simpleMessage(
      "IMAP sunucusuna yönlendirdiğiniz email adreslerini giriniz. Bu email adresleri, hesap oluşturulurken kullanılacaktır.",
    ),
    "redirected_emails": MessageLookupByLibrary.simpleMessage(
      "Yönlendirilen Email\'ler",
    ),
    "registration_page_error": MessageLookupByLibrary.simpleMessage(
      "Kayıt sayfası hatası",
    ),
    "registration_success": MessageLookupByLibrary.simpleMessage(
      "Kayıt başarılı",
    ),
    "remaining_credits": MessageLookupByLibrary.simpleMessage("Kalan Kredi"),
    "remove_redirected_email": MessageLookupByLibrary.simpleMessage(
      "Yönlendirilen Email\'i kaldır",
    ),
    "retry": MessageLookupByLibrary.simpleMessage("Tekrar dene"),
    "running_required_commands": MessageLookupByLibrary.simpleMessage(
      "Gerekli komutlar çalıştırılıyor",
    ),
    "save_imap_settings": MessageLookupByLibrary.simpleMessage(
      "IMAP ayarlarını kaydet",
    ),
    "server": MessageLookupByLibrary.simpleMessage("Sunucu"),
    "settings": MessageLookupByLibrary.simpleMessage("Ayarlar"),
    "settings_are_being_configured": MessageLookupByLibrary.simpleMessage(
      "Ayarlar yapılandırılıyor",
    ),
    "show_notifications": MessageLookupByLibrary.simpleMessage(
      "Bildirimleri Göster",
    ),
    "sign_up_restricted": MessageLookupByLibrary.simpleMessage(
      "Kayıt engellendi, tekrar deneyiniz",
    ),
    "signup_starting": MessageLookupByLibrary.simpleMessage("Kayıt başlıyor"),
    "socials_title": MessageLookupByLibrary.simpleMessage(
      "Ödeme için İletişime Geçiniz",
    ),
    "start_proxy": MessageLookupByLibrary.simpleMessage("Proxy\'i başlat"),
    "status": MessageLookupByLibrary.simpleMessage("Durum"),
    "status_details_not_available": MessageLookupByLibrary.simpleMessage(
      "Durum detayları mevcut değil",
    ),
    "stop": MessageLookupByLibrary.simpleMessage("Durdur"),
    "swipe_to_delete": MessageLookupByLibrary.simpleMessage(
      "Silmek için sola kaydırın",
    ),
    "switch_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Otomatik Giriş Yap",
    ),
    "test_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Hesap Aktif mi Kontrol Et",
    ),
    "testing_account": MessageLookupByLibrary.simpleMessage(
      "Hesap kontrol ediliyor",
    ),
    "thank_you_for_support": MessageLookupByLibrary.simpleMessage(
      "Desteğiniz için teşekkür ederiz",
    ),
    "today": MessageLookupByLibrary.simpleMessage("bugün"),
    "token": MessageLookupByLibrary.simpleMessage("Token"),
    "token_copied": MessageLookupByLibrary.simpleMessage("Token kopyalandı"),
    "token_error": MessageLookupByLibrary.simpleMessage("Token hatası"),
    "token_retry": MessageLookupByLibrary.simpleMessage(
      "Token alınmaya çalışılıyor",
    ),
    "transfer_credits_info": MessageLookupByLibrary.simpleMessage(
      "Kredilerinizi Web Sitesine Aktarma",
    ),
    "turnstile_failed": MessageLookupByLibrary.simpleMessage(
      "Robot doğrulama hatası",
    ),
    "turnstile_started": MessageLookupByLibrary.simpleMessage(
      "Robot doğrulama başladı",
    ),
    "turnstile_starting": MessageLookupByLibrary.simpleMessage(
      "Robot doğrulama başlıyor",
    ),
    "turnstile_success": MessageLookupByLibrary.simpleMessage(
      "Robot doğrulama başarılı",
    ),
    "type": MessageLookupByLibrary.simpleMessage("Tip"),
    "unexpected_error": m6,
    "update": m7,
    "update_connection_error": m8,
    "update_failed": m9,
    "update_info_not_found": MessageLookupByLibrary.simpleMessage(
      "Güncelleme bilgisi bulunamadı",
    ),
    "usage_limit": MessageLookupByLibrary.simpleMessage("Kullanım limiti"),
    "usage_limit_error": MessageLookupByLibrary.simpleMessage(
      "Kullanım limiti alınamadı",
    ),
    "used": MessageLookupByLibrary.simpleMessage("Kullanıldı"),
    "user_agent_set": MessageLookupByLibrary.simpleMessage(
      "User-Agent ayarlandı",
    ),
    "user_id": MessageLookupByLibrary.simpleMessage("Kimlik"),
    "username": MessageLookupByLibrary.simpleMessage("Kullanıcı adı"),
    "verification_code_error": MessageLookupByLibrary.simpleMessage(
      "Doğrulama kodu hatası",
    ),
    "verification_failed": MessageLookupByLibrary.simpleMessage(
      "Doğrulama hatası",
    ),
    "verification_starting": MessageLookupByLibrary.simpleMessage(
      "Doğrulama başlıyor",
    ),
    "version": MessageLookupByLibrary.simpleMessage("Sürüm"),
    "view_mail_failed": MessageLookupByLibrary.simpleMessage(
      "Email görüntüleme hatası",
    ),
    "waiting": MessageLookupByLibrary.simpleMessage("Bekleniyor"),
    "waiting_for_email": MessageLookupByLibrary.simpleMessage(
      "Email bekleniyor",
    ),
    "web_site_url": MessageLookupByLibrary.simpleMessage(
      "https://aiaccounts.online",
    ),
    "welcome_to_ai_auto_free": MessageLookupByLibrary.simpleMessage(
      "AI Auto Free\'ye Hoşgeldiniz",
    ),
    "windsurf": MessageLookupByLibrary.simpleMessage("Windsurf"),
    "windsurf_token_guide_1": MessageLookupByLibrary.simpleMessage(
      "Windsurf Editorünü Açın",
    ),
    "windsurf_token_guide_2": MessageLookupByLibrary.simpleMessage(
      "CTRL + SHIFT + P tuşlarına basın",
    ),
    "windsurf_token_guide_3": MessageLookupByLibrary.simpleMessage(
      "Açılan pencereye \'login\' yazın ve ilk çıkan seçeneği seçin",
    ),
    "windsurf_token_guide_4": MessageLookupByLibrary.simpleMessage(
      "Bir tarayıcı açılacak onu kapatın ve editöre dönün.",
    ),
    "windsurf_token_guide_5": MessageLookupByLibrary.simpleMessage(
      "Size verilen tokeni uygulamaya yapıştırın.",
    ),
    "windsurf_token_guide_close_button_text":
        MessageLookupByLibrary.simpleMessage("Kapat"),
    "windsurf_token_guide_title": MessageLookupByLibrary.simpleMessage(
      "Windsurf Token Rehberi",
    ),
    "windsurf_token_note": MessageLookupByLibrary.simpleMessage(
      "Not: Token\'ın süresi 1 saattir.",
    ),
    "you_should_restart_your_computer": MessageLookupByLibrary.simpleMessage(
      "Python, PATH üzerinde görünmüyor. İlk kez kurduysanız bilgisayarınızı yeniden başlatınız aksi halde PATH üzerine Python eklemesi yapmanız gerekebilir.",
    ),
    "your_id": MessageLookupByLibrary.simpleMessage("Numaranız"),
    "your_id_copied": MessageLookupByLibrary.simpleMessage(
      "Numaranız kopyalandı",
    ),
  };
}
