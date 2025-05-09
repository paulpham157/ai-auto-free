// DO NOT EDIT. This is code generated via package:intl/generate_localized.dart
// This is a library that provides messages for a ru locale. All the
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
  String get localeName => 'ru';

  static String m0(credits) => "${credits} кредитов добавлено на ваш счет";

  static String m1(message) => "Ошибка загрузки: ${message}";

  static String m2(dependency) =>
      "Ошибка при установке зависимостей, попробуйте вручную. Выполните следующую команду в терминале: `${dependency}`";

  static String m3(dependency) =>
      "Не удалось автоматически установить требования. Выполните следующую команду в терминале: `${dependency}`";

  static String m4(code) => "Подарочный код успешно создан: ${code}";

  static String m5(count) => "В пуле ${count} аккаунтов";

  static String m6(message) => "Произошла непредвиденная ошибка: ${message}";

  static String m7(version) => "Обновить (${version})";

  static String m8(message) => "Ошибка соединения: ${message}";

  static String m9(message) => "Не удалось обновить: ${message}";

  final messages = _notInlinedMessages(_notInlinedMessages);
  static Map<String, Function> _notInlinedMessages(_) => <String, Function>{
    "about": MessageLookupByLibrary.simpleMessage("О программе"),
    "account_created": MessageLookupByLibrary.simpleMessage("Аккаунт создан"),
    "account_details": MessageLookupByLibrary.simpleMessage("Детали аккаунта"),
    "account_invalid": MessageLookupByLibrary.simpleMessage(
      "Аккаунт заблокирован Cursor",
    ),
    "account_logged_in": MessageLookupByLibrary.simpleMessage(
      "Вход в браузер выполнен",
    ),
    "account_test_error": MessageLookupByLibrary.simpleMessage(
      "Ошибка тестирования аккаунта",
    ),
    "account_valid": MessageLookupByLibrary.simpleMessage(
      "Аккаунт действителен",
    ),
    "accounts": MessageLookupByLibrary.simpleMessage("Аккаунты"),
    "active": MessageLookupByLibrary.simpleMessage("Активен"),
    "active_incidents": MessageLookupByLibrary.simpleMessage(
      "Активные инциденты",
    ),
    "add_redirected_email": MessageLookupByLibrary.simpleMessage(
      "Добавить перенаправленную почту",
    ),
    "and": MessageLookupByLibrary.simpleMessage("и"),
    "assigning_account": MessageLookupByLibrary.simpleMessage(
      "Назначение аккаунта",
    ),
    "assigning_account_error": MessageLookupByLibrary.simpleMessage(
      "Не удалось назначить аккаунт",
    ),
    "assigning_account_success": MessageLookupByLibrary.simpleMessage(
      "Аккаунт назначен из пула",
    ),
    "auth_detected": MessageLookupByLibrary.simpleMessage(
      "Аутентификация обнаружена, получение деталей аккаунта",
    ),
    "auth_error": MessageLookupByLibrary.simpleMessage("Ошибка аутентификации"),
    "auth_page_error": MessageLookupByLibrary.simpleMessage(
      "Ошибка страницы аутентификации",
    ),
    "auth_update_success": MessageLookupByLibrary.simpleMessage(
      "Аутентификация обновлена",
    ),
    "auto_login_starting": MessageLookupByLibrary.simpleMessage(
      "Автоматический вход в систему",
    ),
    "browser_initialized": MessageLookupByLibrary.simpleMessage(
      "Браузер инициализирован",
    ),
    "browser_message": MessageLookupByLibrary.simpleMessage("Браузер"),
    "browser_quit_error": MessageLookupByLibrary.simpleMessage(
      "Ошибка при закрытии браузера",
    ),
    "browser_visibility": MessageLookupByLibrary.simpleMessage(
      "Видимость браузера",
    ),
    "buy_credits": MessageLookupByLibrary.simpleMessage("Купить кредиты"),
    "cancel": MessageLookupByLibrary.simpleMessage("Отмена"),
    "changes": MessageLookupByLibrary.simpleMessage("Изменения"),
    "checking": MessageLookupByLibrary.simpleMessage("Проверка"),
    "checking_auth": MessageLookupByLibrary.simpleMessage(
      "Проверка аутентификации",
    ),
    "checking_chrome": MessageLookupByLibrary.simpleMessage(
      "Проверка Google Chrome",
    ),
    "checking_inbox": MessageLookupByLibrary.simpleMessage(
      "Проверка входящих сообщений",
    ),
    "checking_others": MessageLookupByLibrary.simpleMessage("Проверка других"),
    "checking_pip_installation": MessageLookupByLibrary.simpleMessage(
      "Проверка установки pip",
    ),
    "checking_python": MessageLookupByLibrary.simpleMessage("Проверка Python"),
    "clear_notifications": MessageLookupByLibrary.simpleMessage(
      "Очистить уведомления",
    ),
    "close": MessageLookupByLibrary.simpleMessage("Закрыть"),
    "code_found": MessageLookupByLibrary.simpleMessage("Код найден"),
    "completed": MessageLookupByLibrary.simpleMessage("Завершено"),
    "components": MessageLookupByLibrary.simpleMessage("Компоненты"),
    "connecting_imap": MessageLookupByLibrary.simpleMessage(
      "Подключение к IMAP",
    ),
    "console": MessageLookupByLibrary.simpleMessage("Консоль"),
    "continue_": MessageLookupByLibrary.simpleMessage("Продолжить"),
    "continue_on_web": MessageLookupByLibrary.simpleMessage(
      "Продолжаем работу на веб-сайте",
    ),
    "continue_to_app": MessageLookupByLibrary.simpleMessage(
      "Продолжить в приложении",
    ),
    "copied_to_clipboard": MessageLookupByLibrary.simpleMessage(
      "Скопировано в буфер обмена",
    ),
    "create_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Создать аккаунт Cursor",
    ),
    "create_gift_code": MessageLookupByLibrary.simpleMessage(
      "Создать Подарочный Код",
    ),
    "create_windsurf_account": MessageLookupByLibrary.simpleMessage(
      "Создать аккаунт Windsurf",
    ),
    "created": MessageLookupByLibrary.simpleMessage("Дата создания"),
    "created_at": MessageLookupByLibrary.simpleMessage("Дата создания"),
    "creating_email": MessageLookupByLibrary.simpleMessage(
      "Создание электронной почты",
    ),
    "credits": MessageLookupByLibrary.simpleMessage("кредитов"),
    "credits_added_to_account": m0,
    "credits_amount": MessageLookupByLibrary.simpleMessage(
      "Количество Кредитов",
    ),
    "credits_b": MessageLookupByLibrary.simpleMessage("Кредиты"),
    "credits_transfer_steps": MessageLookupByLibrary.simpleMessage(
      "Вы можете преобразовать свои текущие кредиты в подарочный код, используя кнопку \"Создать подарочный код\" на главной странице, и использовать этот код на нашем веб-сайте для переноса ваших кредитов.",
    ),
    "cursor": MessageLookupByLibrary.simpleMessage("Cursor"),
    "cursor_browser_login_info": MessageLookupByLibrary.simpleMessage("ГОТОВО"),
    "daily_login": MessageLookupByLibrary.simpleMessage("Ежедневный вход"),
    "database_error": MessageLookupByLibrary.simpleMessage(
      "Ошибка базы данных",
    ),
    "days": MessageLookupByLibrary.simpleMessage("дней"),
    "degraded_performance": MessageLookupByLibrary.simpleMessage(
      "Пониженная производительность",
    ),
    "delete": MessageLookupByLibrary.simpleMessage("Удалить"),
    "delete_account": MessageLookupByLibrary.simpleMessage("Удалить аккаунт"),
    "delete_account_confirmation": MessageLookupByLibrary.simpleMessage(
      "Вы уверены, что хотите удалить аккаунт?",
    ),
    "desktop_support_ending": MessageLookupByLibrary.simpleMessage(
      "Поддержка настольного приложения прекращается",
    ),
    "download_completed": MessageLookupByLibrary.simpleMessage(
      "Загрузка завершена",
    ),
    "download_error": m1,
    "download_failed": MessageLookupByLibrary.simpleMessage(
      "Загрузка не удалась",
    ),
    "download_update": MessageLookupByLibrary.simpleMessage(
      "Установить обновление",
    ),
    "downloading": MessageLookupByLibrary.simpleMessage("Загрузка: "),
    "downloading_python": MessageLookupByLibrary.simpleMessage(
      "Загрузка Python",
    ),
    "downloading_python_installer": MessageLookupByLibrary.simpleMessage(
      "Загрузка установщика Python",
    ),
    "downloading_python_installer_for_macos":
        MessageLookupByLibrary.simpleMessage(
          "Загрузка установщика Python для macOS",
        ),
    "downloading_python_installer_for_windows":
        MessageLookupByLibrary.simpleMessage(
          "Загрузка установщика Python для Windows",
        ),
    "downloading_update": MessageLookupByLibrary.simpleMessage(
      "Загрузка обновления",
    ),
    "email": MessageLookupByLibrary.simpleMessage("Электронная почта"),
    "email_created": MessageLookupByLibrary.simpleMessage(
      "Электронная почта создана",
    ),
    "email_creation_failed": MessageLookupByLibrary.simpleMessage(
      "Не удалось создать электронную почту",
    ),
    "email_rate_limit": MessageLookupByLibrary.simpleMessage(
      "Превышен лимит скорости отправки писем",
    ),
    "email_secret_failed": MessageLookupByLibrary.simpleMessage(
      "Не удалось получить секретный ключ электронной почты",
    ),
    "email_unavailable": MessageLookupByLibrary.simpleMessage(
      "Электронная почта недоступна",
    ),
    "email_validator_type": MessageLookupByLibrary.simpleMessage(
      "Тип валидатора электронной почты",
    ),
    "enable_proxy": MessageLookupByLibrary.simpleMessage(
      "Включить прокси при использовании Cursor. Это манипулирует веб-запросами, чтобы предотвратить ошибку пробного периода.",
    ),
    "enter_credits_amount": MessageLookupByLibrary.simpleMessage(
      "Введите количество кредитов",
    ),
    "enter_email": MessageLookupByLibrary.simpleMessage(
      "Введите электронную почту",
    ),
    "error_during_dependency_installation":
        MessageLookupByLibrary.simpleMessage(
          "Ошибка при установке зависимостей",
        ),
    "error_installing_dependencies": m2,
    "error_installing_python": MessageLookupByLibrary.simpleMessage(
      "Ошибка при установке Python",
    ),
    "failed_get_cursor_session_token": MessageLookupByLibrary.simpleMessage(
      "Не удалось получить токен сессии Cursor",
    ),
    "failed_open_auth_page": MessageLookupByLibrary.simpleMessage(
      "Не удалось открыть страницу аутентификации",
    ),
    "failed_to_install_pip_please_install_python_with_pip_included": m3,
    "failed_to_update_package_list": MessageLookupByLibrary.simpleMessage(
      "Не удалось обновить список пакетов",
    ),
    "free": MessageLookupByLibrary.simpleMessage("Бесплатно"),
    "generate_code": MessageLookupByLibrary.simpleMessage("Создать Код"),
    "getting_cursor_session_token": MessageLookupByLibrary.simpleMessage(
      "Получение деталей аккаунта",
    ),
    "getting_required_codes": MessageLookupByLibrary.simpleMessage(
      "Получение необходимых кодов",
    ),
    "getting_token": MessageLookupByLibrary.simpleMessage("Получение токена"),
    "gift_code": MessageLookupByLibrary.simpleMessage("Подарочный Код"),
    "gift_code_created_success": m4,
    "gift_code_error": MessageLookupByLibrary.simpleMessage(
      "Произошла ошибка при создании подарочного кода",
    ),
    "gift_code_info_description": MessageLookupByLibrary.simpleMessage(
      "Введите полученный подарочный код, чтобы добавить кредиты на свой аккаунт. Подарочные коды должны быть в формате XXXX-XXXX.",
    ),
    "gift_code_info_title": MessageLookupByLibrary.simpleMessage(
      "Как Использовать Подарочный Код?",
    ),
    "imap_connected": MessageLookupByLibrary.simpleMessage("IMAP подключен"),
    "imap_content_read_error": MessageLookupByLibrary.simpleMessage(
      "Ошибка чтения содержимого IMAP",
    ),
    "imap_error": MessageLookupByLibrary.simpleMessage("Ошибка IMAP"),
    "imap_settings": MessageLookupByLibrary.simpleMessage("Настройки IMAP"),
    "imap_settings_saved": MessageLookupByLibrary.simpleMessage(
      "Настройки IMAP сохранены",
    ),
    "inbox_check_failed": MessageLookupByLibrary.simpleMessage(
      "Не удалось проверить входящие сообщения",
    ),
    "init_browser_starting": MessageLookupByLibrary.simpleMessage(
      "Инициализация браузера",
    ),
    "installed_successfully": MessageLookupByLibrary.simpleMessage(
      "Успешно установлено",
    ),
    "installing": MessageLookupByLibrary.simpleMessage("Установка"),
    "installing_python": MessageLookupByLibrary.simpleMessage(
      "Установка Python",
    ),
    "installing_python_silently": MessageLookupByLibrary.simpleMessage(
      "Тихая установка Python",
    ),
    "installing_python_using_package_manager":
        MessageLookupByLibrary.simpleMessage(
          "Установка Python с помощью менеджера пакетов",
        ),
    "installing_python_using_package_manager_error":
        MessageLookupByLibrary.simpleMessage(
          "Ошибка при установке Python с помощью менеджера пакетов",
        ),
    "installing_update": MessageLookupByLibrary.simpleMessage(
      "Установка обновления",
    ),
    "invalid_server_response": MessageLookupByLibrary.simpleMessage(
      "Недействительный ответ сервера",
    ),
    "is_already_installed": MessageLookupByLibrary.simpleMessage(
      "Уже установлено",
    ),
    "limit": MessageLookupByLibrary.simpleMessage("Лимит"),
    "mail_api_error": MessageLookupByLibrary.simpleMessage(
      "Ошибка почтового сервера",
    ),
    "major_outage": MessageLookupByLibrary.simpleMessage("Серьезный сбой"),
    "mandatory_update_message": MessageLookupByLibrary.simpleMessage(
      "Это обновление обязательно. Пожалуйста, загрузите новую версию.",
    ),
    "manual": MessageLookupByLibrary.simpleMessage("Руководство"),
    "manual_download": MessageLookupByLibrary.simpleMessage("Ручная загрузка"),
    "max_attempts_reached": MessageLookupByLibrary.simpleMessage(
      "Достигнуто максимальное количество попыток",
    ),
    "navigated_to_cursor": MessageLookupByLibrary.simpleMessage(
      "Переход к Cursor",
    ),
    "new_version_available": MessageLookupByLibrary.simpleMessage(
      "Доступна новая версия",
    ),
    "no_accounts_found": MessageLookupByLibrary.simpleMessage(
      "Учетные записи не найдены",
    ),
    "no_download_url": MessageLookupByLibrary.simpleMessage(
      "URL загрузки не найден",
    ),
    "no_gift_codes_created": MessageLookupByLibrary.simpleMessage(
      "Подарочные коды еще не созданы",
    ),
    "no_notifications": MessageLookupByLibrary.simpleMessage("Нет уведомлений"),
    "no_update_values": MessageLookupByLibrary.simpleMessage(
      "Никакие значения не были обновлены",
    ),
    "not_enough_credits": MessageLookupByLibrary.simpleMessage(
      "Недостаточно кредитов",
    ),
    "not_enough_credits_for_gift": MessageLookupByLibrary.simpleMessage(
      "У вас недостаточно кредитов",
    ),
    "not_enough_credits_message": MessageLookupByLibrary.simpleMessage(
      "Пожалуйста, купите кредиты, чтобы продолжить.",
    ),
    "not_now": MessageLookupByLibrary.simpleMessage("Не сейчас"),
    "notice_title": MessageLookupByLibrary.simpleMessage("Важная информация"),
    "notifications": MessageLookupByLibrary.simpleMessage("Уведомления"),
    "open_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Открыть аккаунт в браузере",
    ),
    "opening_auth_page": MessageLookupByLibrary.simpleMessage(
      "Открытие страницы аутентификации, пожалуйста, войдите на открытой странице.",
    ),
    "operation_failed": MessageLookupByLibrary.simpleMessage(
      "Операция не удалась",
    ),
    "operational": MessageLookupByLibrary.simpleMessage("Работает"),
    "partial_outage": MessageLookupByLibrary.simpleMessage("Частичный сбой"),
    "password": MessageLookupByLibrary.simpleMessage("Пароль"),
    "patch_cursor": MessageLookupByLibrary.simpleMessage(
      "Сбросить пробный период Cursor",
    ),
    "pip_installed_successfully": MessageLookupByLibrary.simpleMessage(
      "Pip успешно установлен",
    ),
    "pip_is_already_installed": MessageLookupByLibrary.simpleMessage(
      "Pip уже установлен",
    ),
    "pip_is_not_installed_installing_pip": MessageLookupByLibrary.simpleMessage(
      "Pip не установлен, установка pip",
    ),
    "please_enter_credit_amount": MessageLookupByLibrary.simpleMessage(
      "Пожалуйста, введите количество кредитов",
    ),
    "please_enter_gift_code": MessageLookupByLibrary.simpleMessage(
      "Пожалуйста, введите подарочный код",
    ),
    "please_enter_valid_credit_amount": MessageLookupByLibrary.simpleMessage(
      "Пожалуйста, введите действительное количество кредитов",
    ),
    "please_install_google_chrome": MessageLookupByLibrary.simpleMessage(
      "Пожалуйста, установите Google Chrome",
    ),
    "please_install_python_from_the_website":
        MessageLookupByLibrary.simpleMessage(
          "Пожалуйста, установите Python с веб-сайта",
        ),
    "pool_account_count": m5,
    "pool_deactivated": MessageLookupByLibrary.simpleMessage(
      "В пуле нет доступных аккаунтов",
    ),
    "port": MessageLookupByLibrary.simpleMessage("Порт"),
    "premium": MessageLookupByLibrary.simpleMessage("Премиум"),
    "price": MessageLookupByLibrary.simpleMessage("Цена"),
    "pricing_buy_credits": MessageLookupByLibrary.simpleMessage(
      "Купить кредиты",
    ),
    "pricing_contact": MessageLookupByLibrary.simpleMessage("Контакт"),
    "pricing_contact_message": MessageLookupByLibrary.simpleMessage(
      "Свяжитесь с нами для оплаты",
    ),
    "pricing_credits_amount": MessageLookupByLibrary.simpleMessage(
      "Количество кредитов",
    ),
    "pricing_credits_amount_note": MessageLookupByLibrary.simpleMessage(
      "Вы можете установить количество кредитов по своему усмотрению.",
    ),
    "pricing_credits_per_dollar": MessageLookupByLibrary.simpleMessage(
      "Кредиты за доллар",
    ),
    "pricing_credits_per_dollar_per_day": MessageLookupByLibrary.simpleMessage(
      "Кредиты за доллар (ежедневно)",
    ),
    "pricing_credits_per_dollar_per_month":
        MessageLookupByLibrary.simpleMessage("Кредиты за доллар (ежемесячно)"),
    "pricing_custom_amount": MessageLookupByLibrary.simpleMessage(
      "Пользовательская сумма",
    ),
    "pricing_message": MessageLookupByLibrary.simpleMessage(
      "Информация о ценах",
    ),
    "pricing_payment_id": MessageLookupByLibrary.simpleMessage("ID оплаты"),
    "pricing_payment_id_copied": MessageLookupByLibrary.simpleMessage(
      "ID оплаты скопирован",
    ),
    "pricing_payment_id_copied_note": MessageLookupByLibrary.simpleMessage(
      "Вам потребуется использовать этот ID при оплате",
    ),
    "pricing_payment_id_copy": MessageLookupByLibrary.simpleMessage(
      "Копировать",
    ),
    "pricing_payment_id_note": MessageLookupByLibrary.simpleMessage(
      "Вам потребуется использовать этот ID при оплате",
    ),
    "pricing_title": MessageLookupByLibrary.simpleMessage("Цены"),
    "pricing_total_price": MessageLookupByLibrary.simpleMessage("Общая цена"),
    "processing": MessageLookupByLibrary.simpleMessage("Обработка"),
    "python_available": MessageLookupByLibrary.simpleMessage("Python доступен"),
    "python_installation_failed": MessageLookupByLibrary.simpleMessage(
      "Установка Python не удалась",
    ),
    "python_not_available": MessageLookupByLibrary.simpleMessage(
      "Python недоступен",
    ),
    "python_path_error": MessageLookupByLibrary.simpleMessage(
      "Python PATH не найден, возможно, вам потребуется перезагрузить компьютер.",
    ),
    "python_path_progress": MessageLookupByLibrary.simpleMessage(
      "Установка Python завершена, проверка PATH",
    ),
    "python_path_success": MessageLookupByLibrary.simpleMessage(
      "Установка Python завершена. Перезагрузите компьютер.",
    ),
    "random_name_generation_failed": MessageLookupByLibrary.simpleMessage(
      "Не удалось сгенерировать случайное имя",
    ),
    "redeem_code": MessageLookupByLibrary.simpleMessage("Использовать Код"),
    "redeem_code_error": MessageLookupByLibrary.simpleMessage(
      "Произошла ошибка при использовании подарочного кода",
    ),
    "redeem_gift_code": MessageLookupByLibrary.simpleMessage(
      "Использовать Подарочный Код",
    ),
    "redirected_email_info": MessageLookupByLibrary.simpleMessage(
      "Введите адреса электронной почты, которые вы хотите перенаправить на IMAP-сервер. Эти адреса будут использоваться при создании аккаунта.",
    ),
    "redirected_emails": MessageLookupByLibrary.simpleMessage(
      "Перенаправленные электронные почты",
    ),
    "registration_page_error": MessageLookupByLibrary.simpleMessage(
      "Ошибка страницы регистрации",
    ),
    "registration_success": MessageLookupByLibrary.simpleMessage(
      "Регистрация успешна",
    ),
    "remaining_credits": MessageLookupByLibrary.simpleMessage(
      "Оставшиеся кредиты",
    ),
    "remove_redirected_email": MessageLookupByLibrary.simpleMessage(
      "Удалить перенаправленную почту",
    ),
    "retry": MessageLookupByLibrary.simpleMessage("Повторить"),
    "running_required_commands": MessageLookupByLibrary.simpleMessage(
      "Выполнение необходимых команд",
    ),
    "save_imap_settings": MessageLookupByLibrary.simpleMessage(
      "Сохранить настройки IMAP",
    ),
    "server": MessageLookupByLibrary.simpleMessage("Сервер"),
    "settings": MessageLookupByLibrary.simpleMessage("Настройки"),
    "settings_are_being_configured": MessageLookupByLibrary.simpleMessage(
      "Настройки конфигурируются",
    ),
    "show_notifications": MessageLookupByLibrary.simpleMessage(
      "Показать уведомления",
    ),
    "sign_up_restricted": MessageLookupByLibrary.simpleMessage(
      "Регистрация ограничена, пожалуйста, попробуйте снова",
    ),
    "signup_starting": MessageLookupByLibrary.simpleMessage(
      "Начало регистрации",
    ),
    "socials_title": MessageLookupByLibrary.simpleMessage(
      "Свяжитесь с нами для оплаты",
    ),
    "start_proxy": MessageLookupByLibrary.simpleMessage("Запустить прокси"),
    "status": MessageLookupByLibrary.simpleMessage("Статус"),
    "status_details_not_available": MessageLookupByLibrary.simpleMessage(
      "Детали статуса недоступны",
    ),
    "stop": MessageLookupByLibrary.simpleMessage("Остановить"),
    "swipe_to_delete": MessageLookupByLibrary.simpleMessage(
      "Проведите влево для удаления",
    ),
    "switch_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Автоматический вход",
    ),
    "test_cursor_account": MessageLookupByLibrary.simpleMessage(
      "Тестировать аккаунт Cursor",
    ),
    "testing_account": MessageLookupByLibrary.simpleMessage(
      "Тестирование аккаунта",
    ),
    "thank_you_for_support": MessageLookupByLibrary.simpleMessage(
      "Спасибо за вашу поддержку",
    ),
    "today": MessageLookupByLibrary.simpleMessage("сегодня"),
    "token": MessageLookupByLibrary.simpleMessage("Токен"),
    "token_copied": MessageLookupByLibrary.simpleMessage("Токен скопирован"),
    "token_error": MessageLookupByLibrary.simpleMessage("Ошибка токена"),
    "token_retry": MessageLookupByLibrary.simpleMessage(
      "Повторная попытка получения токена",
    ),
    "transfer_credits_info": MessageLookupByLibrary.simpleMessage(
      "Перенос ваших кредитов на веб-сайт",
    ),
    "turnstile_failed": MessageLookupByLibrary.simpleMessage(
      "Проверка на робота не удалась",
    ),
    "turnstile_started": MessageLookupByLibrary.simpleMessage(
      "Проверка на робота начата",
    ),
    "turnstile_starting": MessageLookupByLibrary.simpleMessage(
      "Начало проверки на робота",
    ),
    "turnstile_success": MessageLookupByLibrary.simpleMessage(
      "Проверка на робота успешна",
    ),
    "type": MessageLookupByLibrary.simpleMessage("Тип"),
    "unexpected_error": m6,
    "update": m7,
    "update_connection_error": m8,
    "update_failed": m9,
    "update_info_not_found": MessageLookupByLibrary.simpleMessage(
      "Информация об обновлении не найдена",
    ),
    "usage_limit": MessageLookupByLibrary.simpleMessage("Лимит использования"),
    "usage_limit_error": MessageLookupByLibrary.simpleMessage(
      "Не удалось получить лимит использования",
    ),
    "used": MessageLookupByLibrary.simpleMessage("Использован"),
    "user_agent_set": MessageLookupByLibrary.simpleMessage(
      "User-Agent установлен",
    ),
    "user_id": MessageLookupByLibrary.simpleMessage("ID пользователя"),
    "username": MessageLookupByLibrary.simpleMessage("Имя пользователя"),
    "verification_code_error": MessageLookupByLibrary.simpleMessage(
      "Ошибка кода верификации",
    ),
    "verification_failed": MessageLookupByLibrary.simpleMessage(
      "Верификация не удалась",
    ),
    "verification_starting": MessageLookupByLibrary.simpleMessage(
      "Начало верификации",
    ),
    "version": MessageLookupByLibrary.simpleMessage("Версия"),
    "view_mail_failed": MessageLookupByLibrary.simpleMessage(
      "Не удалось просмотреть почту",
    ),
    "waiting": MessageLookupByLibrary.simpleMessage("Ожидание"),
    "waiting_for_email": MessageLookupByLibrary.simpleMessage(
      "Ожидание письма",
    ),
    "web_site_url": MessageLookupByLibrary.simpleMessage(
      "https://aiaccounts.online",
    ),
    "welcome_to_ai_auto_free": MessageLookupByLibrary.simpleMessage(
      "Добро пожаловать в AI Auto Free",
    ),
    "windsurf": MessageLookupByLibrary.simpleMessage("Windsurf"),
    "windsurf_token_guide_1": MessageLookupByLibrary.simpleMessage(
      "Откройте редактор Windsurf",
    ),
    "windsurf_token_guide_2": MessageLookupByLibrary.simpleMessage(
      "Нажмите CTRL + SHIFT + P",
    ),
    "windsurf_token_guide_3": MessageLookupByLibrary.simpleMessage(
      "Введите \'login\' и выберите первый вариант",
    ),
    "windsurf_token_guide_4": MessageLookupByLibrary.simpleMessage(
      "Откроется браузер, закройте его и вернитесь в редактор.",
    ),
    "windsurf_token_guide_5": MessageLookupByLibrary.simpleMessage(
      "Вставьте полученный токен в приложение.",
    ),
    "windsurf_token_guide_close_button_text":
        MessageLookupByLibrary.simpleMessage("Закрыть"),
    "windsurf_token_guide_title": MessageLookupByLibrary.simpleMessage(
      "Руководство по токену Windsurf",
    ),
    "windsurf_token_note": MessageLookupByLibrary.simpleMessage(
      "Примечание: Токен действителен в течение 1 часа.",
    ),
    "you_should_restart_your_computer": MessageLookupByLibrary.simpleMessage(
      "Python недоступен в PATH. Если вы устанавливаете впервые, перезагрузите компьютер. В противном случае, возможно, вам потребуется добавить Python в PATH.",
    ),
    "your_id": MessageLookupByLibrary.simpleMessage("Ваш ID"),
    "your_id_copied": MessageLookupByLibrary.simpleMessage("Ваш ID скопирован"),
  };
}
