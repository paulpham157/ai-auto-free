const express = require("express");
const router = express.Router();
const db = require("../database/db");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { doc, getDoc, setDoc, updateDoc, arrayUnion } = require("firebase/firestore");
const telegramLog = require("../services/telegramService"); // Telegram log servisi

// Oturum süresini kontrol eden middleware
const checkSessionTimeout = (req, res, next) => {
  // Cookie kontrolü
  if (req.cookies) {
    const hashedPassword = req.cookies.adminPassword;
    if (hashedPassword && hashedPassword === hashPassword("6EiJPIcsnrdKPe0")) {
      // Cookie varsa oturumu başlat
      req.session.loggedIn = true;
      req.session.loginTime = Date.now();
      return next();
    }
  }

  // Oturum kontrolü
  if (!req.session || !req.session.loggedIn) {
    console.log("Oturum bulunamadı veya geçersiz.");
    return res.status(401).json({ error: "Unauthorized access" });
  }
  next();
};

// Şifre hash fonksiyonu
function hashPassword(password) {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(password).digest("hex");
}

// HTML şablonlarını okuma fonksiyonu
function readHtmlTemplate(templateName) {
  const filePath = path.join(__dirname, "..", "views", "admin", `${templateName}.html`);
  return fs.readFileSync(filePath, "utf8");
}

// Admin giriş sayfası
router.get("/", (req, res) => {
  // Cookie kontrolü
  if (req.cookies) {
    const hashedPassword = req.cookies.adminPassword;
    if (hashedPassword && hashedPassword === hashPassword("6EiJPIcsnrdKPe0")) {
      // Cookie varsa doğrudan dashboard'a yönlendir
      return res.redirect("/admin/dashboard");
    }
  }

  const loginTemplate = readHtmlTemplate("login");
  res.send(loginTemplate);
});

// Giriş işlemi
router.post("/login", (req, res) => {
  const password = req.body.password;
  if (password === "6EiJPIcsnrdKPe0") {
    req.session.loggedIn = true;
    req.session.loginTime = Date.now();

    // Şifreyi hash'le
    const hashedPassword = hashPassword(password);

    // Admin için JWT token oluştur
    const jwt = require("jsonwebtoken");

    // Private key'i oku
    const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, "..", "private.pem"), "utf8");

    // Admin token'ı oluştur
    const adminToken = jwt.sign(
      {
        id: "admin",
        isAdmin: true,
        timestamp: Date.now(),
      },
      PRIVATE_KEY,
      {
        algorithm: "RS256",
        expiresIn: "24h", // 24 saat geçerli
      }
    );

    // Oturum bilgisinin kaydedildiğinden emin olmak için
    req.session.save((err) => {
      if (err) {
        console.error("Oturum kaydedilirken hata oluştu:", err);
        return res.status(500).send("Oturum başlatılırken bir hata oluştu.");
      }

      console.log("Oturum başarıyla kaydedildi:", req.session.loggedIn);

      // Admin token'ını cookie olarak da gönder
      res.cookie("adminToken", adminToken, {
        httpOnly: false, // JavaScript ile erişilebilir olmalı
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production", // Üretim ortamında HTTPS gerektirir
        path: "/", // Tüm yollar için geçerli
      });

      // Hash'lenmiş şifreyi cookie olarak gönder
      res.cookie("adminPassword", hashedPassword, {
        httpOnly: true, // JavaScript ile erişilemez olmalı
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production", // Üretim ortamında HTTPS gerektirir
        path: "/", // Tüm yollar için geçerli
      });

      res.redirect("/admin/dashboard");
    });
  } else {
    const errorTemplate = readHtmlTemplate("error");
    res.status(401).send(errorTemplate);
  }
});

// Dashboard sayfası
router.get("/dashboard", checkSessionTimeout, (req, res) => {
  // Oturum kontrolü
  console.log("Oturum durumu:", req.session.loggedIn, "Oturum ID:", req.sessionID);

  if (!req.session.loggedIn) {
    console.log("Dashboard erişimi reddedildi: Oturum yok");
    return res.redirect("/admin");
  }

  const dashboardTemplate = readHtmlTemplate("dashboard");
  res.send(dashboardTemplate);
});

