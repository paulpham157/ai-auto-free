/**
 * Hesap verilerini yöneten sınıf
 */
class AccountDatabase {
  /**
   * Constructor
   */
  constructor() {
    this.initialized = false;
    this.initialize();
    this.accessTokens = new Map(); // Access token'ları saklayacak Map
    this.logger = null;
  }

  /**
   * Log mesajı yazdıran fonksiyon
   * @param {string} message - Log mesajı
   * @param {string} type - Log tipi (info, success, error, warning)
   */
  log(message, type = "info") {
    console.log(`[AccountDB][${type}] ${message}`);

    // Eğer dış logger tanımlanmışsa kullan
    if (typeof this.logger === "function") {
      this.logger(message, type);
    }
  }

  /**
   * Veritabanını başlatır
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    // Chrome storage API'nin varlığını kontrol et
    if (!chrome || !chrome.storage) {
      this.log("Chrome storage API mevcut değil!", "error");
      return;
    }

    // İlk başlatmada boş dizileri ayarla
    const result = await this.getStorageData(["codeiumAccounts", "cursorAccounts"]);

    if (!result.codeiumAccounts) {
      await this.setStorageData({ codeiumAccounts: [] });
    }

    if (!result.cursorAccounts) {
      await this.setStorageData({ cursorAccounts: [] });
    }

    this.initialized = true;
  }

  /**
   * Chrome storage'dan veri alır
   * @param {Array<string>} keys Alınacak veri anahtarları
   * @returns {Promise<Object>} Veri objesi
   */
  getStorageData(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result);
      });
    });
  }

  /**
   * Chrome storage'a veri kaydeder
   * @param {Object} data Kaydedilecek veri
   * @returns {Promise<void>}
   */
  setStorageData(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve();
      });
    });
  }

  /**
   * Codeium hesabı ekler
   * @param {Object} accountData Hesap verisi
   * @returns {Promise<void>}
   */
  async addCodeiumAccount(accountData) {
    await this.initialize();

    const result = await this.getStorageData(["codeiumAccounts"]);
    const accounts = result.codeiumAccounts || [];

    // Firebase verilerini çek
    let firebaseData = null;
    try {
      firebaseData = await this.getFirebaseLocalStorageData();
    } catch (error) {
      this.log("Firebase verileri alınırken hata oluştu: " + error, "error");
    }

    // Email adresine göre varsa güncelle, yoksa ekle
    const existingIndex = accounts.findIndex((account) => account.email === accountData.email);

    if (existingIndex !== -1) {
      accounts[existingIndex] = {
        ...accounts[existingIndex],
        ...accountData,
      };
      // Firebase verilerini ekle (varsa)
      if (firebaseData && firebaseData.length > 0) {
        accounts[existingIndex].firebaseData = await this.encodeFirebaseData(firebaseData);
      }
    } else {
      const newAccount = { ...accountData };
      // Firebase verilerini ekle (varsa)
      if (firebaseData && firebaseData.length > 0) {
        newAccount.firebaseData = await this.encodeFirebaseData(firebaseData);
      }
      accounts.push(newAccount);
    }

    await this.setStorageData({ codeiumAccounts: accounts });

    // Background script'e bildir
    if (chrome.runtime) {
      chrome.runtime.sendMessage({
        action: "accountAdded",
        accountType: "codeium",
        email: accountData.email,
      });
    }
  }

  /**
   * Firebase IndexedDB verilerini çekme fonksiyonu
   * @returns {Promise<Array>} Firebase verileri
   */
  async getFirebaseLocalStorageData() {
    return new Promise((resolve, reject) => {
      // IndexedDB'ye erişim isteği
      const request = indexedDB.open("firebaseLocalStorageDb");

      request.onerror = (event) => {
        this.log("firebaseLocalStorageDb veritabanı açılırken hata oluştu: " + event.target.error, "error");
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        const db = event.target.result;

        // Veritabanında 'firebaseLocalStorage' store'u yoksa boş dizi döndür
        if (!db.objectStoreNames.contains("firebaseLocalStorage")) {
          resolve([]);
          return;
        }

        const transaction = db.transaction(["firebaseLocalStorage"], "readonly");
        const store = transaction.objectStore("firebaseLocalStorage");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = (event) => {
          const records = event.target.result;
          this.log("firebaseLocalStorage içindeki tüm veriler alındı", "info");
          resolve(records);
        };

        getAllRequest.onerror = (event) => {
          this.log("Veriler alınırken hata oluştu: " + event.target.error, "error");
          reject(event.target.error);
        };
      };
    });
  }

  /**
   * Veriyi Base64 formatına dönüştürme fonksiyonu
   * @param {Array} data Kodlanacak veri
   * @returns {string} Base64 formatında kodlanmış veri
   */
  async encodeFirebaseData(data) {
    try {
      // Veriyi JSON string'e dönüştür
      const jsonString = JSON.stringify(data);

      // CompressionStream API'si destekleniyor mu kontrol et
      if (typeof CompressionStream !== "undefined") {
        this.log("CompressionStream API kullanılıyor", "info");

        // String'i Uint8Array'e dönüştür
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(jsonString);

        // Veriyi sıkıştır
        const compressedStream = new Blob([uint8Array]).stream().pipeThrough(new CompressionStream("deflate-raw"));
        const compressedBlob = await new Response(compressedStream).blob();
        const compressedBuffer = await compressedBlob.arrayBuffer();
        const compressedArray = new Uint8Array(compressedBuffer);

        // Sıkıştırılmış veriyi Base64'e dönüştür
        const base64Data = btoa(String.fromCharCode.apply(null, compressedArray));
        this.log(`Sıkıştırılmış veri boyutu: ${compressedArray.length}, Base64 boyutu: ${base64Data.length}`, "info");

        return base64Data;
      } else {
        this.log("CompressionStream API desteklenmiyor, normal Base64 kodlaması yapılıyor", "info");
        // Desteklenmiyorsa normal Base64 kodlaması yap
        return btoa(unescape(encodeURIComponent(jsonString)));
      }
    } catch (error) {
      this.log("Veri kodlanırken hata oluştu: " + error, "error");
      // Hata durumunda normal Base64 kodlaması dene
      try {
        return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      } catch (e) {
        this.log("Alternatif kodlama da başarısız oldu: " + e, "error");
        return null;
      }
    }
  }

  /**
   * Cursor hesabı ekler
   * @param {Object} accountData Hesap verisi
   * @returns {Promise<void>}
   */
  async addCursorAccount(accountData) {
    await this.initialize();

    const result = await this.getStorageData(["cursorAccounts"]);
    let accounts = result.cursorAccounts || [];

    // Hesap verisi kontrol etme
    const hasToken = !!accountData.token;
    const hasEmail = !!accountData.email;

    if (hasEmail) {
      // Email adresine göre varsa güncelle
      const existingIndex = accounts.findIndex((account) => account.email === accountData.email);

      if (existingIndex !== -1) {
        // Eğer bu email için mevcut bir kayıt varsa, birleştir
        accounts[existingIndex] = {
          ...accounts[existingIndex],
          ...accountData,
          timestamp: Date.now(),
        };

        // Eğer token bilgisi ekleniyorsa, geçmiş verileri temizleyelim
        // Sadece token olmadan kaydedilmiş tokeni olmayan hesapları kaldır
        if (hasToken) {
          accounts = accounts.filter((account) => !(account.email === accountData.email && !account.token) || account === accounts[existingIndex]);
        }
      } else {
        // Yeni hesap ekle
        accounts.push({
          ...accountData,
          timestamp: Date.now(),
        });
      }
    } else if (hasToken) {
      // Sadece token varsa, en son kaydedilen email ve şifre bilgisini bul
      const recentAccounts = [...accounts].filter((acc) => acc.email && acc.password);

      // Timestamp'e göre sırala, en yeni kayıt en üstte olsun
      recentAccounts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      if (recentAccounts.length > 0) {
        // En son kayıt edilen hesabı bul ve token ile güncelle
        const mostRecentAccount = recentAccounts[0];
        const existingIndex = accounts.findIndex((account) => account.email === mostRecentAccount.email);

        if (existingIndex !== -1) {
          // Token'ı bu hesaba ekle
          accounts[existingIndex] = {
            ...accounts[existingIndex],
            token: accountData.token,
            timestamp: Date.now(),
          };

          this.log(`Token, son kaydedilen hesaba (${mostRecentAccount.email}) eklendi.`);
        } else {
          // Teorik olarak buraya girmemeli, ama bir hata olursa yeni bir kayıt olarak ekleyelim
          accounts.push({
            email: mostRecentAccount.email,
            password: mostRecentAccount.password,
            token: accountData.token,
            timestamp: Date.now(),
          });
        }

        // Sadece token içeren kayıtları temizle
        accounts = accounts.filter((account) => !(account.token && !account.email));
      } else {
        // Eğer hiç email/şifre kaydı yoksa, sadece token'ı kaydet
        accounts.push({
          ...accountData,
          timestamp: Date.now(),
        });
      }
    }

    await this.setStorageData({ cursorAccounts: accounts });

    // Background script'e bildir
    if (chrome.runtime && accountData.email) {
      chrome.runtime.sendMessage({
        action: "accountAdded",
        accountType: "cursor",
        email: accountData.email,
      });
    }
  }

  /**
   * Codeium hesaplarını getirir
   * @returns {Promise<Array>} Hesaplar dizisi
   */
  async getCodeiumAccounts() {
    await this.initialize();
    const result = await this.getStorageData(["codeiumAccounts"]);
    return result.codeiumAccounts || [];
  }

  /**
   * Cursor hesaplarını getirir
   * @returns {Promise<Array>} Hesaplar dizisi
   */
  async getCursorAccounts() {
    await this.initialize();
    const result = await this.getStorageData(["cursorAccounts"]);
    return result.cursorAccounts || [];
  }

  /**
   * Tüm Codeium hesaplarını siler
   * @returns {Promise<void>}
   */
  async clearAllCodeiumAccounts() {
    await this.setStorageData({ codeiumAccounts: [] });
  }

  /**
   * Tüm Cursor hesaplarını siler
   * @returns {Promise<void>}
   */
  async clearAllCursorAccounts() {
    await this.setStorageData({ cursorAccounts: [] });
  }

  /**
   * Codeium hesaplarının toplu kopyalanabilir formatını oluşturur
   * @returns {Promise<string>} Kopyalanabilir metin
   */
  async getCodeiumAccountsText() {
    const accounts = await this.getCodeiumAccounts();

    // Hesapları metin formatında oluştur
    let text = "";

    accounts.forEach((account) => {
      if (account.apiKey) text += `${account.apiKey}\n`;
      if (account.refreshToken) text += `${account.refreshToken}\n`;
      if (account.email) text += `${account.email}\n`;
      if (account.password) text += `${account.password}\n`;
      text += "\n"; // Hesaplar arasında boşluk
    });

    return text;
  }

  /**
   * Cursor hesaplarının toplu kopyalanabilir formatını oluşturur
   * @returns {Promise<string>} Kopyalanabilir metin
   */
  async getCursorAccountsText() {
    const accounts = await this.getCursorAccounts();

    // Hesapları metin formatında oluştur
    let text = "";

    accounts.forEach((account) => {
      if (account.token) text += `${account.token}\n`;
      if (account.email) text += `${account.email}\n`;
      if (account.password) text += `${account.password}\n`;
      text += "\n"; // Hesaplar arasında boşluk
    });

    return text;
  }

  /**
   * Metni panoya kopyalar
   * @param {string} text Kopyalanacak metin
   * @returns {Promise<boolean>} Başarı durumu
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Panoya kopyalama hatası:", error);
      return false;
    }
  }

  /**
   * Codeium Refresh Token kullanarak Access Token oluşturur
   * @param {string} refreshToken Refresh Token
   * @param {string} apiKey API Key
   * @returns {Promise<string|null>} Access Token
   */
  async refreshCodeiumToken(refreshToken, apiKey) {
    if (!refreshToken || !apiKey) {
      this.log("refreshCodeiumToken: refreshToken veya apiKey eksik!", "error");
      return null;
    }

    try {
      const key = `${refreshToken}:${apiKey}`;

      // Daha önce üretilmiş bir access token varsa ve son 60 dakika içinde üretildiyse onu kullan
      if (this.accessTokens.has(key)) {
        const { token, timestamp } = this.accessTokens.get(key);
        const now = Date.now();
        const elapsed = now - timestamp;

        // Token son 60 dakika içinde oluşturulduysa yeniden kullan
        if (elapsed < 60 * 60 * 1000 && token) {
          this.log("Önbellekten token kullanılıyor...");
          return token;
        }
      }

      this.log("Yeni token oluşturuluyor...");

      // Yeni token oluştur
      const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP error! Status: ${response.status}`;
        this.log("Token yenileme API hatası: " + errorMessage, "error");
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const accessToken = data.access_token;

      if (!accessToken) {
        this.log("API yanıtında access_token bulunamadı: " + JSON.stringify(data), "error");
        throw new Error("API yanıtında access_token bulunamadı");
      }

      // Token'ı cache'le
      this.accessTokens.set(key, {
        token: accessToken,
        timestamp: Date.now(),
      });

      this.log("Access token başarıyla oluşturuldu");
      return accessToken;
    } catch (error) {
      this.log("Codeium token yenileme hatası: " + error, "error");
      return null;
    }
  }

  /**
   * Tüm Codeium hesapları için Access Token oluşturur
   * @returns {Promise<Array>} Hesap ve access token dizisi
   */
  async generateAllCodeiumAccessTokens() {
    const accounts = await this.getCodeiumAccounts();

    if (!accounts || accounts.length === 0) {
      this.log("Token oluşturmak için hesap bulunamadı", "warning");
      return [];
    }

    this.log(`${accounts.length} hesap için token oluşturma başlatılıyor...`);
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const account of accounts) {
      if (!account.refreshToken || !account.apiKey) {
        this.log(`Geçersiz hesap verisi (refreshToken veya apiKey eksik): ${account.email}`, "warning");
        errorCount++;
        continue;
      }

      try {
        const accessToken = await this.refreshCodeiumToken(account.refreshToken, account.apiKey);

        if (accessToken) {
          results.push({
            email: account.email || "Bilinmeyen email",
            accessToken,
          });
          successCount++;
        } else {
          this.log(`Token oluşturulamadı: ${account.email}`, "warning");
          errorCount++;
        }
      } catch (err) {
        this.log(`Token oluşturma hatası (${account.email}): ${err}`, "error");
        errorCount++;
      }
    }

    this.log(`Token oluşturma tamamlandı. Başarılı: ${successCount}, Başarısız: ${errorCount}`);
    return results;
  }
}

// Global scope'ta erişilebilir singleton obje oluştur
window.accountDB = new AccountDatabase();
