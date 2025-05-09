// DO NOT EDIT. This is code generated via package:intl/generate_localized.dart
// This is a library that provides messages for a zh locale. All the
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
  String get localeName => 'zh';

  static String m0(credits) => "${credits} 积分已添加到您的账户";

  static String m1(message) => "下载错误：${message}";

  static String m2(dependency) =>
      "依赖安装错误，请手动安装。请在终端中运行以下命令安装依赖：`${dependency}`";

  static String m3(dependency) => "依赖安装失败。请在终端中运行以下命令安装依赖：`${dependency}`";

  static String m4(code) => "礼品码创建成功: ${code}";

  static String m5(count) => "当前有${count}个账户正在运行";

  static String m6(message) => "发生意外错误：${message}";

  static String m7(version) => "更新 (${version})";

  static String m8(message) => "连接错误：${message}";

  static String m9(message) => "更新失败: ${message}";

  final messages = _notInlinedMessages(_notInlinedMessages);
  static Map<String, Function> _notInlinedMessages(_) => <String, Function>{
    "about": MessageLookupByLibrary.simpleMessage("关于"),
    "account_created": MessageLookupByLibrary.simpleMessage("账户已创建"),
    "account_details": MessageLookupByLibrary.simpleMessage("账户详情"),
    "account_invalid": MessageLookupByLibrary.simpleMessage("账户被Cursor阻止"),
    "account_logged_in": MessageLookupByLibrary.simpleMessage("浏览器已登录"),
    "account_test_error": MessageLookupByLibrary.simpleMessage("账户测试错误"),
    "account_valid": MessageLookupByLibrary.simpleMessage("账户有效"),
    "accounts": MessageLookupByLibrary.simpleMessage("账户"),
    "active": MessageLookupByLibrary.simpleMessage("有效"),
    "active_incidents": MessageLookupByLibrary.simpleMessage("活动事件"),
    "add_redirected_email": MessageLookupByLibrary.simpleMessage("添加重定向邮箱"),
    "and": MessageLookupByLibrary.simpleMessage("和"),
    "assigning_account": MessageLookupByLibrary.simpleMessage("正在分配账户"),
    "assigning_account_error": MessageLookupByLibrary.simpleMessage("账户分配失败"),
    "assigning_account_success": MessageLookupByLibrary.simpleMessage(
      "已从池中分配账户",
    ),
    "auth_detected": MessageLookupByLibrary.simpleMessage("认证已检测，正在获取账户详情"),
    "auth_error": MessageLookupByLibrary.simpleMessage("身份验证错误"),
    "auth_page_error": MessageLookupByLibrary.simpleMessage("认证页面错误"),
    "auth_update_success": MessageLookupByLibrary.simpleMessage("身份验证信息已更新"),
    "auto_login_starting": MessageLookupByLibrary.simpleMessage("自动登录开始"),
    "browser_initialized": MessageLookupByLibrary.simpleMessage("浏览器已初始化"),
    "browser_message": MessageLookupByLibrary.simpleMessage("浏览器"),
    "browser_quit_error": MessageLookupByLibrary.simpleMessage("浏览器关闭错误"),
    "browser_visibility": MessageLookupByLibrary.simpleMessage("浏览器可见性"),
    "buy_credits": MessageLookupByLibrary.simpleMessage("购买积分"),
    "cancel": MessageLookupByLibrary.simpleMessage("取消"),
    "changes": MessageLookupByLibrary.simpleMessage("更新内容"),
    "checking": MessageLookupByLibrary.simpleMessage("检查中"),
    "checking_auth": MessageLookupByLibrary.simpleMessage("正在检查身份验证"),
    "checking_chrome": MessageLookupByLibrary.simpleMessage(
      "正在检查Google Chrome",
    ),
    "checking_inbox": MessageLookupByLibrary.simpleMessage("正在检查收件箱"),
    "checking_others": MessageLookupByLibrary.simpleMessage("正在检查其他"),
    "checking_pip_installation": MessageLookupByLibrary.simpleMessage(
      "正在检查pip",
    ),
    "checking_python": MessageLookupByLibrary.simpleMessage("正在检查Python"),
    "clear_notifications": MessageLookupByLibrary.simpleMessage("清除通知"),
    "close": MessageLookupByLibrary.simpleMessage("关闭"),
    "code_found": MessageLookupByLibrary.simpleMessage("已找到验证码"),
    "completed": MessageLookupByLibrary.simpleMessage("已完成"),
    "components": MessageLookupByLibrary.simpleMessage("组件"),
    "connecting_imap": MessageLookupByLibrary.simpleMessage("正在连接IMAP"),
    "console": MessageLookupByLibrary.simpleMessage("控制台"),
    "continue_": MessageLookupByLibrary.simpleMessage("继续"),
    "continue_on_web": MessageLookupByLibrary.simpleMessage("我们将在网站上继续"),
    "continue_to_app": MessageLookupByLibrary.simpleMessage("继续使用应用程序"),
    "copied_to_clipboard": MessageLookupByLibrary.simpleMessage("已复制到剪贴板"),
    "create_cursor_account": MessageLookupByLibrary.simpleMessage("创建Cursor账户"),
    "create_gift_code": MessageLookupByLibrary.simpleMessage("创建礼品码"),
    "create_windsurf_account": MessageLookupByLibrary.simpleMessage(
      "创建Windsurf账户",
    ),
    "created": MessageLookupByLibrary.simpleMessage("创建时间"),
    "created_at": MessageLookupByLibrary.simpleMessage("创建时间"),
    "creating_email": MessageLookupByLibrary.simpleMessage("正在创建邮箱"),
    "credits": MessageLookupByLibrary.simpleMessage("积分"),
    "credits_added_to_account": m0,
    "credits_amount": MessageLookupByLibrary.simpleMessage("积分数量"),
    "credits_b": MessageLookupByLibrary.simpleMessage("积分"),
    "credits_transfer_steps": MessageLookupByLibrary.simpleMessage(
      "您可以在主页上使用“创建礼品代码”按钮将您现有的积分转换为礼品代码，然后在我们的网站上使用此代码转移您的积分。",
    ),
    "cursor": MessageLookupByLibrary.simpleMessage("Cursor"),
    "cursor_browser_login_info": MessageLookupByLibrary.simpleMessage("就绪"),
    "daily_login": MessageLookupByLibrary.simpleMessage("每日登录"),
    "database_error": MessageLookupByLibrary.simpleMessage("数据库错误"),
    "days": MessageLookupByLibrary.simpleMessage("天"),
    "degraded_performance": MessageLookupByLibrary.simpleMessage("性能下降"),
    "delete": MessageLookupByLibrary.simpleMessage("删除"),
    "delete_account": MessageLookupByLibrary.simpleMessage("删除账户"),
    "delete_account_confirmation": MessageLookupByLibrary.simpleMessage(
      "确定要删除此账户吗？",
    ),
    "desktop_support_ending": MessageLookupByLibrary.simpleMessage(
      "桌面应用程序支持即将结束",
    ),
    "download_completed": MessageLookupByLibrary.simpleMessage("下载完成"),
    "download_error": m1,
    "download_failed": MessageLookupByLibrary.simpleMessage("下载失败"),
    "download_update": MessageLookupByLibrary.simpleMessage("安装更新"),
    "downloading": MessageLookupByLibrary.simpleMessage("下载中: "),
    "downloading_python": MessageLookupByLibrary.simpleMessage("正在下载Python"),
    "downloading_python_installer": MessageLookupByLibrary.simpleMessage(
      "正在下载Python安装程序",
    ),
    "downloading_python_installer_for_macos":
        MessageLookupByLibrary.simpleMessage("正在下载MacOS版Python安装程序"),
    "downloading_python_installer_for_windows":
        MessageLookupByLibrary.simpleMessage("正在下载Windows版Python安装程序"),
    "downloading_update": MessageLookupByLibrary.simpleMessage("正在下载更新"),
    "email": MessageLookupByLibrary.simpleMessage("邮箱"),
    "email_created": MessageLookupByLibrary.simpleMessage("邮箱已创建"),
    "email_creation_failed": MessageLookupByLibrary.simpleMessage("邮箱创建失败"),
    "email_rate_limit": MessageLookupByLibrary.simpleMessage("邮箱创建限制已达到"),
    "email_secret_failed": MessageLookupByLibrary.simpleMessage(
      "Email secret key失败",
    ),
    "email_unavailable": MessageLookupByLibrary.simpleMessage("邮箱不可用"),
    "email_validator_type": MessageLookupByLibrary.simpleMessage("邮箱验证类型"),
    "enable_proxy": MessageLookupByLibrary.simpleMessage(
      "使用Cursor时启用代理。这将通过操作网络请求来防止试用期错误。",
    ),
    "enter_credits_amount": MessageLookupByLibrary.simpleMessage("输入积分数量"),
    "enter_email": MessageLookupByLibrary.simpleMessage("请输入邮箱"),
    "error_during_dependency_installation":
        MessageLookupByLibrary.simpleMessage("依赖安装错误"),
    "error_installing_dependencies": m2,
    "error_installing_python": MessageLookupByLibrary.simpleMessage(
      "Python安装错误",
    ),
    "failed_get_cursor_session_token": MessageLookupByLibrary.simpleMessage(
      "获取Cursor会话令牌时失败",
    ),
    "failed_open_auth_page": MessageLookupByLibrary.simpleMessage("打开认证页面时失败"),
    "failed_to_install_pip_please_install_python_with_pip_included": m3,
    "failed_to_update_package_list": MessageLookupByLibrary.simpleMessage(
      "包列表更新失败",
    ),
    "free": MessageLookupByLibrary.simpleMessage("免费"),
    "generate_code": MessageLookupByLibrary.simpleMessage("生成代码"),
    "getting_cursor_session_token": MessageLookupByLibrary.simpleMessage(
      "正在获取账户详情",
    ),
    "getting_required_codes": MessageLookupByLibrary.simpleMessage("正在获取所需代码"),
    "getting_token": MessageLookupByLibrary.simpleMessage("正在获取令牌"),
    "gift_code": MessageLookupByLibrary.simpleMessage("礼品码"),
    "gift_code_created_success": m4,
    "gift_code_error": MessageLookupByLibrary.simpleMessage("创建礼品码时发生错误"),
    "gift_code_info_description": MessageLookupByLibrary.simpleMessage(
      "在此处输入您收到的礼品码，为您的账户添加积分。礼品码格式应为 XXXX-XXXX。",
    ),
    "gift_code_info_title": MessageLookupByLibrary.simpleMessage("如何使用礼品码？"),
    "imap_connected": MessageLookupByLibrary.simpleMessage("IMAP已连接"),
    "imap_content_read_error": MessageLookupByLibrary.simpleMessage(
      "IMAP内容读取错误",
    ),
    "imap_error": MessageLookupByLibrary.simpleMessage("IMAP错误"),
    "imap_settings": MessageLookupByLibrary.simpleMessage("IMAP设置"),
    "imap_settings_saved": MessageLookupByLibrary.simpleMessage("IMAP设置已保存"),
    "inbox_check_failed": MessageLookupByLibrary.simpleMessage("邮箱检查失败"),
    "init_browser_starting": MessageLookupByLibrary.simpleMessage("正在初始化浏览器"),
    "installed_successfully": MessageLookupByLibrary.simpleMessage("安装成功"),
    "installing": MessageLookupByLibrary.simpleMessage("安装中"),
    "installing_python": MessageLookupByLibrary.simpleMessage("正在安装Python"),
    "installing_python_silently": MessageLookupByLibrary.simpleMessage(
      "正在静默安装Python",
    ),
    "installing_python_using_package_manager":
        MessageLookupByLibrary.simpleMessage("正在使用包管理器安装Python"),
    "installing_python_using_package_manager_error":
        MessageLookupByLibrary.simpleMessage("使用包管理器安装Python时出错"),
    "installing_update": MessageLookupByLibrary.simpleMessage("正在安装更新"),
    "invalid_server_response": MessageLookupByLibrary.simpleMessage("服务器响应无效"),
    "is_already_installed": MessageLookupByLibrary.simpleMessage("已安装"),
    "limit": MessageLookupByLibrary.simpleMessage("限制"),
    "mail_api_error": MessageLookupByLibrary.simpleMessage("邮件服务器错误"),
    "major_outage": MessageLookupByLibrary.simpleMessage("主要中断"),
    "mandatory_update_message": MessageLookupByLibrary.simpleMessage(
      "此更新为必需更新。请下载新版本。",
    ),
    "manual": MessageLookupByLibrary.simpleMessage("手册"),
    "manual_download": MessageLookupByLibrary.simpleMessage("手动下载"),
    "max_attempts_reached": MessageLookupByLibrary.simpleMessage("已达到最大尝试次数"),
    "navigated_to_cursor": MessageLookupByLibrary.simpleMessage("已导航至Cursor"),
    "new_version_available": MessageLookupByLibrary.simpleMessage("有新版本"),
    "no_accounts_found": MessageLookupByLibrary.simpleMessage("未找到账户"),
    "no_download_url": MessageLookupByLibrary.simpleMessage("未找到下载URL"),
    "no_gift_codes_created": MessageLookupByLibrary.simpleMessage("尚未创建礼品码"),
    "no_notifications": MessageLookupByLibrary.simpleMessage("没有通知"),
    "no_update_values": MessageLookupByLibrary.simpleMessage("没有更新任何值"),
    "not_enough_credits": MessageLookupByLibrary.simpleMessage("积分不足"),
    "not_enough_credits_for_gift": MessageLookupByLibrary.simpleMessage(
      "您没有足够的积分",
    ),
    "not_enough_credits_message": MessageLookupByLibrary.simpleMessage(
      "请购买积分以继续。",
    ),
    "not_now": MessageLookupByLibrary.simpleMessage("暂不更新"),
    "notice_title": MessageLookupByLibrary.simpleMessage("重要提示"),
    "notifications": MessageLookupByLibrary.simpleMessage("通知"),
    "open_cursor_account": MessageLookupByLibrary.simpleMessage("在浏览器中打开账户"),
    "opening_auth_page": MessageLookupByLibrary.simpleMessage(
      "打开认证页面，请在打开的页面中登录您的账户。",
    ),
    "operation_failed": MessageLookupByLibrary.simpleMessage("操作失败"),
    "operational": MessageLookupByLibrary.simpleMessage("正常运行"),
    "partial_outage": MessageLookupByLibrary.simpleMessage("部分中断"),
    "password": MessageLookupByLibrary.simpleMessage("密码"),
    "patch_cursor": MessageLookupByLibrary.simpleMessage("Cursor试用期重置"),
    "pip_installed_successfully": MessageLookupByLibrary.simpleMessage(
      "pip安装成功",
    ),
    "pip_is_already_installed": MessageLookupByLibrary.simpleMessage("pip已安装"),
    "pip_is_not_installed_installing_pip": MessageLookupByLibrary.simpleMessage(
      "pip未安装，正在安装pip",
    ),
    "please_enter_credit_amount": MessageLookupByLibrary.simpleMessage(
      "请输入积分数量",
    ),
    "please_enter_gift_code": MessageLookupByLibrary.simpleMessage("请输入礼品码"),
    "please_enter_valid_credit_amount": MessageLookupByLibrary.simpleMessage(
      "请输入有效的积分数量",
    ),
    "please_install_google_chrome": MessageLookupByLibrary.simpleMessage(
      "请安装Google Chrome",
    ),
    "please_install_python_from_the_website":
        MessageLookupByLibrary.simpleMessage("请从网站安装Python"),
    "pool_account_count": m5,
    "pool_deactivated": MessageLookupByLibrary.simpleMessage("当前没有可用的账户"),
    "port": MessageLookupByLibrary.simpleMessage("端口"),
    "premium": MessageLookupByLibrary.simpleMessage("高级"),
    "price": MessageLookupByLibrary.simpleMessage("价格"),
    "pricing_buy_credits": MessageLookupByLibrary.simpleMessage("购买积分"),
    "pricing_contact": MessageLookupByLibrary.simpleMessage("联系我们"),
    "pricing_contact_message": MessageLookupByLibrary.simpleMessage("联系我们进行付款"),
    "pricing_credits_amount": MessageLookupByLibrary.simpleMessage("积分数量"),
    "pricing_credits_amount_note": MessageLookupByLibrary.simpleMessage(
      "您可以根据需要设置积分数量。",
    ),
    "pricing_credits_per_dollar": MessageLookupByLibrary.simpleMessage("每美元积分"),
    "pricing_credits_per_dollar_per_day": MessageLookupByLibrary.simpleMessage(
      "每美元积分（每日）",
    ),
    "pricing_credits_per_dollar_per_month":
        MessageLookupByLibrary.simpleMessage("每美元积分（每月）"),
    "pricing_custom_amount": MessageLookupByLibrary.simpleMessage("自定义金额"),
    "pricing_message": MessageLookupByLibrary.simpleMessage("定价信息"),
    "pricing_payment_id": MessageLookupByLibrary.simpleMessage("支付ID"),
    "pricing_payment_id_copied": MessageLookupByLibrary.simpleMessage(
      "支付ID已复制",
    ),
    "pricing_payment_id_copied_note": MessageLookupByLibrary.simpleMessage(
      "付款时需要使用此ID",
    ),
    "pricing_payment_id_copy": MessageLookupByLibrary.simpleMessage("复制"),
    "pricing_payment_id_note": MessageLookupByLibrary.simpleMessage(
      "付款时需要使用此ID",
    ),
    "pricing_title": MessageLookupByLibrary.simpleMessage("定价"),
    "pricing_total_price": MessageLookupByLibrary.simpleMessage("总价"),
    "processing": MessageLookupByLibrary.simpleMessage("处理中"),
    "python_available": MessageLookupByLibrary.simpleMessage("Python可用"),
    "python_installation_failed": MessageLookupByLibrary.simpleMessage(
      "Python安装失败",
    ),
    "python_not_available": MessageLookupByLibrary.simpleMessage("Python不可用"),
    "python_path_error": MessageLookupByLibrary.simpleMessage(
      "Python PATH未找到，您可能需要重新启动计算机。",
    ),
    "python_path_progress": MessageLookupByLibrary.simpleMessage(
      "Python安装完成，正在检查PATH",
    ),
    "python_path_success": MessageLookupByLibrary.simpleMessage(
      "Python安装完成。重新启动计算机。",
    ),
    "random_name_generation_failed": MessageLookupByLibrary.simpleMessage(
      "随机名称生成失败",
    ),
    "redeem_code": MessageLookupByLibrary.simpleMessage("兑换代码"),
    "redeem_code_error": MessageLookupByLibrary.simpleMessage("使用礼品码时发生错误"),
    "redeem_gift_code": MessageLookupByLibrary.simpleMessage("兑换礼品码"),
    "redirected_email_info": MessageLookupByLibrary.simpleMessage(
      "请输入您想要重定向到IMAP服务器的邮箱地址。这些邮箱地址将在创建账户时使用。",
    ),
    "redirected_emails": MessageLookupByLibrary.simpleMessage("重定向邮箱"),
    "registration_page_error": MessageLookupByLibrary.simpleMessage("注册页面错误"),
    "registration_success": MessageLookupByLibrary.simpleMessage("注册成功"),
    "remaining_credits": MessageLookupByLibrary.simpleMessage("剩余积分"),
    "remove_redirected_email": MessageLookupByLibrary.simpleMessage("删除重定向邮箱"),
    "retry": MessageLookupByLibrary.simpleMessage("重试"),
    "running_required_commands": MessageLookupByLibrary.simpleMessage(
      "正在运行必需的命令",
    ),
    "save_imap_settings": MessageLookupByLibrary.simpleMessage("保存IMAP设置"),
    "server": MessageLookupByLibrary.simpleMessage("服务器"),
    "settings": MessageLookupByLibrary.simpleMessage("设置"),
    "settings_are_being_configured": MessageLookupByLibrary.simpleMessage(
      "正在配置设置",
    ),
    "show_notifications": MessageLookupByLibrary.simpleMessage("显示通知"),
    "sign_up_restricted": MessageLookupByLibrary.simpleMessage("注册受限，请重试"),
    "signup_starting": MessageLookupByLibrary.simpleMessage("开始注册"),
    "socials_title": MessageLookupByLibrary.simpleMessage("联系我们进行支付"),
    "start_proxy": MessageLookupByLibrary.simpleMessage("启动代理"),
    "status": MessageLookupByLibrary.simpleMessage("状态"),
    "status_details_not_available": MessageLookupByLibrary.simpleMessage(
      "状态详情不可用",
    ),
    "stop": MessageLookupByLibrary.simpleMessage("停止"),
    "swipe_to_delete": MessageLookupByLibrary.simpleMessage("向左滑动删除"),
    "switch_cursor_account": MessageLookupByLibrary.simpleMessage("自动登录"),
    "test_cursor_account": MessageLookupByLibrary.simpleMessage("测试Cursor账户"),
    "testing_account": MessageLookupByLibrary.simpleMessage("测试账户"),
    "thank_you_for_support": MessageLookupByLibrary.simpleMessage("感谢您的支持"),
    "today": MessageLookupByLibrary.simpleMessage("今天"),
    "token": MessageLookupByLibrary.simpleMessage("令牌"),
    "token_copied": MessageLookupByLibrary.simpleMessage("令牌已复制"),
    "token_error": MessageLookupByLibrary.simpleMessage("令牌错误"),
    "token_retry": MessageLookupByLibrary.simpleMessage("正在尝试重新获取令牌"),
    "transfer_credits_info": MessageLookupByLibrary.simpleMessage("将您的积分转移到网站"),
    "turnstile_failed": MessageLookupByLibrary.simpleMessage("人机验证失败"),
    "turnstile_started": MessageLookupByLibrary.simpleMessage("人机验证已开始"),
    "turnstile_starting": MessageLookupByLibrary.simpleMessage("开始人机验证"),
    "turnstile_success": MessageLookupByLibrary.simpleMessage("人机验证成功"),
    "type": MessageLookupByLibrary.simpleMessage("类型"),
    "unexpected_error": m6,
    "update": m7,
    "update_connection_error": m8,
    "update_failed": m9,
    "update_info_not_found": MessageLookupByLibrary.simpleMessage("未找到更新信息"),
    "usage_limit": MessageLookupByLibrary.simpleMessage("使用限制"),
    "usage_limit_error": MessageLookupByLibrary.simpleMessage("无法获取使用限制"),
    "used": MessageLookupByLibrary.simpleMessage("已使用"),
    "user_agent_set": MessageLookupByLibrary.simpleMessage("User-Agent已设置"),
    "user_id": MessageLookupByLibrary.simpleMessage("用户ID"),
    "username": MessageLookupByLibrary.simpleMessage("用户名"),
    "verification_code_error": MessageLookupByLibrary.simpleMessage("验证码错误"),
    "verification_failed": MessageLookupByLibrary.simpleMessage("验证失败"),
    "verification_starting": MessageLookupByLibrary.simpleMessage("开始验证"),
    "version": MessageLookupByLibrary.simpleMessage("版本"),
    "view_mail_failed": MessageLookupByLibrary.simpleMessage("查看邮箱失败"),
    "waiting": MessageLookupByLibrary.simpleMessage("等待中"),
    "waiting_for_email": MessageLookupByLibrary.simpleMessage("等待邮件"),
    "web_site_url": MessageLookupByLibrary.simpleMessage(
      "https://aiaccounts.online",
    ),
    "welcome_to_ai_auto_free": MessageLookupByLibrary.simpleMessage(
      "欢迎使用AI Auto Free",
    ),
    "windsurf": MessageLookupByLibrary.simpleMessage("Windsurf"),
    "windsurf_token_guide_1": MessageLookupByLibrary.simpleMessage(
      "打开 Windsurf 编辑器",
    ),
    "windsurf_token_guide_2": MessageLookupByLibrary.simpleMessage(
      "按 CTRL + SHIFT + P",
    ),
    "windsurf_token_guide_3": MessageLookupByLibrary.simpleMessage(
      "输入\'login\'并选择第一个选项",
    ),
    "windsurf_token_guide_4": MessageLookupByLibrary.simpleMessage(
      "浏览器将打开，关闭它并返回编辑器。",
    ),
    "windsurf_token_guide_5": MessageLookupByLibrary.simpleMessage(
      "将收到的令牌粘贴到应用程序中。",
    ),
    "windsurf_token_guide_close_button_text":
        MessageLookupByLibrary.simpleMessage("关闭"),
    "windsurf_token_guide_title": MessageLookupByLibrary.simpleMessage(
      "Windsurf Token 指南",
    ),
    "windsurf_token_note": MessageLookupByLibrary.simpleMessage(
      "注意：令牌有效期为1小时。",
    ),
    "you_should_restart_your_computer": MessageLookupByLibrary.simpleMessage(
      "Python在PATH中不可用。如果您是第一次安装，请重新启动计算机。否则，您可能需要将Python添加到PATH中。",
    ),
    "your_id": MessageLookupByLibrary.simpleMessage("您的ID"),
    "your_id_copied": MessageLookupByLibrary.simpleMessage("您的ID已复制"),
  };
}
