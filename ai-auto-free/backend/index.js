const express = require("express");
const cors = require("cors");
const fsPromises = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const db = require("./database/db");
const { authenticateToken, createToken: createUserInfoToken } = require("./middleware/auth");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const adminRoutes = require("./routes/admin"); // Admin rotalarını içe aktarıyoruz
const { deviceAuthMiddleware, decryptData } = require("./middleware/deviceAuth"); // Cihaz doğrulama middleware'i ve decryptData
const { ref, get, update } = require("firebase/database");
// Telegram log servisi
const telegramLog = require("./services/telegramService");
// assignAccount için özel rate limiter
const assignAccountLimiter = rateLimit({
  windowMs: 180 * 60 * 1000, // 180 dakika
  max: 5, // Her IP için 180 dakikada maksimum istek
  message: "You are trying to get too many accounts in a short period of time.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user.uuid,
  skip: (req, res) => false, // Hiçbir isteği atlamıyoruz
  handler: (req, res) => {
    res.status(429).json({
      error: "You are trying to get too many accounts in a short period of time.",
      limitReached: true,
    });
  },
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Middleware ayarları
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(deviceAuthMiddleware); // Cihaz doğrulama middleware'i
app.use(
  session({
    secret: "6EiJPIcsnrdKPe0",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 yıl
    },
  })
);

// MIME tiplerini belirleyen yardımcı fonksiyon
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    ".py": "text/x-python",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

// Dosya hash'ini hesaplayan yardımcı fonksiyon
async function calculateFileHash(filePath) {
  try {
    const fileContent = await fsPromises.readFile(filePath);
    return crypto.createHash("sha256").update(fileContent).digest("hex");
  } catch (error) {
    throw new Error("Error calculating file hash");
  }
}

// Dosyanın hash'ini döndüren endpoint
app.get("/api/hash/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "codes", filename);

    const hash = await calculateFileHash(filePath);
    res.json({ hash });
  } catch (error) {
    res.status(404).json({ error: "File not found or hash calculation failed" });
  }
});

