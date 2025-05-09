/**
 * Telegram servis modülü
 * Log mesajlarını, uygun kanallara biçimlendirilmiş şekilde gönderir
 */

const TelegramBot = require("node-telegram-bot-api");

// Telegram bot token
const token = "7794334956:AAEGWd7rLjad67v4NOwfDZnZVKb8kG7fRew";

// Kanal ID'leri
const channels = {
  ADMIN: "-1002580357045", // Admin Panel kanalı
  ENTRY: "-1002572577370", // Girişler kanalı
  USAGE: "-1002671061846", // Kullanımlar kanalı
};

// Log tipleri
const LOG_TYPES = {
  ADMIN: "ADMIN",
  ENTRY: "ENTRY",
  USAGE: "USAGE",
};

// Bot oluştur
const bot = new TelegramBot(token, { polling: false });

// Botumuzu başlatma ve test etme
const initializeBot = async () => {
  try {
    const me = await bot.getMe();
    console.log(`[TELEGRAM] Bot başarıyla başlatıldı: @${me.username}`);
    return true;
  } catch (error) {
    console.error("[TELEGRAM] Bot başlatma hatası:", error.message);
    return false;
  }
};

// Başlangıçta botu initialize et
initializeBot();

/**
 * Mesaj metnini biçimlendirir
 * @param {string} text - İşlenmemiş metin
 * @returns {string} - Düzenlenmiş metin
 */
const formatText = (text) => {
  if (!text) return "";

  // Satır başı ve sonundaki boşlukları temizle
  text = text.trim();

  // Çok satırlı metinlerde her satırın başındaki boşlukları temizle
  text = text
    .split("\n")
    .map((line) => line.trimStart())
    .join("\n");

  return text;
};

/**
 * Detayları kodlanmış formatta biçimlendirir
 * @param {string} details - Detay metni
 * @returns {string} - Biçimlendirilmiş kod bloğu
 */
const formatCodeBlock = (details) => {
  if (!details) return "";

  // Detay metnini düzenle
  const formattedDetails = formatText(details);

  // Telegram için kod bloğu formatında dönüştür
  return `\n\n<code>${formattedDetails}</code>`;
};

/**
 * Log tipine göre uygun kanala mesaj gönderir
 * @param {string} logType - LOG_TYPES içindeki tiplerden biri
 * @param {string} message - Gönderilecek ana mesaj
 * @param {string} [details=null] - İsteğe bağlı detay metni
 * @returns {Promise<object|null>} - Telegram API yanıtı veya hata durumunda null
 */
const sendLogMessage = async (logType, message, details = null) => {
  try {
    // Log tipini kontrol et
    if (!Object.values(LOG_TYPES).includes(logType)) {
      console.error(`Geçersiz log tipi: ${logType}`);
      return null;
    }

    // Log tipine göre kanal ID'si belirle
    let channelId;
    switch (logType) {
      case LOG_TYPES.ADMIN:
        channelId = channels.ADMIN;
        break;
      case LOG_TYPES.ENTRY:
        channelId = channels.ENTRY;
        break;
      case LOG_TYPES.USAGE:
        channelId = channels.USAGE;
        break;
      default:
        // Varsayılan olarak admin kanalına gönder
        channelId = channels.ADMIN;
    }

    // Ana mesajı ve detayları birleştir
    let formattedMessage = `<b>${message}</b>`;

    if (details) {
      // Detaylar için kod bloğu formatı kullan
      formattedMessage += formatCodeBlock(details);
    }

    // Mesajı gönder
    const response = await bot.sendMessage(channelId, formattedMessage, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });

    return response;
  } catch (error) {
    console.error("Telegram mesaj gönderme hatası:", error);
    return null;
  }
};

/**
 * Admin kanalına log mesajı gönderir
 * @param {string} message - Gönderilecek ana mesaj
 * @param {string} [details=null] - İsteğe bağlı detay metni
 * @returns {Promise<object|null>} - Telegram API yanıtı veya hata durumunda null
 */
const sendAdminLog = (message, details = null) => {
  return sendLogMessage(LOG_TYPES.ADMIN, message, details);
};

/**
 * Test amaçlı admin kanalına mesaj gönderir
 * @returns {Promise<boolean>} Başarılı olup olmadığı
 */
const testAdminLogConnection = async () => {
  try {
    const testResult = await sendAdminLog("Test Mesaj", `Zaman: ${new Date().toISOString()}\nBu bir test mesajıdır.`);

    return !!testResult;
  } catch (error) {
    console.error("[TELEGRAM] Admin log test hatası:", error.message);
    return false;
  }
};

/**
 * Giriş kanalına log mesajı gönderir
 * @param {string} message - Gönderilecek ana mesaj
 * @param {string} [details=null] - İsteğe bağlı detay metni
 * @returns {Promise<object|null>} - Telegram API yanıtı veya hata durumunda null
 */
const sendEntryLog = (message, details = null) => {
  return sendLogMessage(LOG_TYPES.ENTRY, message, details);
};

/**
 * Kullanım kanalına log mesajı gönderir
 * @param {string} message - Gönderilecek ana mesaj
 * @param {string} [details=null] - İsteğe bağlı detay metni
 * @returns {Promise<object|null>} - Telegram API yanıtı veya hata durumunda null
 */
const sendUsageLog = (message, details = null) => {
  return sendLogMessage(LOG_TYPES.USAGE, message, details);
};

/**
 * Bildirim mesajını admin kanalına belirli kullanıcıyı etiketleyerek gönderir
 * @param {string} message - Gönderilecek ana mesaj
 * @param {string} [details=null] - İsteğe bağlı detay metni
 * @returns {Promise<object|null>} - Telegram API yanıtı veya hata durumunda null
 */
const sendNotificationLog = async (message, details = null) => {
  try {
    // Admin kanalını kullan
    const channelId = channels.ADMIN;

    // Kullanıcı etiketlemesi için bilgiler
    const userId = "7511380226";
    const username = "omergundgr";

    // Ana mesajı ve detayları birleştir
    let formattedMessage = `<b>BİLDİRİM:</b> ${message}`;

    if (details) {
      // Detaylar için kod bloğu formatı kullan
      formattedMessage += formatCodeBlock(details);
    }

    // Mesajı gönder
    const response = await bot.sendMessage(channelId, formattedMessage, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });

    return response;
  } catch (error) {
    console.error("Telegram bildirim mesajı gönderme hatası:", error);
    return null;
  }
};

module.exports = {
  LOG_TYPES,
  sendLogMessage,
  sendAdminLog,
  sendEntryLog,
  sendUsageLog,
  sendNotificationLog,
  testAdminLogConnection,
};