// Özellikleri getirme
router.get("/features", checkSessionTimeout, async (req, res) => {
  try {
    if (!req.session || !req.session.loggedIn) {
      console.log("Yetkisiz erişim denemesi: /features");
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const services = await db.getServices();
    res.json({ features: services.features });
  } catch (error) {
    console.error("Özellikler getirme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Bildirimleri getirme
router.get("/notifications", checkSessionTimeout, async (req, res) => {
  try {
    if (!req.session || !req.session.loggedIn) {
      console.log("Yetkisiz erişim denemesi: /notifications");
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const notifications = await db.getNotifications();
    res.json(notifications);
  } catch (error) {
    console.error("Bildirimler getirme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Bildirim ekleme
router.post("/notifications/add", checkSessionTimeout, async (req, res) => {
  try {
    if (!req.session || !req.session.loggedIn) {
      console.log("Yetkisiz erişim denemesi: /notifications/add");
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const { message } = req.body;

    if (!message || !message.tr || !message.en) {
      return res.status(400).json({ error: "Notification message is required (tr and en languages)" });
    }

    const notification = {
      message,
    };

    const result = await db.addNotification(notification);
    res.json({ success: true, notification: result });
  } catch (error) {
    console.error("Bildirim ekleme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Bildirim güncelleme
router.post("/notifications/update", checkSessionTimeout, async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const { id, message } = req.body;

    if (!id || !message) {
      return res.status(400).json({ error: "Notification ID and message are required" });
    }

    const result = await db.updateNotification(parseInt(id), { message });
    res.json({ success: true, notification: result });
  } catch (error) {
    console.error("Bildirim güncelleme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Bildirim silme
router.post("/notifications/delete", checkSessionTimeout, async (req, res) => {
  try {
    if (!req.session || !req.session.loggedIn) {
      console.log("Yetkisiz erişim denemesi: /notifications/delete");
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Notification ID is required" });
    }

    await db.deleteNotification(parseInt(id));
    res.json({ success: true });
  } catch (error) {
    console.error("Bildirim silme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Servis bilgilerini getirme
router.get("/services", checkSessionTimeout, async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const services = await db.getServices();
    const notifications = await db.getNotifications();
    const poolAccountCounts = await db.getPoolAccountsCountByFeature();

    // Servislere notifications bilgisini ekle
    services.notifications = notifications;

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
    console.error("Servis bilgileri getirme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Servis bilgilerini güncelleme
router.post("/services/update", checkSessionTimeout, async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const services = req.body;

    if (!services || !services.features) {
      return res.status(400).json({ error: "Valid service information is required" });
    }

    const result = await db.updateServices(services);
    res.json({ success: true, services: result });
  } catch (error) {
    console.error("Servis bilgileri güncelleme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Fiyatlandırma bilgilerini getirme
router.get("/pricing", checkSessionTimeout, async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const pricing = await db.getPricing();
    res.json(pricing || {});
  } catch (error) {
    console.error("Fiyatlandırma bilgileri getirme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Fiyatlandırma bilgilerini güncelleme
router.post("/pricing/update", checkSessionTimeout, async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const pricing = req.body;

    if (!pricing) {
      return res.status(400).json({ error: "Valid pricing information is required" });
    }

    const result = await db.updatePricing(pricing);
    res.json({ success: true, pricing: result });
  } catch (error) {
    console.error("Fiyatlandırma bilgileri güncelleme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Güncelleme bilgilerini getirme
router.get("/check-update", checkSessionTimeout, async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const checkUpdate = await db.getCheckUpdate();
    res.json(checkUpdate || {});
  } catch (error) {
    console.error("Güncelleme bilgileri getirme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Güncelleme bilgilerini güncelleme
router.post("/check-update/update", checkSessionTimeout, async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const checkUpdate = req.body;

    if (!checkUpdate) {
      return res.status(400).json({ error: "Valid update information is required" });
    }

    const result = await db.updateCheckUpdate(checkUpdate);
    res.json({ success: true, checkUpdate: result });
  } catch (error) {
    console.error("Güncelleme bilgileri güncelleme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Kullanıcı arama işlemi
router.post("/search", checkSessionTimeout, async (req, res) => {
  try {
    const uuid = req.body.uuid;
    const user = await db.getUserByUuid(uuid);

    if (user) {
      // Kullanıcının cihaz bilgilerini kontrol et
      let isBanned = false;
      let banInfo = null;

      if (user.deviceInfo && (user.deviceInfo.deviceId || user.deviceInfo.ipAddress)) {
        // Cihazın banlı olup olmadığını kontrol et
        const bannedDevice = await db.getBannedDevice(user.deviceInfo.deviceId, user.deviceInfo.ipAddress);

        if (bannedDevice) {
          isBanned = true;
          banInfo = {
            reason: bannedDevice.banReason,
            date: bannedDevice.banDate,
            id: bannedDevice.id,
          };
        }
      }

      // Tam bir cihaz bilgisi nesnesi oluştur
      const deviceInfo = user.deviceInfo
        ? {
            // Mevcut tüm bilgileri aynen koru
            ...user.deviceInfo,
            // İstenen tüm alanların varlığından emin ol (eksik alanlar null olarak doldurulacak)
            deviceId: user.deviceInfo.deviceId || null,
            macAddress: user.deviceInfo.macAddress || null,
            computerName: user.deviceInfo.computerName || null,
            username: user.deviceInfo.username || null,
            ipAddress: user.deviceInfo.ipAddress || null,
            locale: user.deviceInfo.locale || null,
            osName: user.deviceInfo.osName || null,
            productName: user.deviceInfo.productName || null,
            numberOfCores: user.deviceInfo.numberOfCores || null,
            systemMemoryInMegabytes: user.deviceInfo.systemMemoryInMegabytes || null,
            model: user.deviceInfo.model || null,
          }
        : null;

      res.json({
        uuid: user.uuid,
        credits: user.credits,
        deviceInfo: deviceInfo,
        isBanned: isBanned,
        banInfo: banInfo,
      });
    } else {
      res.json({ error: "User not found!" });
    }
  } catch (error) {
    console.error("Arama hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Kredi güncelleme işlemi
router.post("/update", checkSessionTimeout, async (req, res) => {
  try {
    const { uuid, credits } = req.body;

    // Kullanıcının mevcut kredisini al
    const user = await db.getUserByUuid(uuid);
    const currentCredits = user ? user.credits : 0;
    const newCredits = parseInt(credits);

    // Kredi güncelleme
    await db.updateUserCredits(uuid, newCredits);

    // Kredi güncellemesini logla
    let logMsg = "Admin tarafından kredi güncellendi\n";

    if (uuid) logMsg += `UserID: ${uuid}\n`;
    if (currentCredits !== undefined) logMsg += `Eski Kredi: ${currentCredits}\n`;
    if (newCredits !== undefined) logMsg += `Yeni Kredi: ${newCredits}\n`;

    const difference = newCredits - currentCredits;
    if (!isNaN(difference)) logMsg += `Fark: ${difference}`;

    telegramLog.sendAdminLog("Kredi Güncelleme", logMsg);

    res.json({ success: true });
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Havuz hesaplarını getirme
router.get("/accounts/pool", checkSessionTimeout, (req, res) => {
  if (!req.session || !req.session.loggedIn) {
    console.log("Yetkisiz erişim denemesi: /accounts/pool");
    return res.status(401).json({ error: "Unauthorized access" });
  }

  db.getPoolAccounts()
    .then((accounts) => {
      // Şifreleri maskeleme, orijinal şekilde gönder
      res.json({
        accounts: accounts,
        totalCount: accounts.length,
      });
    })
    .catch((error) => {
      console.error("Havuz hesapları getirme hatası:", error);
      res.status(500).json({ error: "Server error" });
    });
});

// Özelliğe göre havuz hesaplarını getirme
router.get("/accounts/pool/by-feature/:featureKey", checkSessionTimeout, (req, res) => {
  if (!req.session || !req.session.loggedIn) {
    console.log("Yetkisiz erişim denemesi: /accounts/pool/by-feature");
    return res.status(401).json({ error: "Unauthorized access" });
  }

  const featureKey = req.params.featureKey;

  if (!featureKey) {
    return res.status(400).json({ error: "Feature key is required" });
  }

  db.getPoolAccountsByFeature(featureKey)
    .then((accounts) => {
      res.json({
        accounts: accounts,
        totalCount: accounts.length,
        featureKey: featureKey,
      });
    })
    .catch((error) => {
      console.error(`${featureKey} özelliğine ait hesapları getirme hatası:`, error);
      res.status(500).json({ error: "Server error" });
    });
});

// Aktif hesapları getirme
router.get("/accounts/active", checkSessionTimeout, (req, res) => {
  if (!req.session || !req.session.loggedIn) {
    console.log("Yetkisiz erişim denemesi: /accounts/active");
    return res.status(401).json({ error: "Unauthorized access" });
  }

  db.getActiveAccounts()
    .then((accounts) => {
      res.json({
        accounts: accounts,
        totalCount: accounts.length,
      });
    })
    .catch((error) => {
      console.error("Aktif hesapları getirme hatası:", error);
      res.status(500).json({ error: "Server error" });
    });
});

// Aktif hesapları CSV olarak indirme
router.get("/accounts/active/csv", checkSessionTimeout, (req, res) => {
  if (!req.session || !req.session.loggedIn) {
    console.log("Yetkisiz erişim denemesi: /accounts/active/csv");
    return res.status(401).json({ error: "Unauthorized access" });
  }

  db.getActiveAccounts()
    .then((accounts) => {
      // CSV başlık satırı - apiKey ve refreshToken alanlarını ekledim
      let csvContent = "Email,Token,FeatureKey,UserId,Password,ApiKey,RefreshToken,AssignedAt\n";

      // Her hesap için bir satır ekle
      accounts.forEach((account) => {
        const assignedDate = new Date(account.assigned_at).toISOString().split("T")[0]; // YYYY-MM-DD formatı

        // CSV için değerleri hazırla - özel karakterler için tırnak işaretleri kullan
        const email = escapeCsvValue(account.email);
        const token = escapeCsvValue(account.token || "");
        const featureKey = escapeCsvValue(account.featureKey);
        const userId = escapeCsvValue(account.userId);
        const password = escapeCsvValue(account.password || "");
        const apiKey = escapeCsvValue(account.apiKey || "");
        const refreshToken = escapeCsvValue(account.refreshToken || "");

        // CSV satırını oluştur
        csvContent += `${email},${token},${featureKey},${userId},${password},${apiKey},${refreshToken},${assignedDate}\n`;
      });

      // CSV dosyasını indir
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="active-accounts-${new Date().toISOString().split("T")[0]}.csv"`);
      res.send(csvContent);
    })
    .catch((error) => {
      console.error("Aktif hesapları CSV olarak indirme hatası:", error);
      res.status(500).json({ error: "Server error" });
    });
});

// CSV değerlerini kaçış karakterleriyle düzenleyen yardımcı fonksiyon
function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '""';
  }

  // String'e dönüştür
  const stringValue = String(value);

  // Eğer değer virgül, çift tırnak veya yeni satır içeriyorsa
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n") || stringValue.includes("\r")) {
    // Çift tırnakları iki çift tırnak yaparak kaçır ve tüm değeri çift tırnak içine al
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }

  // Özel karakter içermiyorsa yine de çift tırnak içine al
  return '"' + stringValue + '"';
}

// Aktif hesapları temizleme
router.post("/accounts/active/clear", checkSessionTimeout, async (req, res) => {
  if (!req.session || !req.session.loggedIn) {
    console.log("Yetkisiz erişim denemesi: /accounts/active/clear");
    return res.status(401).json({ error: "Unauthorized access" });
  }

  try {
    // Aktif hesapları doğrudan temizle
    const activeAccountsRef = doc(db.db, "accounts", "active");
    await setDoc(activeAccountsRef, { accounts: [] });

    res.json({ success: true, message: "All active accounts have been cleared" });
  } catch (error) {
    console.error("Aktif hesapları temizleme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Havuz hesabı ekleme
router.post("/accounts/add", checkSessionTimeout, (req, res) => {
  if (!req.session || !req.session.loggedIn) {
    console.log("Yetkisiz erişim denemesi: /accounts/add");
    return res.status(401).json({ error: "Unauthorized access" });
  }

  const { token, email, password, featureKey, apiKey, refreshToken } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Token, apiKey ve refreshToken opsiyonel olabilir
  db.addPoolAccount(null, token || "", email, password, featureKey, apiKey, refreshToken)
    .then(() => {
      // Hesap eklemeyi logla
      let logMsg = "";

      // Sadece değeri olan alanları ekle
      if (featureKey) logMsg += `Feature: ${featureKey}\n`;
      logMsg += `Email: ${email}\n`;
      logMsg += `Password: ${password}`;
      if (token) logMsg += `\nToken: ${token}`;
      if (apiKey) logMsg += `\nApiKey: ${apiKey}`;
      if (refreshToken) logMsg += `\nRefreshToken: ${refreshToken}`;

      telegramLog.sendAdminLog("Havuz Hesabı Eklendi", logMsg);
      res.json({ success: true });
    })
    .catch((error) => {
      console.error("Havuz hesabı ekleme hatası:", error);
      // Hata durumunu logla
      let logMsg = "";
      if (featureKey) logMsg += `Feature: ${featureKey}\n`;
      logMsg += `Email: ${email}\n`;
      logMsg += `Şifre: ${password}\n`;
      if (token) logMsg += `Token: ${token}\n`;
      if (apiKey) logMsg += `ApiKey: ${apiKey}\n`;
      if (refreshToken) logMsg += `RefreshToken: ${refreshToken}\n`;
      logMsg += `Hata: ${error.message}`;

      telegramLog.sendAdminLog("Havuz Hesabı Ekleme Hatası", logMsg);
      res.status(500).json({ error: "Server error" });
    });
});

// Çoklu havuz hesabı ekleme
router.post("/accounts/add-multiple", checkSessionTimeout, async (req, res) => {
  if (!req.session || !req.session.loggedIn) {
    console.log("Yetkisiz erişim denemesi: /accounts/add-multiple");
    return res.status(401).json({ error: "Unauthorized access" });
  }

  const { accounts } = req.body;

  if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
    return res.status(400).json({ error: "Valid account list is required" });
  }

  try {
    // Geçerli hesapları filtrele
    const validAccounts = [];
    const errors = [];

    for (const account of accounts) {
      const { token, email, password, featureKey, apiKey, refreshToken } = account;

      if (!email || !password) {
        errors.push(`Missing information: ${email || "Email is missing"}`);
        continue;
      }

      validAccounts.push({
        token: token || "",
        email,
        password,
        featureKey,
        ...(apiKey && { apiKey }),
        ...(refreshToken && { refreshToken }),
      });
    }

    if (validAccounts.length === 0) {
      return res.json({
        success: false,
        error: "No valid accounts to add",
        errors,
      });
    }

    // Tüm geçerli hesapları tek seferde ekle
    const addedCount = await db.addMultiplePoolAccounts(validAccounts);

    // Eklenen hesapları 6'lı gruplar halinde logla
    const ACCOUNTS_PER_LOG = 6;
    const totalGroups = Math.ceil(validAccounts.length / ACCOUNTS_PER_LOG);

    // Ana özet loglama
    let summaryLogMessage = `Toplu Havuz Hesabı Ekleme
Toplam: ${accounts.length}
Eklenen: ${addedCount}
Hatalı: ${errors.length}`;

    // Özet logu gönder
    telegramLog.sendAdminLog("Toplu Havuz Hesabı Eklendi", summaryLogMessage);

    // Hesapları 6'lı gruplar halinde logla
    for (let groupIndex = 0; groupIndex < totalGroups; groupIndex++) {
      const startIndex = groupIndex * ACCOUNTS_PER_LOG;
      const endIndex = Math.min(startIndex + ACCOUNTS_PER_LOG, validAccounts.length);
      const currentGroup = validAccounts.slice(startIndex, endIndex);

      let groupLogMessage = `Grup ${groupIndex + 1}/${totalGroups}:`;

      currentGroup.forEach((account, index) => {
        groupLogMessage += `\n\n#${startIndex + index + 1}`;
        if (account.featureKey) groupLogMessage += `\nFeature: ${account.featureKey}`;
        groupLogMessage += `\nEmail: ${account.email}`;
        groupLogMessage += `\nPassword: ${account.password}`;
        if (account.token) groupLogMessage += `\nToken: ${account.token}`;
        if (account.apiKey) groupLogMessage += `\nApiKey: ${account.apiKey}`;
        if (account.refreshToken) groupLogMessage += `\nRefreshToken: ${account.refreshToken}`;
      });

      // Grup logunu gönder
      telegramLog.sendAdminLog(`Havuz Hesapları (${groupIndex + 1}/${totalGroups})`, groupLogMessage);
    }

    // Hata varsa hataları da ayrı bir mesajda logla
    if (errors.length > 0) {
      let errorLogMessage = "Hatalı Hesaplar:";
      errors.forEach((error, index) => {
        errorLogMessage += `\n${index + 1}. ${error}`;
      });

      telegramLog.sendAdminLog("Havuz Hesabı Ekleme Hataları", errorLogMessage);
    }

    // Sonuçları döndür
    res.json({
      success: true,
      addedCount,
      totalCount: accounts.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Çoklu havuz hesabı ekleme hatası:", error);

    // Hata durumunda loglama
    let errorLogMsg = `Toplu Hesap Ekleme Hatası\n`;
    errorLogMsg += `Toplam: ${accounts?.length || 0}\n`;
    errorLogMsg += `Hata: ${error.message}`;

    telegramLog.sendAdminLog("Toplu Havuz Hesabı Ekleme Hatası", errorLogMsg);

    res.status(500).json({ error: "Server error" });
  }
});

// Havuz hesabı güncelleme
router.post("/accounts/update", checkSessionTimeout, (req, res) => {
  if (!req.session.loggedIn) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  const { id, token, email, password, featureKey, apiKey, refreshToken } = req.body;

  if (!id || !email || !password) {
    return res.status(400).json({ error: "ID, email and password are required" });
  }

  db.updatePoolAccount(id, token || "", email, password, featureKey, apiKey, refreshToken)
    .then(() => {
      // Hesap güncellendiğini logla
      let logMsg = `ID: ${id}\n`;
      if (featureKey) logMsg += `Feature: ${featureKey}\n`;
      logMsg += `Email: ${email}\n`;
      logMsg += `Password: ${password}`;
      if (token) logMsg += `\nToken: ${token}`;
      if (apiKey) logMsg += `\nApiKey: ${apiKey}`;
      if (refreshToken) logMsg += `\nRefreshToken: ${refreshToken}`;

      telegramLog.sendAdminLog("Havuz Hesabı Güncellendi", logMsg);

      res.json({ success: true });
    })
    .catch((error) => {
      console.error("Havuz hesabı güncelleme hatası:", error);

      // Hata durumunu detaylı logla
      let errorLogMsg = `Hesap Güncelleme Hatası\n`;
      errorLogMsg += `ID: ${id}\n`;
      if (featureKey) errorLogMsg += `Feature: ${featureKey}\n`;
      errorLogMsg += `Email: ${email}\n`;
      errorLogMsg += `Şifre: ${password}\n`;
      if (token) errorLogMsg += `Token: ${token}\n`;
      if (apiKey) errorLogMsg += `ApiKey: ${apiKey}\n`;
      if (refreshToken) errorLogMsg += `RefreshToken: ${refreshToken}\n`;
      errorLogMsg += `Hata: ${error.message}`;

      telegramLog.sendAdminLog("Havuz Hesabı Güncelleme Hatası", errorLogMsg);

      res.status(500).json({ error: "Server error" });
    });
});

// Havuz hesabı silme
router.post("/accounts/delete", checkSessionTimeout, (req, res) => {
  if (!req.session || !req.session.loggedIn) {
    console.log("Yetkisiz erişim denemesi: /accounts/delete");
    return res.status(401).json({ error: "Unauthorized access" });
  }

  const { id, featureKey } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Email is required" });
  }

  db.deletePoolAccount(id, featureKey)
    .then(() => {
      // Hesap silmeyi logla
      let logMsg = `ID: ${id}`;
      if (featureKey) logMsg += `\nFeature: ${featureKey}`;

      telegramLog.sendAdminLog("Havuz Hesabı Silindi", logMsg);

      res.json({ success: true });
    })
    .catch((error) => {
      console.error("Havuz hesabı silme hatası:", error);

      // Hata durumunu detaylı logla
      let errorLogMsg = `Hesap Silme Hatası\n`;
      errorLogMsg += `ID: ${id}\n`;
      if (featureKey) errorLogMsg += `Feature: ${featureKey}\n`;
      errorLogMsg += `Hata: ${error.message}`;

      telegramLog.sendAdminLog("Havuz Hesabı Silme Hatası", errorLogMsg);

      res.status(500).json({ error: "Server error" });
    });
});

// Belirli türdeki tüm havuz hesaplarını silme
router.post("/accounts/delete-by-type", checkSessionTimeout, async (req, res) => {
  if (!req.session || !req.session.loggedIn) {
    console.log("Yetkisiz erişim denemesi: /accounts/delete-by-type");
    return res.status(401).json({ error: "Unauthorized access" });
  }

  const { featureKey } = req.body;

  if (!featureKey) {
    return res.status(400).json({ error: "Account type (featureKey) is required" });
  }

  try {
    // Yeni eklediğimiz toplu silme fonksiyonunu kullan
    await db.deletePoolAccountsByFeature(featureKey);

    // Toplu silme işlemini logla
    let logMsg = "";
    if (featureKey) logMsg = `Feature: ${featureKey}`;

    telegramLog.sendAdminLog("Toplu Havuz Hesabı Silindi", logMsg);

    res.json({
      success: true,
      message: `${featureKey} türündeki tüm hesaplar başarıyla silindi`,
    });
  } catch (error) {
    console.error(`${featureKey} türündeki hesapları silme hatası:`, error);

    // Hata durumunu detaylı logla
    let errorLogMsg = `Toplu Hesap Silme Hatası\n`;
    errorLogMsg += `Feature: ${featureKey}\n`;
    errorLogMsg += `Hata: ${error.message}`;

    telegramLog.sendAdminLog("Toplu Havuz Hesabı Silme Hatası", errorLogMsg);

    // Hata mesajını kullanıcıya göster
    if (error.message.includes("bulunamadı")) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: "Server error" });
  }
});

// Çıkış yapma
router.get("/logout", (req, res) => {
  req.session.loggedIn = false;

  // Cookie'leri temizle
  res.clearCookie("adminToken");
  res.clearCookie("adminPassword");

  res.redirect("/admin");
});

// Hesabı aktif hesaplardan havuza taşıma
router.post("/accounts/release", checkSessionTimeout, async (req, res) => {
  if (!req.session || !req.session.loggedIn) {
    console.log("Yetkisiz erişim denemesi: /accounts/release");
    return res.status(401).json({ error: "Unauthorized access" });
  }

  const { id, token, apiKey, refreshToken } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Account ID is required" });
  }

  try {
    // Hesabı havuza taşı
    await db.releaseAccount(id);
    let logMsg = "";
    if (id) logMsg = `ID: ${id}`;

    telegramLog.sendAdminLog("Hesap Havuza Taşındı", logMsg);
    res.json({ success: true, message: "Account successfully released to pool" });
  } catch (error) {
    console.error("Account release to pool error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Oturum durumunu kontrol eden endpoint
router.get("/check-session", (req, res) => {
  // Cookie kontrolü
  if (req.cookies) {
    const hashedPassword = req.cookies.adminPassword;
    if (hashedPassword && hashedPassword === hashPassword("6EiJPIcsnrdKPe0")) {
      // Cookie varsa oturumu başlat
      req.session.loggedIn = true;
      req.session.loginTime = Date.now();

      return res.json({
        status: "active",
        sessionId: req.sessionID,
        loginTime: req.session.loginTime,
      });
    }
  }

  if (req.session && req.session.loggedIn) {
    res.json({
      status: "active",
      sessionId: req.sessionID,
      loginTime: req.session.loginTime,
    });
  } else {
    res.status(401).json({
      status: "inactive",
      sessionId: req.sessionID,
    });
  }
});

// Günlük giriş istatistiklerini getir
router.get("/stats/daily-logins", checkSessionTimeout, async (req, res) => {
  try {
    if (!req.session || !req.session.loggedIn) {
      console.log("Yetkisiz erişim denemesi: /stats/daily-logins");
      return res.status(401).json({ error: "Unauthorized access" });
    }

    // Bugünün tarihini YYYY-MM-DD formatında al
    const today = new Date().toISOString().split("T")[0];

    // RTDB'den günlük giriş istatistiklerini çek
    const { ref, get, set } = require("firebase/database");

    // İstek parametrelerinden all=true gelirse tüm istatistikleri getir
    const showAll = req.query.all === "true";

    // Veri çekme işlemi
    const statsRef = ref(db.rtdb, `stats/daily_logins`);
    const snapshot = await get(statsRef);

    let stats = {};
    if (snapshot.exists()) {
      stats = snapshot.val();
    }

    // Sadece admin panelinde çalıştığından emin olduğumuz için
    // 30 günden eski kayıtları temizle
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split("T")[0];

    // Silinecek eski kayıtları belirle
    const keysToDelete = [];
    for (const dateKey in stats) {
      if (dateKey < cutoffDate) {
        keysToDelete.push(dateKey);
        delete stats[dateKey]; // Stats objesinden sil
      }
    }

    // Eski kayıtları sildiysek güncelle ve logla
    if (keysToDelete.length > 0) {
      await set(statsRef, stats);
      console.log(`Admin panelinde temizlik: Toplam ${keysToDelete.length} eski istatistik kaydı temizlendi: ${keysToDelete.join(", ")}`);
    }

    if (showAll) {
      // Son 30 günü hesapla
      const lastThirtyDays = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        lastThirtyDays.push(date.toISOString().split("T")[0]);
      }

      // Sıralı bir şekilde son 30 günün istatistiklerini hazırla
      const result = lastThirtyDays.map((date) => {
        return {
          date: date,
          count: stats[date] || 0,
        };
      });

      // En yeniden en eskiye göre sırala
      result.sort((a, b) => b.date.localeCompare(a.date));

      return res.json({
        today: today,
        todayCount: stats[today] || 0,
        stats: result,
      });
    } else {
      // Sadece bugünün istatistiklerini getir
      const count = stats[today] || 0;

      res.json({
        date: today,
        count: count,
      });
    }
  } catch (error) {
    console.error("Günlük giriş istatistikleri getirme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Free Credits değerini getir
router.get("/free-credits", checkSessionTimeout, async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    // Realtime Database'den free_credits bilgisini al
    const { ref, get } = require("firebase/database");
    const database = require("../database/db").rtdb;

    const freeCreditsRef = ref(database, "free_credits");
    const snapshot = await get(freeCreditsRef);

    if (snapshot.exists()) {
      const value = snapshot.val();

      // Değerin formatını kontrol et ve uygun şekilde döndür
      if (typeof value === "object" && value !== null && "value" in value) {
        return res.json(value); // {value: X} şeklinde
      } else if (typeof value === "number") {
        return res.json({ value: value }); // Sayıyı {value: X} formatına çevir
      } else {
        return res.json({ value: parseInt(value) || 0 }); // Diğer durumlar için dönüşüm
      }
    } else {
      return res.json({ value: 0 });
    }
  } catch (error) {
    console.error("Free Credits bilgisi getirme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Free Credits değerini güncelle
router.post("/free-credits/update", checkSessionTimeout, async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: "Free Credits değeri gereklidir" });
    }

    // Mevcut değeri al
    const { ref, get, set } = require("firebase/database");
    const database = require("../database/db").rtdb;

    const freeCreditsRef = ref(database, "free_credits");
    const snapshot = await get(freeCreditsRef);

    let oldValue = 0;
    if (snapshot.exists()) {
      const data = snapshot.val();
      oldValue = typeof data === "object" && data !== null && "value" in data ? data.value : typeof data === "number" ? data : parseInt(data) || 0;
    }

    // Değeri güncelle
    const newValue = parseInt(value);
    await set(freeCreditsRef, { value: newValue });

    // Güncellemeyi logla
    let logMsg = "";

    if (oldValue !== undefined) logMsg += `Eski Değer: ${oldValue}\n`;
    if (newValue !== undefined) logMsg += `Yeni Değer: ${newValue}`;

    const difference = newValue - oldValue;
    if (!isNaN(difference)) logMsg += `\nFark: ${difference}`;

    telegramLog.sendAdminLog("Free Credits Güncellendi", logMsg);

    res.json({ success: true });
  } catch (error) {
    console.error("Free Credits güncelleme hatası:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Telegram bot test
router.get("/test-telegram", checkSessionTimeout, async (req, res) => {
  if (!req.session || !req.session.loggedIn) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  try {
    const testResult = await telegramLog.testAdminLogConnection();

    if (testResult) {
      res.json({
        success: true,
        message: "Telegram bağlantısı başarıyla test edildi. Mesaj gönderildi.",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Telegram bağlantı testi başarısız. Lütfen sunucu loglarını kontrol edin.",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Telegram testi sırasında bir hata oluştu: " + error.message,
    });
  }
});

module.exports = router;