// Hash ile dosyayı döndüren endpoint
app.get("/api/file/:hash", async (req, res) => {
  try {
    const requestedHash = req.params.hash;
    const codesDir = path.join(__dirname, "codes");
    const files = await fsPromises.readdir(codesDir);

    for (const file of files) {
      const filePath = path.join(codesDir, file);
      const fileHash = await calculateFileHash(filePath);

      if (fileHash === requestedHash) {
        const mimeType = getMimeType(file);
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Content-Disposition", `attachment; filename=${file}`);
        const fileStream = await fsPromises.readFile(filePath);
        return res.send(fileStream);
      }
    }

    res.status(404).json({ error: "No file found with this hash" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Servisleri döndüren endpoint
app.get("/api/services", async (req, res) => {
  try {
    const services = await db.getServices();
    const notifications = await db.getNotifications();
    const poolAccountCounts = await db.getPoolAccountsCountByFeature();

    // Günlük giriş istatistiğini artır
    await db.incrementDailyLoginCount();

    // Bugünün giriş sayısını al
    const dailyLoginCount = await db.getDailyLoginCount();

    // Servislere notifications bilgisini ekle
    services.notifications = notifications;

    // Günlük giriş sayısını ekle
    services.dailyLoginCount = dailyLoginCount;

    // Her feature için havuzdaki hesap sayısını ekle
    if (services.features && services.features.length > 0) {
      services.features = services.features.map((feature) => {
        const featureKey = feature.nameKey;
        feature.poolAccountCount = poolAccountCounts[featureKey] || 0;
        return feature;
      });
    }

    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Services data could not be retrieved" });
  }
});

// Fiyatlandırma bilgilerini döndüren endpoint
app.get("/api/pricing", async (req, res) => {
  try {
    const pricing = await db.getPricing();

    if (!pricing) {
      // Eğer veritabanında yoksa, dosyadan oku
      const pricingPath = path.join(__dirname, "pricing.json");
      const pricingData = JSON.parse(await fsPromises.readFile(pricingPath, "utf8"));
      res.json(pricingData);
    } else {
      res.json(pricing);
    }
  } catch (error) {
    console.error("Fiyatlandırma bilgileri getirme hatası:", error);
    // Hata durumunda dosyadan okumayı dene
    try {
      const pricingPath = path.join(__dirname, "pricing.json");
      const pricingData = JSON.parse(await fsPromises.readFile(pricingPath, "utf8"));
      res.json(pricingData);
    } catch (fallbackError) {
      res.status(500).json({ error: "Pricing data could not be retrieved" });
    }
  }
});

// App Archive'ı döndüren endpoint
app.get("/api/check-update", async (req, res) => {
  try {
    const checkUpdate = await db.getCheckUpdate();

    if (!checkUpdate) {
      // Eğer veritabanında yoksa, dosyadan oku
      const checkUpdatePath = path.join(__dirname, "check-update.json");
      const checkUpdateData = JSON.parse(await fsPromises.readFile(checkUpdatePath, "utf8"));
      res.json(checkUpdateData);
    } else {
      res.json(checkUpdate);
    }
  } catch (error) {
    console.error("Güncelleme bilgileri getirme hatası:", error);
    // Hata durumunda dosyadan okumayı dene
    try {
      const checkUpdatePath = path.join(__dirname, "check-update.json");
      const checkUpdateData = JSON.parse(await fsPromises.readFile(checkUpdatePath, "utf8"));
      res.json(checkUpdateData);
    } catch (fallbackError) {
      res.status(500).json({ error: "Check update data could not be retrieved" });
    }
  }
});

// ID'den JWT token oluşturan endpoint
app.post("/api/auth", async (req, res) => {
  try {
    const { encryptedData } = req.body;

    if (!encryptedData) {
      return res.status(400).json({ error: "Encrypted data is required" });
    }

    // Şifrelenmiş veriyi çöz
    let decryptedData;
    try {
      decryptedData = decryptData(encryptedData);
    } catch (decryptError) {
      console.error("Şifre çözme hatası:", decryptError);
      // Şifre çözme hatası logla
      telegramLog.sendAdminLog("Şifre Çözme Hatası", `Hata: ${decryptError.message}\nEncrypted Data: ${encryptedData.substring(0, 100)}...`);
      return res.status(400).json({ error: "Invalid encrypted data" });
    }

    // Şifresi çözülmüş veriden uniqueId'yi al
    const { uniqueId } = decryptedData;

    if (!uniqueId) {
      return res.status(400).json({ error: "Need a uniqueId" });
    }

    try {
      // Kullanıcıyı kontrol et
      let user = await db.getUserByUuid(uniqueId);

      // Kullanıcı yoksa oluştur
      if (!user) {
        await db.createUser(uniqueId);
        // Yeni oluşturulan kullanıcı bilgilerini al
        user = await db.getUserByUuid(uniqueId);

        // Yeni kullanıcı oluşturulduğunu logla
        telegramLog.sendEntryLog("Yeni Kullanıcı Oluşturuldu", `UUID: ${uniqueId}\nKredi: ${user.credits}`);
      } else {
        // Mevcut kullanıcı girişini logla
        telegramLog.sendEntryLog("Kullanıcı Girişi", `UUID: ${uniqueId}\nKredi: ${user.credits}`);
      }

      // Token oluştur
      const token = createUserInfoToken(user);

      res.json({
        token,
        user: {
          id: user.uuid,
          credits: user.credits,
        },
      });
    } catch (dbError) {
      console.error("Veritabanı hatası:", dbError);
      // Veritabanı hatasını logla
      telegramLog.sendAdminLog("Veritabanı Hatası - Auth", `UUID: ${uniqueId}\nHata: ${dbError.message}`);
      res.status(500).json({ error: "Database error" });
    }
  } catch (error) {
    console.error("Auth hatası:", error);
    // Genel hata durumunu logla
    telegramLog.sendAdminLog("Genel Auth Hatası", `Hata: ${error.message}\nStack: ${error.stack}`);
    res.status(500).json({ error: "Server error" });
  }
});

// Kullanıcı bilgilerini döndüren ve token yenileyen endpoint
app.post("/api/user", authenticateToken, async (req, res) => {
  try {
    let deviceInfoFromClient = null;
    const { encryptedData } = req.body || {};

    // Şifreli veri varsa çözülür
    if (encryptedData) {
      try {
        const decryptedData = decryptData(encryptedData);
        deviceInfoFromClient = decryptedData.deviceInfo || null;
      } catch (decryptError) {
        console.error("Kullanıcı verisini çözme hatası:", decryptError);
        console.error("Hatalı veri:", encryptedData);
        // Şifre çözme hatasını logla
        telegramLog.sendAdminLog("Kullanıcı Verisi Çözme Hatası", `UserID: ${req.user?.uuid || "Bilinmiyor"}\nHata: ${decryptError.message}`);
        // Şifre çözme hatası olsa bile devam et, sadece log al
        return res.status(400).json({ error: "Invalid data" });
      }
    }

    // Cihaz bilgileri ya middleware'den ya da şifreli veriden gelmiş olabilir
    const deviceInfo = deviceInfoFromClient || req.deviceInfo;

    // Cihaz bilgileri varsa ve kullanıcı bilgileri mevcutsa
    if (deviceInfo && req.user && req.user.uuid) {
      // Kullanıcının cihazının banlı olup olmadığını kontrol et
      const bannedDevice = await db.getBannedDevice(deviceInfo.deviceId, deviceInfo.ipAddress);

      // Eğer cihaz banlı ise 403 hatası döndür
      if (bannedDevice) {
        console.log("Cihaz banlı olduğu için erişim reddedildi");
        // Banlı cihaz erişim girişimini logla
        telegramLog.sendAdminLog("Banlı Cihaz Erişim Girişimi", `UserID: ${req.user.uuid}\nDeviceID: ${deviceInfo.deviceId}\nIP: ${deviceInfo.ipAddress}\nBan Nedeni: ${bannedDevice.banReason || "Belirtilmemiş"}`);
        return res.status(403).json({
          error: "Device banned",
          message: bannedDevice.banReason || "Your account has been banned.",
        });
      }

      // Sadece cihaz bilgisini ekle
      if (!req.user.deviceInfo) {
        const userRef = ref(db.rtdb, `users/${req.user.uuid}`);

        // Cihaz bilgisini temizle (undefined değerleri kaldır)
        const deviceInfoCleaned = {};
        Object.keys(deviceInfo).forEach((key) => {
          if (deviceInfo[key] !== undefined) {
            deviceInfoCleaned[key] = deviceInfo[key];
          }
        });

        // Sadece cihaz bilgisini ekle
        const updates = {
          deviceInfo: deviceInfoCleaned,
        };

        // Kullanıcı verisini güncelle (krediye dokunmadan)
        await update(userRef, updates);

        // Cihaz bilgisi güncellendiğini logla
        telegramLog.sendEntryLog("Kullanıcı Cihaz Bilgisi Güncellendi", `UserID: ${req.user.uuid}\nCihaz: ${deviceInfoCleaned.deviceModel || deviceInfoCleaned.deviceId || "Bilinmiyor"}`);
      }
    } else {
      console.log("Cihaz bilgisi bulunamadı veya eksik. User:", req.user?.uuid, "DeviceInfo:", deviceInfo);
    }

    // Yeni token oluştur (1 günlük)
    const newToken = createUserInfoToken(req.user);

    // Yeni token'ı response header'a ekle
    res.setHeader("New-Token", newToken);

    // Başarılı kullanıcı girişini logla
    const deviceModel = deviceInfo?.deviceModel || deviceInfo?.deviceId || "Bilinmiyor";

    telegramLog.sendEntryLog(
      "Kullanıcı Girişi",
      `UserID: ${req.user.uuid}
IP: ${deviceInfo?.ipAddress}
Cihaz: ${deviceModel}
Kredi: ${req.user.credits}`
    );

    // Başarılı yanıt
    res.json({
      success: true,
      user: {
        id: req.user.uuid,
        credits: req.user.credits,
      },
    });
  } catch (error) {
    console.error("Kullanıcı bilgisi güncelleme hatası:", error);
    console.error("Hata stack:", error.stack);
    // Hatayı logla
    telegramLog.sendAdminLog("Kullanıcı Bilgisi Güncelleme Hatası", `UserID: ${req.user?.uuid || "Bilinmiyor"}\nHata: ${error.message}\nStack: ${error.stack}`);
    res.status(500).json({ error: "Server error" });
  }
});

// Feature işleme endpoint'i
app.post("/api/processFeature", authenticateToken, async (req, res) => {
  try {
    let featureName, data;
    const { encryptedData } = req.body || {};

    // Şifreli veri varsa çöz, yoksa doğrudan req.body'den al
    if (encryptedData) {
      try {
        const decryptedData = decryptData(encryptedData);
        featureName = decryptedData.featureName;
        data = decryptedData.data;
      } catch (decryptError) {
        console.error("Şifre çözme hatası:", decryptError);
        console.error("Hatalı veri:", encryptedData);
        // Şifre çözme hatasını logla
        telegramLog.sendAdminLog("Feature İşleme - Şifre Çözme Hatası", `UserID: ${req.user.uuid}\nHata: ${decryptError.message}`);
        return res.status(400).json({ error: "Invalid encrypted data" });
      }
    } else {
      // Şifreli veri yok, doğrudan req.body'den al
      featureName = req.body.featureName;
      data = req.body.data;
    }

    // Feature name kontrolü
    if (!featureName) {
      return res.status(400).json({ error: "Feature name is required" });
    }

    try {
      // Servis bilgilerini al
      const services = await db.getServices();

      // Önce tüm feature'ların addon'larında ara
      let foundFeature = null;
      let foundAddon = null;
      let requiredCredits = null;

      for (const feature of services.features) {
        // Önce feature'ın kendisini kontrol et
        if (feature.nameKey === featureName) {
          foundFeature = feature;
          requiredCredits = feature.credit;
          break;
        }

        // Sonra addon'u kontrol et (tekil addon objesi)
        if (feature.addon && typeof feature.addon === "object") {
          if (feature.addon.nameKey === featureName) {
            foundFeature = feature;
            foundAddon = feature.addon;
            requiredCredits = feature.addon.credit;
            break;
          }
        }
      }

      if (!foundFeature && !foundAddon) {
        // Feature bulunamadığını logla
        telegramLog.sendAdminLog("Feature Bulunamadı", `UserID: ${req.user.uuid}\nAranan Feature: ${featureName}`);
        return res.status(404).json({ error: "Feature or addon not found" });
      }

      // Eğer kredi değeri tanımlı ve 0'dan büyükse kontrol et
      if (requiredCredits > 0) {
        // Kullanıcının kredisini kontrol et
        if (req.user.credits < requiredCredits) {
          // Yetersiz kredi durumunu logla
          telegramLog.sendAdminLog("Yetersiz Kredi - Feature İşleme", `UserID: ${req.user.uuid}\nFeature: ${featureName}\nGerekli Kredi: ${requiredCredits}\nMevcut Kredi: ${req.user.credits}`);
          return res.status(403).json({ error: "Insufficient credits" });
        }
      }

      // Yeni hesap oluştur
      await db.addAccount(req.user.uuid, featureName, data);

      // Eğer kredi değeri varsa düşür
      if (requiredCredits > 0) {
        // Kullanıcının kredisini düşür
        await db.updateUserCredits(req.user.uuid, req.user.credits - requiredCredits);

        // Kredi düşme işlemini logla
        telegramLog.sendUsageLog("Kredi Kullanımı - Feature İşleme", `UserID: ${req.user.uuid}\nFeature: ${featureName}\nKullanılan Kredi: ${requiredCredits}\nKalan Kredi: ${req.user.credits - requiredCredits}`);
      }

      // Feature kullanımını logla
      telegramLog.sendUsageLog("Feature İşleme", `UserID: ${req.user.uuid}\nFeature: ${featureName}\nData: ${JSON.stringify(data, null, 2)}`);

      // Yeni token oluştur (güncel kredi bilgisiyle)
      const updatedUser = await db.getUserByUuid(req.user.uuid);
      const newToken = createUserInfoToken(updatedUser);
      res.setHeader("New-Token", newToken);

      res.sendStatus(200);
    } catch (dbError) {
      console.error("Veritabanı hatası:", dbError);
      // Veritabanı hatasını logla
      telegramLog.sendAdminLog("Veritabanı Hatası - Feature İşleme", `UserID: ${req.user.uuid}\nFeature: ${featureName}\nHata: ${dbError.message}`);
      res.status(500).json({ error: "Database error" });
    }
  } catch (error) {
    console.error("İşlem hatası:", error);
    // Genel hatayı logla
    telegramLog.sendAdminLog("Genel Hata - Feature İşleme", `UserID: ${req.user?.uuid || "Bilinmiyor"}\nHata: ${error.message}\nStack: ${error.stack}`);
    res.status(500).json({ error: "Server error" });
  }
});

// Hesap atama endpoint'i
app.post("/api/assignAccount", authenticateToken, assignAccountLimiter, async (req, res) => {
  try {
    const { featureName } = req.body;

    // Feature name kontrolü
    if (!featureName) {
      return res.status(400).json({ error: "Need a feature name" });
    }

    // Servis bilgilerini Realtime Database'den al
    const services = await db.getServices();

    // Önce tüm feature'ların addon'larında ara
    let foundFeature = null;
    let foundAddon = null;
    let requiredCredits = null;

    for (const feature of services.features) {
      // Önce feature'ın kendisini kontrol et
      if (feature.nameKey === featureName) {
        foundFeature = feature;
        requiredCredits = feature.credit;
        break;
      }

      // Sonra addon'u kontrol et (tekil addon objesi)
      if (feature.addon && typeof feature.addon === "object") {
        if (feature.addon.nameKey === featureName) {
          foundFeature = feature;
          foundAddon = feature.addon;
          requiredCredits = feature.addon.credit;
          break;
        }
      }
    }

    if (!foundFeature && !foundAddon) {
      // Feature bulunamadığını logla
      telegramLog.sendAdminLog("Feature Bulunamadı - Hesap Atama", `UserID: ${req.user.uuid}\nAranan Feature: ${featureName}`);
      return res.status(404).json({ error: "Feature or addon not found" });
    }

    // Eğer kredi değeri tanımlı ve 0'dan büyükse kontrol et
    if (requiredCredits > 0) {
      // Kullanıcının kredisini kontrol et
      if (req.user.credits < requiredCredits) {
        // Yetersiz kredi durumunu logla
        telegramLog.sendAdminLog("Yetersiz Kredi - Hesap Atama", `UserID: ${req.user.uuid}\nFeature: ${featureName}\nGerekli Kredi: ${requiredCredits}\nMevcut Kredi: ${req.user.credits}`);
        return res.status(403).json({ error: "Insufficient credits" });
      }

      // Kullanıcının kredisini düşür
      await db.updateUserCredits(req.user.uuid, req.user.credits - requiredCredits);

      // Yeni token oluştur (güncel kredi bilgisiyle)
      const updatedUser = await db.getUserByUuid(req.user.uuid);
      const newToken = createUserInfoToken(updatedUser);
      res.setHeader("New-Token", newToken);
    }

    // Havuzdan tek bir kullanılabilir hesap al (feature'a göre)
    const account = await db.getSinglePoolAccountByFeature(featureName);

    if (!account) {
      // Kullanılabilir hesap bulunamadığını logla
      telegramLog.sendAdminLog("Kullanılabilir Hesap Bulunamadı", `UserID: ${req.user.uuid}\nFeature: ${featureName}`);
      return res.status(404).json({ error: "Available account not found" });
    }

    // Hesabı kullanıcıya ata (doğrudan hesap nesnesini kullanarak)
    const assignedAccount = await db.assignAccountToUser(req.user.uuid, account);

    // Hesap atama ve kredi kullanımı işlemini birlikte logla
    telegramLog.sendUsageLog(
      "Hesap Atama",
      `UserID: ${req.user.uuid}
Feature: ${featureName}
Hesap: ${assignedAccount.email}
${
  requiredCredits > 0
    ? `Kullanılan Kredi: ${requiredCredits}
Kalan Kredi: ${req.user.credits - requiredCredits}`
    : "Kredi Kullanılmadı"
}`
    );

    // Başarılı yanıt
    res.json({
      success: true,
      account: {
        password: assignedAccount.password,
        token: assignedAccount.token,
        email: assignedAccount.email,
        created_at: assignedAccount.created_at || assignedAccount.assigned_at,
        // Windsurf hesapları için apiKey ve refreshToken bilgilerini de ekle
        ...(assignedAccount.apiKey && { apiKey: assignedAccount.apiKey }),
        ...(assignedAccount.refreshToken && { refreshToken: assignedAccount.refreshToken }),
      },
      // Kalan istek sayısını da ekle
      remainingRequests: Math.max(0, 2 - req.rateLimit.current),
    });
  } catch (error) {
    console.error("Hesap atama hatası:", error);
    // Hesap atama hatasını logla
    telegramLog.sendAdminLog("Hesap Atama Hatası", `UserID: ${req.user?.uuid || "Bilinmiyor"}\nFeature: ${req.body?.featureName || "Bilinmiyor"}\nHata: ${error.message}\nStack: ${error.stack}`);
    res.status(500).json({ error: "An error occurred while assigning account", details: error.message });
  }
});

// Cihaz banlama endpoint'i (sadece admin kullanımı için)
app.post("/admin/ban-device", authenticateToken, async (req, res) => {
  try {
    // Admin yetkisi kontrolü
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Yetkiniz yok" });
    }

    const { deviceId, macAddress, banReason } = req.body;

    if (!deviceId && !macAddress) {
      return res.status(400).json({ error: "deviceId veya macAddress gerekli" });
    }

    const deviceInfo = {
      deviceId: deviceId || "unknown",
      macAddress: macAddress || "unknown",
      ipAddress: req.body.ipAddress || "unknown",
      additionalInfo: req.body.additionalInfo || {},
    };

    const bannedDevice = await db.addBannedDevice(deviceInfo, banReason || "Sistem tarafından engellendi");

    // Cihaz banlama işlemini logla
    telegramLog.sendAdminLog("Cihaz Banlandı", `Admin: ${req.user.uuid}\nDeviceID: ${deviceInfo.deviceId}\nMAC: ${deviceInfo.macAddress}\nIP: ${deviceInfo.ipAddress}\nSebep: ${banReason || "Sistem tarafından engellendi"}`);

    res.json({ success: true, bannedDevice });
  } catch (error) {
    console.error("Cihaz banlama hatası:", error);
    // Cihaz banlama hatasını logla
    telegramLog.sendAdminLog("Cihaz Banlama Hatası", `Admin: ${req.user.uuid}\nHata: ${error.message}`);
    res.status(500).json({ error: "Cihaz banlama işlemi başarısız oldu" });
  }
});

// Banlanmış cihazları listeleme endpoint'i (sadece admin kullanımı için)
app.get("/admin/banned-devices", authenticateToken, async (req, res) => {
  try {
    // Admin yetkisi kontrolü
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Yetkiniz yok" });
    }

    const devices = await db.getAllBannedDevices();

    res.json({ devices });
  } catch (error) {
    console.error("Banlanmış cihazları listeleme hatası:", error);
    res.status(500).json({ error: "Banlanmış cihazları listeleme işlemi başarısız oldu" });
  }
});

// Ban kaldırma endpoint'i (sadece admin kullanımı için)
app.post("/admin/unban-device/:id", authenticateToken, async (req, res) => {
  try {
    // Admin yetkisi kontrolü
    if (!req.user.isAdmin) {
      // Yetkisiz erişim girişimini logla
      telegramLog.sendAdminLog("Yetkisiz Admin İşlemi - Ban Kaldırma", `UserID: ${req.user.uuid}\nCihaz ID: ${req.params.id}`);
      return res.status(403).json({ error: "Yetkiniz yok" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Geçerli bir cihaz ID'si gerekli" });
    }

    await db.removeBannedDevice(id);

    // Ban kaldırma işlemini logla
    telegramLog.sendAdminLog("Cihaz Banı Kaldırıldı", `Admin: ${req.user.uuid}\nCihaz ID: ${id}`);

    res.json({ success: true, message: "Cihaz banı kaldırıldı" });
  } catch (error) {
    console.error("Ban kaldırma hatası:", error);
    // Ban kaldırma hatasını logla
    telegramLog.sendAdminLog("Ban Kaldırma Hatası", `Admin: ${req.user.uuid}\nCihaz ID: ${req.params.id}\nHata: ${error.message}`);
    res.status(500).json({ error: "Ban kaldırma işlemi başarısız oldu" });
  }
});

// Bildirim gönderen endpoint
app.post("/api/notify", authenticateToken, async (req, res) => {
  try {
    const { message, details } = req.body;

    // Mesaj kontrolü
    if (!message) {
      return res.status(400).json({ error: "Need a message" });
    }

    // Telegram bildirim servisini kullan
    const result = await telegramLog.sendNotificationLog(message, details || null);

    if (result) {
      res.json({ success: true, message: "Notification sent successfully" });
    } else {
      // Başarısız olduğunda
      throw new Error("Telegram mesaj gönderme başarısız");
    }
  } catch (error) {
    console.error("Bildirim gönderme hatası:", error);
    // Hatayı admin kanalına logla
    telegramLog.sendAdminLog("Bildirim Gönderme Hatası", `UserID: ${req.user?.uuid || "Bilinmiyor"}\nHata: ${error.message}`);

    res.status(500).json({ error: "Notification sending failed" });
  }
});

// Gift kodu oluşturma endpoint'i
app.post("/api/createGiftCode", authenticateToken, async (req, res) => {
  try {
    const { encryptedData } = req.body;

    if (!encryptedData) {
      return res.status(400).json({ error: "Encrypted data is required" });
    }

    // Şifrelenmiş veriyi çöz
    let decryptedData;
    try {
      decryptedData = decryptData(encryptedData);
    } catch (decryptError) {
      console.error("Şifre çözme hatası:", decryptError);
      telegramLog.sendAdminLog("Gift Kod Şifre Çözme Hatası", `UserID: ${req.user?.uuid || "Bilinmiyor"}\nHata: ${decryptError.message}`);
      return res.status(400).json({ error: "Invalid encrypted data" });
    }

    // Gerekli verilerin varlığını kontrol et
    const { userId, credits } = decryptedData;

    if (!userId || !credits || credits <= 0) {
      return res.status(400).json({ error: "Valid userId and credits are required" });
    }

    // Kredinin sayısal olduğundan emin olalım
    const safeCredits = Math.floor(Number(credits));
    if (isNaN(safeCredits) || safeCredits <= 0) {
      return res.status(400).json({ error: "Credits must be a positive number" });
    }

    // Kullanıcı ID'sinin istek yapan kullanıcıyla eşleştiğini kontrol et
    if (userId !== req.user.uuid) {
      telegramLog.sendAdminLog("Gift Kod - Yetkisiz İşlem", `RequestUserID: ${req.user.uuid}\nRequestedUserID: ${userId}`);
      return res.status(403).json({ error: "You can only create gift codes for your own account" });
    }

    // Kullanıcının yeterli kredisi var mı kontrol et
    const currentCredits = req.user.credits || 0;
    if (currentCredits < safeCredits) {
      return res.status(403).json({ error: "Insufficient credits", credits: currentCredits });
    }

    // Gift kodu oluştur (şimdi userId de gönderiyoruz)
    const giftCode = await db.createGiftCode(req.user.uuid, safeCredits);

    // Kullanıcının kredisini düşür
    const newCredits = currentCredits - safeCredits;
    await db.updateUserCredits(req.user.uuid, newCredits);

    // İşlemi logla
    telegramLog.sendUsageLog(
      "Gift Kod Oluşturuldu",
      `UserID: ${req.user.uuid}
Kod: ${giftCode}
Kredi: ${safeCredits}
Kalan Kredi: ${newCredits}`
    );

    // Yeni token oluştur (güncel kredi bilgisiyle)
    const updatedUser = await db.getUserByUuid(req.user.uuid);
    const newToken = createUserInfoToken(updatedUser);
    res.setHeader("New-Token", newToken);

    // Başarılı yanıt
    res.json({
      success: true,
      giftCode,
      remainingCredits: newCredits,
    });
  } catch (error) {
    console.error("Gift kodu oluşturma hatası:", error);
    telegramLog.sendAdminLog("Gift Kod Oluşturma Hatası", `UserID: ${req.user?.uuid || "Bilinmiyor"}\nHata: ${error.message}`);
    res.status(500).json({ error: "Gift code creation failed", message: error.message });
  }
});

// Gift kodu kullanma endpoint'i
app.post("/api/redeemGiftCode", authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Gift code is required" });
    }

    // Kodu doğrula ve kredi miktarını al
    const result = await db.redeemGiftCode(code);

    // result artık obje olarak dönüyor
    const credits = result.credits;
    const createdBy = result.createdBy;

    // Number kontrolü ekleyelim
    if (isNaN(credits)) {
      throw new Error("Invalid credit value");
    }

    // Kredinin tam sayı olduğundan emin olalım
    const safeCredits = Math.floor(Number(credits));

    // Kullanıcının kredisini artır
    const currentCredits = req.user.credits || 0;
    const newTotalCredits = currentCredits + safeCredits;

    await db.updateUserCredits(req.user.uuid, newTotalCredits);

    // İşlemi logla
    telegramLog.sendUsageLog(
      "Gift Kod Kullanıldı",
      `UserID: ${req.user.uuid}
Kod: ${code}
Oluşturan: ${createdBy || "unknown"}
Kredi: ${safeCredits}
Yeni Toplam Kredi: ${newTotalCredits}`
    );

    // Yeni token oluştur (güncel kredi bilgisiyle)
    const updatedUser = await db.getUserByUuid(req.user.uuid);
    const newToken = createUserInfoToken(updatedUser);
    res.setHeader("New-Token", newToken);

    // Başarılı yanıt
    res.json({
      success: true,
      creditsAdded: safeCredits,
      totalCredits: newTotalCredits,
    });
  } catch (error) {
    console.error("Gift kodu kullanma hatası:", error);
    res.status(400).json({ error: "Gift code redemption failed", message: error.message });
  }
});

// Admin rotalarını kullan
app.use("/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`API is running on port ${PORT}`);
});
