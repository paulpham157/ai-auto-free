const crypto = require("crypto");
const { Buffer } = require("buffer");
const db = require("../database/db");

// Şifreleme anahtarı - Gerçek projede .env dosyasından alınmalı
const _encryptionKey = "ai_auto_free_secure_key_V47R3JNT";

/**
 * Şifrelenmiş veriyi çözen fonksiyon
 * @param {string} encryptedData - Şifrelenmiş veri
 * @returns {Object} - Çözülmüş veri nesnesi
 */
function decryptData(encryptedData) {
  try {
    // Null veya tanımsız veri kontrolü
    if (!encryptedData) {
      throw new Error("Encrypted data is null or undefined");
    }

    // String olup olmadığını kontrol et
    if (typeof encryptedData !== "string") {
      console.log(`Uyarı: encryptedData string değil, tipi: ${typeof encryptedData}`);
      throw new Error(`Invalid encrypted data type: ${typeof encryptedData}`);
    }

    // Salt değeri ve şifrelenmiş veriyi ayır
    const parts = encryptedData.split(":");

    if (parts.length !== 2) {
      console.log(`Uyarı: Geçersiz format, alınan veri: ${encryptedData}`);
      throw new Error(`Invalid encrypted data format, expected format: 'salt:base64Data', got: ${encryptedData}`);
    }

    const [salt, encodedData] = parts;

    if (!salt || !encodedData) {
      console.log("Uyarı: Salt veya encodedData eksik");
      throw new Error("Invalid encrypted data format: missing salt or encoded data");
    }

    // Base64 ile kodlanmış veriyi çöz
    let encryptedBytes;
    try {
      encryptedBytes = Buffer.from(encodedData, "base64");
    } catch (e) {
      console.log("Base64 çözme hatası:", e);
      throw new Error(`Base64 decode error: ${e.message}`);
    }

    // XOR işlemi için anahtar oluştur
    const keyBytes = Buffer.from(_encryptionKey + salt, "utf8");

    // XOR işlemi ile şifreyi çöz
    const decryptedBytes = [];
    for (let i = 0; i < encryptedBytes.length; i++) {
      decryptedBytes.push(encryptedBytes[i] ^ keyBytes[i % keyBytes.length]);
    }

    // Çözülmüş veriyi UTF-8 formatına dönüştür
    const decryptedData = Buffer.from(decryptedBytes).toString("utf8");

    // JSON formatına parse et
    try {
      const result = JSON.parse(decryptedData);
      return result;
    } catch (e) {
      console.log("JSON parse hatası:", e, "Ham veri:", decryptedData);
      throw new Error(`JSON parse error: ${e.message}, raw data: ${decryptedData}`);
    }
  } catch (error) {
    console.error("Veri şifre çözme hatası:", error.message);
    throw new Error(`Failed to decrypt data: ${error.message}`);
  }
}

/**
 * Cihaz bilgi modeli
 * @typedef {Object} DeviceInfoModel
 * @property {string} computerName - Bilgisayar adı
 * @property {string} deviceId - Cihaz ID'si
 * @property {string} productName - Ürün adı
 * @property {number} numberOfCores - İşlemci çekirdek sayısı
 * @property {number} systemMemoryInMegabytes - Sistem belleği (MB)
 * @property {string} username - Kullanıcı adı
 * @property {string} locale - Dil ayarı
 * @property {string} macAddress - MAC adresi
 * @property {string} osName - İşletim sistemi adı
 * @property {string} ipAddress - IP adresi
 */

/**
 * Header bilgilerini doğrular
 * @param {Object} headers - Header bilgileri
 * @param {DeviceInfoModel} deviceInfo - Cihaz bilgileri
 * @returns {boolean} - Doğrulama sonucu
 */
function verifySecureHeaders(headers, deviceInfo) {
  try {
    // Gerekli header'lar var mı kontrol et
    if (!headers["x-device-info"] || !headers["x-device-signature"] || !headers["x-timestamp"] || !headers["x-verification"]) {
      console.log("Eksik header bilgileri:", {
        hasDeviceInfo: !!headers["x-device-info"],
        hasSignature: !!headers["x-device-signature"],
        hasTimestamp: !!headers["x-timestamp"],
        hasVerification: !!headers["x-verification"],
      });
      return false;
    }
    /*
    // Zaman damgasını kontrol et (5 dakikadan eski ise reddet)
    const timestamp = parseInt(headers["x-timestamp"] || "0", 10);
    const now = Date.now();

    if (now - timestamp > 3 * 60 * 1000) {
      // 3 dakika
      console.log("Zaman damgası geçersiz");
      return false;
    } */

    // Cihaz bilgilerini al
    const encodedDeviceInfo = headers["x-device-info"];
    const deviceInfoJson = Buffer.from(encodedDeviceInfo, "base64").toString("utf8");

    // İmzayı doğrula
    const hmacSha256 = crypto.createHmac("sha256", _encryptionKey);
    const expectedSignature = hmacSha256.update(deviceInfoJson).digest("hex");

    if (headers["x-device-signature"] !== expectedSignature) {
      console.log("İmza doğrulaması başarısız");
      return false;
    }

    // Ek doğrulama
    const verificationData = `${headers["x-timestamp"]}:${deviceInfo.deviceId}:${deviceInfo.ipAddress}`;
    const expectedVerification = crypto.createHmac("sha256", _encryptionKey).update(verificationData).digest("hex");

    if (headers["x-verification"] !== expectedVerification) {
      console.log("Ek doğrulama başarısız");
      return false;
    }
    return true;
  } catch (e) {
    console.error("Header doğrulama hatası:", e);
    return false;
  }
}

/**
 * Cihaz doğrulama ve ban kontrolü middleware
 */
const deviceAuthMiddleware = async (req, res, next) => {
  // Sadece belirli route'lar için kontrol et
  const protectedRoutes = ["/api/user", "/api/auth"];
  if (!protectedRoutes.some((route) => req.path.startsWith(route))) {
    return next();
  }

  try {
    // İstemci IP adresini al
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Gerekli headerların varlığını kontrol et
    if (!req.headers["x-device-info"] || !req.headers["x-device-signature"] || !req.headers["x-timestamp"] || !req.headers["x-verification"]) {
      console.log("Eksik header bilgileri:", {
        hasDeviceInfo: !!req.headers["x-device-info"],
        hasSignature: !!req.headers["x-device-signature"],
        hasTimestamp: !!req.headers["x-timestamp"],
        hasVerification: !!req.headers["x-verification"],
      });

      // Auth rotası için özel durum - sadece encryptedData olduğunda headerları bypass et
      if (req.path === "/api/auth" && req.body && req.body["encryptedData"]) {
        return next();
      }

      return res.status(403).json({
        error: "Missing security headers",
        message: "Device authentication failed.",
      });
    }

    // Body kontrolü
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // deviceInfo kontrolü - encryptedData varsa o kullanılacak, user endpointinde
    if (!req.body["deviceInfo"] && !req.body["encryptedData"]) {
      return res.status(400).json({ error: "Invalid request body or missing deviceInfo" });
    }

    // encryptedData varsa şifresini çöz
    let deviceInfoData;
    if (req.body["encryptedData"]) {
      try {
        deviceInfoData = decryptData(req.body["encryptedData"])["deviceInfo"];
      } catch (decryptError) {
        console.error("Device bilgisi şifre çözme hatası:", decryptError);
        return res.status(400).json({ error: "Invalid encrypted data", details: decryptError.message });
      }
    } else {
      //deviceInfoData = req.body["deviceInfo"];
      return res.status(400).json({ error: "Invalid request body or missing deviceInfo" });
    }

    // Gerekli cihaz bilgileri kontrolü
    const requiredFields = ["deviceId", "ipAddress"];
    const missingFields = requiredFields.filter((field) => !deviceInfoData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing device information",
        missingFields,
      });
    }

    // Cihaz bilgisi objesini oluştur
    const deviceInfo = {
      computerName: deviceInfoData.computerName,
      deviceId: deviceInfoData.deviceId,
      productName: deviceInfoData.productName,
      numberOfCores: deviceInfoData.numberOfCores,
      systemMemoryInMegabytes: deviceInfoData.systemMemoryInMegabytes,
      username: deviceInfoData.username,
      locale: deviceInfoData.locale,
      macAddress: deviceInfoData.macAddress,
      osName: deviceInfoData.osName,
      ipAddress: deviceInfoData.ipAddress || clientIp,
      additionalInfo: deviceInfoData.additionalInfo || {},
    };

    // Header doğrulama
    const headersValid = verifySecureHeaders(req.headers, deviceInfo);
    if (!headersValid) {
      return res.status(403).json({
        error: "Security validation failed",
        message: "Device authentication failed.",
      });
    }

    // Cihaz bilgisini request nesnesine ekle
    req.deviceInfo = deviceInfo;

    // Banlı cihaz kontrolü
    const bannedDevice = await db.getBannedDevice(deviceInfo.deviceId, deviceInfo.ipAddress);

    if (bannedDevice) {
      console.log("Cihaz banlı olduğu için istek reddedildi");
      return res.status(403).json({
        error: "Device banned",
        message: bannedDevice.banReason || "Your account has been banned.",
      });
    }

    next();
  } catch (error) {
    console.error("Device authentication error:", error);
    console.error("Hata stack:", error.stack);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  deviceAuthMiddleware,
  decryptData,
};
