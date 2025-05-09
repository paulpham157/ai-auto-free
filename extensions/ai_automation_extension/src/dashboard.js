/**
 * Dashboard sayfası için JavaScript kodu
 */
document.addEventListener("DOMContentLoaded", () => {
  // Sekme Elementleri
  const codeiumTab = document.getElementById("codeiumTab");
  const cursorTab = document.getElementById("cursorTab");
  const codeiumContent = document.getElementById("codeiumContent");
  const cursorContent = document.getElementById("cursorContent");
  const codeiumAccounts = document.getElementById("codeiumAccounts");
  const cursorAccounts = document.getElementById("cursorAccounts");
  const codeiumTokenSection = document.getElementById("codeiumTokenSection"); // Eksik tanımlama eklendi
  const cursorCheckSection = document.getElementById("cursorCheckSection"); // Eksik tanımlama eklendi

  // İstatistik göstergeleri
  const codeiumTotalCount = document.getElementById("codeiumTotalCount");
  const cursorTotalCount = document.getElementById("cursorTotalCount");

  // Token işlemleri
  const generateAccessTokens = document.getElementById("generateAccessTokens");
  const generateAccessTokensFromJson = document.getElementById("generateAccessTokensFromJson");
  const jsonTokenInputContainer = document.getElementById("jsonTokenInputContainer");
  const jsonTokenInput = document.getElementById("jsonTokenInput");
  const generateTokensFromJsonBtn = document.getElementById("generateTokensFromJsonBtn");
  const accessTokenContainer = document.getElementById("accessTokenContainer");
  const copyAllTokens = document.getElementById("copyAllTokens");

  // Toplu işlem butonları
  const copyAllCodeium = document.getElementById("copyAllCodeium");
  const copyAllCursor = document.getElementById("copyAllCursor");
  const clearAllCodeium = document.getElementById("clearAllCodeium");
  const clearAllCursor = document.getElementById("clearAllCursor");

  // Cursor Hesap Kontrol Elementleri
  const cursorCheckJsonInput = document.getElementById("cursorCheckJsonInput");
  const cursorCheckButton = document.getElementById("cursorCheckButton");
  const cursorCheckResultsContainer = document.getElementById("cursorCheckResults");
  const cursorCheckStatusBar = document.getElementById("cursorCheckStatusBar");
  const cursorCheckTotalCountElement = document.getElementById("cursorCheckTotalCount");
  const cursorCheckValidCountElement = document.getElementById("cursorCheckValidCount");
  const cursorCheckInvalidCountElement = document.getElementById("cursorCheckInvalidCount");

  // Sekme Değiştirme İşlevselliği
  codeiumTab.addEventListener("click", () => {
    codeiumTab.classList.add("tab-active", "codeium-color");
    codeiumTab.classList.remove("text-gray-400");
    cursorTab.classList.remove("tab-active", "codeium-color"); // Cursor'dan codeium rengini kaldır
    cursorTab.classList.add("text-gray-400", "cursor-color"); // Cursor'a gri ve kendi rengini ekle

    codeiumContent.classList.remove("hidden");
    cursorContent.classList.add("hidden");

    // Sağ paneli güncelle
    if (codeiumTokenSection) codeiumTokenSection.classList.remove("hidden");
    if (cursorCheckSection) cursorCheckSection.classList.add("hidden");
  });

  cursorTab.addEventListener("click", () => {
    cursorTab.classList.add("tab-active", "cursor-color");
    cursorTab.classList.remove("text-gray-400");
    codeiumTab.classList.remove("tab-active", "cursor-color"); // Codeium'dan cursor rengini kaldır
    codeiumTab.classList.add("text-gray-400", "codeium-color"); // Codeium'a gri ve kendi rengini ekle

    cursorContent.classList.remove("hidden");
    codeiumContent.classList.add("hidden");

    // Sağ paneli güncelle
    if (codeiumTokenSection) codeiumTokenSection.classList.add("hidden");
    if (cursorCheckSection) cursorCheckSection.classList.remove("hidden");
  });

  // Başlangıçta varsayılan sekme durumunu ayarla
  // (Sayfa yenilendiğinde veya ilk açıldığında)
  function setInitialTabState() {
    // Başlangıçta Codeium sekmesini aktif et ve ilgili içerikleri göster
    codeiumTab.classList.add("tab-active", "codeium-color");
    codeiumTab.classList.remove("text-gray-400");
    cursorTab.classList.remove("tab-active");
    cursorTab.classList.add("text-gray-400", "cursor-color");

    codeiumContent.classList.remove("hidden");
    cursorContent.classList.add("hidden");
    if (codeiumTokenSection) codeiumTokenSection.classList.remove("hidden");
    if (cursorCheckSection) cursorCheckSection.classList.add("hidden");
  }

  // Hesap listelerini güncelleme
  function updateCodeiumAccountsList() {
    chrome.storage.local.get("codeiumAccounts", function (result) {
      const accounts = result.codeiumAccounts || [];

      // İstatistik güncelleme
      codeiumTotalCount.textContent = accounts.length;

      if (accounts.length === 0) {
        codeiumAccounts.innerHTML = '<div class="text-gray-400 text-center py-8">Henüz kayıtlı Codeium hesabı yok</div>';
        return;
      }

      let html = "";
      accounts.forEach((account, index) => {
        html += `
          <div class="account-card p-4">
            <div class="flex justify-between items-center mb-3">
              <div class="flex items-center">
                <img src="https://windsurf.com/favicon.svg" alt="Windsurf" class="w-5 h-5 mr-2" />
                <span class="text-blue-300 font-medium">${account.email || "Email yok"}</span>
              </div>
              <button class="delete-account text-red-400 hover:text-red-300" data-type="codeium" data-index="${index}">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
            <div class="text-xs text-gray-400 mb-1">
              <span class="text-gray-500">API Key:</span>
              <span class="text-gray-300">${truncateText(account.apiKey || "Yok", 25)}</span>
            </div>
            <div class="text-xs text-gray-400 mb-1">
              <span class="text-gray-500">Refresh Token:</span>
              <span class="text-gray-300">${truncateText(account.refreshToken || "Yok", 25)}</span>
            </div>
            <div class="text-xs text-gray-400 mb-3">
              <span class="text-gray-500">Şifre:</span>
              <span class="text-gray-300">${account.password || "Yok"}</span>
            </div>
            ${
              account.firebaseData
                ? `<div class="text-xs text-gray-400 mb-3">
              <span class="text-gray-500">Firebase Verileri:</span>
              <span class="text-green-300"><i class="fas fa-check-circle"></i> Mevcut</span>
            </div>`
                : ""
            }
            <button class="copy-data w-full btn btn-blue text-xs py-1 rounded" data-type="codeium" data-index="${index}">
              <i class="fas fa-copy"></i> Verileri Kopyala
            </button>
          </div>
        `;
      });

      codeiumAccounts.innerHTML = html;

      // Silme butonları için olay dinleyicileri
      document.querySelectorAll(".delete-account").forEach((button) => {
        button.addEventListener("click", deleteAccount);
      });

      // Kopyalama butonları için olay dinleyicileri
      document.querySelectorAll(".copy-data").forEach((button) => {
        button.addEventListener("click", copyAccountData);
      });
    });
  }

  function updateCursorAccountsList() {
    chrome.storage.local.get("cursorAccounts", function (result) {
      const accounts = result.cursorAccounts || [];

      // İstatistik güncelleme
      cursorTotalCount.textContent = accounts.length;

      if (accounts.length === 0) {
        cursorAccounts.innerHTML = '<div class="text-gray-400 text-center py-8">Henüz kayıtlı Cursor hesabı yok</div>';
        return;
      }

      let html = "";
      accounts.forEach((account, index) => {
        html += `
          <div class="account-card p-4">
            <div class="flex justify-between items-center mb-3">
              <div class="flex items-center">
                <img src="https://www.cursor.com/favicon.svg" alt="Cursor" class="w-5 h-5 mr-2" />
                <span class="text-green-300 font-medium">${account.email || "Email yok"}</span>
              </div>
              <button class="delete-account text-red-400 hover:text-red-300" data-type="cursor" data-index="${index}">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
            <div class="text-xs text-gray-400 mb-1">
              <span class="text-gray-500">Token:</span>
              <span class="text-gray-300">${truncateText(account.token || "Yok", 30)}</span>
            </div>
            <div class="text-xs text-gray-400 mb-3">
              <span class="text-gray-500">Şifre:</span>
              <span class="text-gray-300">${account.password || "Yok"}</span>
            </div>
            <button class="copy-data w-full btn btn-green text-xs py-1 rounded" data-type="cursor" data-index="${index}">
              <i class="fas fa-copy"></i> Verileri Kopyala
            </button>
          </div>
        `;
      });

      cursorAccounts.innerHTML = html;

      // Silme butonları için olay dinleyicileri
      document.querySelectorAll(".delete-account").forEach((button) => {
        button.addEventListener("click", deleteAccount);
      });

      // Kopyalama butonları için olay dinleyicileri
      document.querySelectorAll(".copy-data").forEach((button) => {
        button.addEventListener("click", copyAccountData);
      });
    });
  }

  // Hesap silme fonksiyonu
  function deleteAccount(e) {
    const type = this.dataset.type;
    const index = parseInt(this.dataset.index);

    const storageKey = type === "codeium" ? "codeiumAccounts" : "cursorAccounts";

    chrome.storage.local.get(storageKey, function (result) {
      const accounts = result[storageKey] || [];

      if (index >= 0 && index < accounts.length) {
        const accountEmail = accounts[index].email;

        if (confirm(`${accountEmail || "Email yok"} hesabını silmek istediğinize emin misiniz?`)) {
          accounts.splice(index, 1);

          chrome.storage.local.set({ [storageKey]: accounts }, function () {
            if (type === "codeium") {
              updateCodeiumAccountsList();
            } else {
              updateCursorAccountsList();
            }
          });
        }
      }
    });
  }

  // Hesap verilerini kopyalama fonksiyonu
  async function copyAccountData(e) {
    const type = this.dataset.type;
    const index = parseInt(this.dataset.index);

    const storageKey = type === "codeium" ? "codeiumAccounts" : "cursorAccounts";

    const result = await chrome.storage.local.get(storageKey);
    const accounts = result[storageKey] || [];

    if (index >= 0 && index < accounts.length) {
      const account = accounts[index];
      let textToCopy = "";

      if (type === "codeium") {
        textToCopy = `${account.apiKey || "API Key yok"}\n${account.refreshToken || "Refresh Token yok"}\n${account.email || "Email yok"}\n${account.password || "Şifre yok"}`;

        // Firebase verilerini ekle (varsa)
        if (account.firebaseData) {
          textToCopy += `\nFIREBASE_DATA:${account.firebaseData}`;
          navigator.clipboard.writeText(textToCopy);
        } else {
          // Firebase verilerini çek (hesapta yoksa)
          const data = await getFirebaseLocalStorageData();
          if (data && data.length > 0) {
            // Verileri sıkıştır ve Base64 formatına dönüştür
            const base64Data = await encodeFirebaseData(data);
            // Dönüştürülmüş veriyi metne ekle
            textToCopy += `\nFIREBASE_DATA:${base64Data}`;
          }
          // Kopyalama işlemini gerçekleştir
          navigator.clipboard.writeText(textToCopy);
        }
      } else {
        textToCopy = `${account.token || "Token yok"}\n${account.email || "Email yok"}\n${account.password || "Şifre yok"}`;
        navigator.clipboard.writeText(textToCopy);
      }
    }
  }

  // Tüm hesapları kopyalama butonları
  copyAllCodeium.addEventListener("click", async function () {
    const result = await chrome.storage.local.get("codeiumAccounts");
    const accounts = result.codeiumAccounts || [];

    if (accounts.length === 0) {
      return;
    }

    let allText = "";

    accounts.forEach((account) => {
      if (account.apiKey) allText += `${account.apiKey}\n`;
      if (account.refreshToken) allText += `${account.refreshToken}\n`;
      if (account.email) allText += `${account.email}\n`;
      if (account.password) allText += `${account.password}\n`;
      // Firebase verilerini ekle (varsa)
      if (account.firebaseData) {
        allText += `FIREBASE_DATA:${account.firebaseData}\n`;
      }
      allText += "\n"; // Hesaplar arasında boşluk
    });

    // Hesaplarda Firebase verisi yoksa, doğrudan çek
    const hasFirebaseData = accounts.some((account) => account.firebaseData);
    if (!hasFirebaseData) {
      try {
        // Firebase IndexedDB verilerini çek
        const data = await getFirebaseLocalStorageData();
        if (data && data.length > 0) {
          // Verileri sıkıştır ve Base64 formatına dönüştür
          const base64Data = await encodeFirebaseData(data);
          // Dönüştürülmüş veriyi metne ekle
          allText += `FIREBASE_DATA:${base64Data}\n\n`;
        }
      } catch (error) {
        console.error("Firebase verileri alınırken hata oluştu:", error);
      }
    }

    // Kopyalama işlemini gerçekleştir
    navigator.clipboard.writeText(allText);
  });

  copyAllCursor.addEventListener("click", function () {
    chrome.storage.local.get("cursorAccounts", function (result) {
      const accounts = result.cursorAccounts || [];

      if (accounts.length === 0) {
        return;
      }

      let allText = "";

      accounts.forEach((account) => {
        if (account.token) allText += `${account.token}\n`;
        if (account.email) allText += `${account.email}\n`;
        if (account.password) allText += `${account.password}\n`;
        allText += "\n"; // Hesaplar arasında boşluk
      });

      navigator.clipboard.writeText(allText);
    });
  });

  // Firebase IndexedDB verilerini çekme fonksiyonu
  function getFirebaseLocalStorageData() {
    console.log("getFirebaseLocalStorageData fonksiyonu çağrıldı");

    return new Promise((resolve, reject) => {
      // IndexedDB'ye erişim isteği
      console.log("IndexedDB'ye erişim isteği yapılıyor");
      const request = indexedDB.open("firebaseLocalStorageDb");

      request.onerror = function (event) {
        console.error("firebaseLocalStorageDb veritabanı açılırken hata oluştu:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = function (event) {
        console.log("IndexedDB bağlantısı başarılı");
        const db = event.target.result;

        // Veritabanı store'larını kontrol et
        console.log("Mevcut store'lar:", Array.from(db.objectStoreNames));

        // Veritabanında 'firebaseLocalStorage' store'u yoksa boş dizi döndür
        if (!db.objectStoreNames.contains("firebaseLocalStorage")) {
          console.warn("firebaseLocalStorage store'u bulunamadı");
          resolve([]);
          return;
        }

        console.log("firebaseLocalStorage store'una erişiliyor");
        const transaction = db.transaction(["firebaseLocalStorage"], "readonly");
        const store = transaction.objectStore("firebaseLocalStorage");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = function (event) {
          const records = event.target.result;
          console.log("firebaseLocalStorage içindeki tüm veriler:", records);
          if (records && records.length > 0) {
            console.log("Veri sayısı:", records.length);
          } else {
            console.warn("Hiç veri bulunamadı!");
          }
          resolve(records);
        };

        getAllRequest.onerror = function (event) {
          console.error("Veriler alınırken hata oluştu:", event.target.error);
          reject(event.target.error);
        };
      };
    });
  }

  // Veriyi Base64 formatına dönüştürme ve sıkıştırma fonksiyonu
  async function encodeFirebaseData(data) {
    try {
      // Veriyi JSON string'e dönüştür
      const jsonString = JSON.stringify(data);
      console.log("JSON string oluşturuldu, boyut:", jsonString.length);

      // CompressionStream API'si destekleniyor mu kontrol et
      if (typeof CompressionStream !== "undefined") {
        console.log("CompressionStream API kullanılıyor");

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
        console.log("Sıkıştırılmış veri boyutu:", compressedArray.length, "Base64 boyutu:", base64Data.length);

        return base64Data;
      } else {
        console.log("CompressionStream API desteklenmiyor, normal Base64 kodlaması yapılıyor");
        // Desteklenmiyorsa normal Base64 kodlaması yap
        return btoa(unescape(encodeURIComponent(jsonString)));
      }
    } catch (error) {
      console.error("Veri kodlanırken hata oluştu:", error);
      // Hata durumunda da mevcut verileri kopyala
      try {
        return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      } catch (e) {
        console.error("Alternatif kodlama da başarısız oldu:", e);
        return null;
      }
    }
  }

  // Tüm hesapları silme butonları
  clearAllCodeium.addEventListener("click", function () {
    if (confirm("Tüm Codeium hesaplarını silmek istediğinize emin misiniz?")) {
      chrome.storage.local.set({ codeiumAccounts: [] }, function () {
        updateCodeiumAccountsList();
      });
    }
  });

  clearAllCursor.addEventListener("click", function () {
    if (confirm("Tüm Cursor hesaplarını silmek istediğinize emin misiniz?")) {
      chrome.storage.local.set({ cursorAccounts: [] }, function () {
        updateCursorAccountsList();
      });
    }
  });

  // Access Token'ları oluşturma
  generateAccessTokens.addEventListener("click", function () {
    // JSON input alanını gizle
    jsonTokenInputContainer.classList.add("hidden");

    accessTokenContainer.innerHTML = '<div class="text-center py-4"><div class="loader"></div><p class="mt-2 text-gray-400">Access token\'lar oluşturuluyor...</p></div>';

    // Önce copyAllTokens butonunu gizle (tokenleri sildiğimiz için)
    copyAllTokens.classList.add("hidden");

    try {
      chrome.runtime.sendMessage({ action: "generateAccessTokens" }, function (response) {
        // Kontrol: response var mı?
        if (!response) {
          showTokenError("İletişim hatası: Eklenti ile iletişim kurulamadı.");
          return;
        }

        // Kontrol: başarı durumu
        if (response.tokens && Array.isArray(response.tokens)) {
          displayAccessTokens(response.tokens);
        }
        // Kontrol: hata mesajı
        else if (response.error) {
          showTokenError(`Hata: ${response.message || response.error}`);
        }
        // Beklenmeyen yanıt
        else {
          showTokenError("Beklenmeyen yanıt alındı. Lütfen Codeium sayfasının açık olduğundan emin olun.");
        }
      });
    } catch (error) {
      showTokenError(`İşlem hatası: ${error.message}`);
    }
  });

  // JSON'dan token oluşturma butonuna tıklandığında
  generateAccessTokensFromJson.addEventListener("click", function () {
    // JSON input alanını göster/gizle (toggle)
    jsonTokenInputContainer.classList.toggle("hidden");
  });

  // JSON'dan token oluşturma işlemi
  generateTokensFromJsonBtn.addEventListener("click", function () {
    // JSON verisini almaya çalış
    let jsonData;
    try {
      const jsonText = jsonTokenInput.value.trim();
      if (!jsonText) {
        showTokenError("Lütfen geçerli bir JSON verisi girin.");
        return;
      }

      jsonData = JSON.parse(jsonText);

      if (!Array.isArray(jsonData)) {
        showTokenError("Geçersiz JSON formatı. Dizi formatında olmalı.");
        return;
      }

      // Gerekli alanların kontrolü
      const invalidData = jsonData.some((item) => !item.api_key || !item.refresh_token);
      if (invalidData) {
        showTokenError("Bazı hesaplarda api_key veya refresh_token eksik.");
        return;
      }

      // İşleme başla
      accessTokenContainer.innerHTML = '<div class="text-center py-4"><div class="loader"></div><p class="mt-2 text-gray-400">JSON\'dan token\'lar oluşturuluyor...</p></div>';
      copyAllTokens.classList.add("hidden");

      // Token oluşturma işlemini başlat
      generateTokensFromJson(jsonData);
    } catch (error) {
      showTokenError(`JSON işleme hatası: ${error.message}`);
    }
  });

  // JSON verilerinden token oluşturma fonksiyonu
  function generateTokensFromJson(accounts) {
    // Sonuçları saklayacak dizi
    const results = [];
    let processedCount = 0;

    // Her hesap için token oluştur
    accounts.forEach((account, index) => {
      try {
        // API isteği yap
        fetch(`https://securetoken.googleapis.com/v1/token?key=${account.api_key}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `grant_type=refresh_token&refresh_token=${account.refresh_token}`,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            const accessToken = data.access_token;
            if (!accessToken) {
              throw new Error("API yanıtında access_token bulunamadı");
            }

            // Başarılı sonucu kaydet
            results.push({
              email: account.email || `Hesap ${index + 1}`,
              accessToken: accessToken,
            });

            // İşlenen hesap sayısını artır
            processedCount++;

            // Tüm hesaplar işlendiyse sonuçları göster
            if (processedCount === accounts.length) {
              displayAccessTokens(results);
            }
          })
          .catch((error) => {
            console.error(`Token oluşturma hatası (${account.email || index}):`, error);

            // Hatalı durumda da işlenen sayısını artır
            processedCount++;

            // Tüm hesaplar işlendiyse sonuçları göster
            if (processedCount === accounts.length) {
              if (results.length > 0) {
                displayAccessTokens(results);
              } else {
                showTokenError("Hiçbir token oluşturulamadı. Lütfen API key ve refresh token değerlerini kontrol edin.");
              }
            }
          });
      } catch (error) {
        console.error(`İşlem hatası (${account.email || index}):`, error);
        processedCount++;

        if (processedCount === accounts.length && results.length > 0) {
          displayAccessTokens(results);
        } else if (processedCount === accounts.length) {
          showTokenError("Hiçbir token oluşturulamadı. Lütfen API key ve refresh token değerlerini kontrol edin.");
        }
      }
    });
  }

  // Token oluşturma hatası gösterme
  function showTokenError(errorMessage) {
    accessTokenContainer.innerHTML = `
      <div class="text-red-400 text-center py-4">
        <i class="fas fa-exclamation-triangle text-xl mb-2"></i>
        <p>${errorMessage}</p>
        <div class="mt-3 text-sm text-gray-400">
          <p>Çözüm için:</p>
          <ul class="list-disc list-inside text-left mt-1">
            <li>En az bir Codeium hesabının kayıtlı olduğundan emin olun</li>
            <li>Windsurf.com sayfasının tarayıcınızda açık olduğunu kontrol edin</li>
            <li>Eklentiyi yeniden yükleyin veya tarayıcınızı yeniden başlatın</li>
          </ul>
        </div>
      </div>
    `;
  }

  // Access Token'ları görüntüleme
  function displayAccessTokens(tokens) {
    if (!tokens || tokens.length === 0) {
      accessTokenContainer.innerHTML = `
        <div class="text-yellow-400 text-center py-4">
          <i class="fas fa-exclamation-circle text-xl mb-2"></i>
          <p>Hiç token oluşturulamadı.</p>
          <p class="mt-2 text-sm text-gray-400">API Key ve Refresh Token olan hesap bulunamadı veya token oluşturma işlemi başarısız oldu.</p>
        </div>
      `;
      return;
    }

    let html = "";

    tokens.forEach((token) => {
      html += `
        <div class="bg-gray-800 rounded p-3 mb-3">
          <div class="flex justify-between items-center mb-2">
            <div class="text-sm text-blue-300">${token.email}</div>
            <button class="copy-token text-blue-400 hover:text-blue-300 text-sm" data-token="${token.accessToken}">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div class="text-xs text-gray-400 break-all font-mono">${truncateText(token.accessToken, 40)}</div>
        </div>
      `;
    });

    accessTokenContainer.innerHTML = html;
    copyAllTokens.classList.remove("hidden");

    // Token kopyalama butonlarına event listener ekle
    document.querySelectorAll(".copy-token").forEach((button) => {
      button.addEventListener("click", function () {
        const token = this.dataset.token;
        navigator.clipboard.writeText(token);
      });
    });

    // Tüm token'ları kopyalama butonu
    copyAllTokens.addEventListener("click", function () {
      let allTokens = tokens.map((t) => t.accessToken).join("\n");
      navigator.clipboard.writeText(allTokens);
    });
  }

  // Metni belirli bir uzunlukta kısaltma
  function truncateText(text, maxLength) {
    if (!text) return "Yok";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }

  // Cursor Hesap Kontrol Fonksiyonları
  if (cursorCheckButton) {
    cursorCheckButton.addEventListener("click", function () {
      // JSON verisini almaya çalış
      let accounts;
      try {
        accounts = JSON.parse(cursorCheckJsonInput.value);
        if (!Array.isArray(accounts)) {
          throw new Error("JSON bir dizi olmalıdır");
        }
      } catch (error) {
        showCursorCheckStatus(`JSON hatası: ${error.message}`, "error");
        return;
      }

      // Hesap sayısını kontrol et
      if (accounts.length === 0) {
        showCursorCheckStatus("Kontrol edilecek hesap bulunamadı", "error");
        return;
      }

      // Sonuçları temizle
      cursorCheckResultsContainer.innerHTML = '<div class="text-gray-400 text-center text-sm py-4">Kontrol başlatılıyor...</div>';

      // Sayaçları sıfırla
      let totalCount = accounts.length;
      let validCount = 0;
      let invalidCount = 0;

      // Sayaçları güncelle
      updateCursorCheckCounts(totalCount, validCount, invalidCount);

      // Durumu göster
      showCursorCheckStatus(`${totalCount} hesap kontrol ediliyor...`, "info");

      // Geçersiz hesapları saklamak için dizi
      const invalidAccountsData = []; // Hem email hem token sakla

      // Kontrol sürecini başlat
      processAccountChecks(accounts, 0, totalCount, validCount, invalidCount, invalidAccountsData);
    });
  }

  // Hesap kontrolünü sırayla yap (API rate limitlerini aşmamak için)
  async function processAccountChecks(accounts, index, totalCount, validCount, invalidCount, invalidAccountsData) {
    if (index >= accounts.length) {
      // Tüm kontroller bitti
      showFinalCursorCheckResult(invalidAccountsData, totalCount);
      return;
    }

    const account = accounts[index];

    // Hesap format kontrolü
    if (!account.email || !account.token) {
      const resultItem = createCursorCheckResultItem(`#${index + 1}: Geçersiz format. 'email' ve 'token' gerekli.`, "invalid", null);
      if (index === 0) cursorCheckResultsContainer.innerHTML = ""; // İlk mesajı temizle
      cursorCheckResultsContainer.appendChild(resultItem);
      invalidCount++;
      invalidAccountsData.push({ email: account.email || "Format Hatalı", token: account.token || "Format Hatalı" });
      updateCursorCheckCounts(totalCount, validCount, invalidCount);
      // Sonraki hesaba geç (kısa bir gecikme ile)
      setTimeout(() => processAccountChecks(accounts, index + 1, totalCount, validCount, invalidCount, invalidAccountsData), 100);
      return;
    }

    // Sonuç elementi oluştur (yükleniyor durumu)
    const resultItem = createCursorCheckResultItem(`#${index + 1}: ${account.email} kontrol ediliyor...`, "loading", null);
    if (index === 0) cursorCheckResultsContainer.innerHTML = ""; // İlk mesajı temizle
    cursorCheckResultsContainer.appendChild(resultItem);

    // API isteği yap
    try {
      const isValid = await checkCursorAccountAPI(account.token);

      // Sonuç elementini güncelle
      if (isValid) {
        resultItem.innerHTML = `#${index + 1}: <strong class="text-green-400">${account.email}</strong> - Geçerli`;
        resultItem.className = "cursor-check-result-item valid";
        validCount++;
      } else {
        resultItem.innerHTML = `#${index + 1}: <strong class="text-red-400">${account.email}</strong> - Geçersiz
          <button class="copy-cursor-check-btn btn btn-outline btn-outline-red text-xs px-2 py-1 ml-2 rounded" data-email="${account.email}" data-token="${account.token}">Kopyala</button>`;
        resultItem.className = "cursor-check-result-item invalid";
        invalidCount++;
        invalidAccountsData.push({ email: account.email, token: account.token });
      }
    } catch (error) {
      resultItem.innerHTML = `#${index + 1}: <strong class="text-red-400">${account.email}</strong> - Hata: ${error.message}
        <button class="copy-cursor-check-btn btn btn-outline btn-outline-red text-xs px-2 py-1 ml-2 rounded" data-email="${account.email}" data-token="${account.token}">Kopyala</button>`;
      resultItem.className = "cursor-check-result-item invalid";
      invalidCount++;
      invalidAccountsData.push({ email: account.email, token: account.token });
    }

    // Sayaçları güncelle
    updateCursorCheckCounts(totalCount, validCount, invalidCount);

    // Sonraki hesaba geç (kısa bir gecikme ile)
    setTimeout(() => processAccountChecks(accounts, index + 1, totalCount, validCount, invalidCount, invalidAccountsData), 100); // 100ms bekle
  }

  // Cursor hesabını kontrol eden API fonksiyonu
  async function checkCursorAccountAPI(token) {
    const headers = {
      "Accept-Encoding": "gzip, deflate, br",
      Authorization: `Bearer ${token}`,
      "Connect-Protocol-Version": "1",
      "Content-Type": "application/proto",
      "User-Agent": "connect-es/1.6.1",
      "X-Ghost-Mode": "true",
      "X-Client-Key": "6e16cb89ec5d5d396367b32b9fa638eccf96d99920d1ec5de9aac75b457a4d60",
      "X-Cursor-Client-Version": "0.49.6",
      "X-Cursor-Config-Version": "c0f5a3c4-349f-4b43-b061-b83345500430",
      "X-Cursor-Streaming": "true",
      "X-Cursor-Timezone": "Europe/Istanbul",
      "X-New-Onboarding-Completed": "false",
      "X-Session-Id": "759ffb10-5b7e-45c9-bdce-f2500336ca66",
      Connection: "close",
    };

    try {
      // API isteği gönder
      const response = await fetch("https://api2.cursor.sh/aiserver.v1.AuthService/GetEmail", {
        method: "POST",
        headers: headers,
        body: "",
      });
      // Cevabı kontrol et
      return response.status === 200;
    } catch (error) {
      console.error("Cursor API isteği sırasında hata:", error);
      // Hata durumunda da geçersiz kabul edelim veya özel bir durum yönetimi yapılabilir
      return false;
    }
  }

  // Sonuç elementi oluşturan yardımcı fonksiyon
  function createCursorCheckResultItem(text, type, accountData) {
    const resultItem = document.createElement("div");
    resultItem.className = `cursor-check-result-item ${type} text-sm p-2 mb-1 rounded`; // Tailwind sınıfları eklendi
    resultItem.innerHTML = text;

    // Geçersizse ve kopyala butonu yoksa ekle
    if (type === "invalid" && accountData && !resultItem.querySelector("button")) {
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-cursor-check-btn btn btn-outline btn-outline-red text-xs px-2 py-1 ml-2 rounded";
      copyBtn.textContent = "Kopyala";
      copyBtn.dataset.email = accountData.email;
      copyBtn.dataset.token = accountData.token;
      resultItem.appendChild(copyBtn);
    }

    // Stil ayarları
    if (type === "valid") {
      resultItem.classList.add("bg-green-900/30", "border-l-4", "border-green-500");
    } else if (type === "invalid") {
      resultItem.classList.add("bg-red-900/30", "border-l-4", "border-red-500");
    } else if (type === "loading") {
      resultItem.classList.add("bg-blue-900/30", "border-l-4", "border-blue-500", "animate-pulse");
    }
    return resultItem;
  }

  // Durum mesajını gösteren yardımcı fonksiyon
  function showCursorCheckStatus(message, type) {
    cursorCheckStatusBar.innerHTML = message;
    cursorCheckStatusBar.className = "mt-3 text-center text-sm text-gray-400 bg-gray-800 p-2 rounded-md min-h-[36px]"; // Reset styles
    if (type === "error") {
      cursorCheckStatusBar.classList.add("text-red-400");
    } else if (type === "info") {
      cursorCheckStatusBar.classList.add("text-blue-400");
    } else if (type === "success") {
      cursorCheckStatusBar.classList.add("text-green-400");
    }
  }

  // Sayaçları güncelleyen yardımcı fonksiyon
  function updateCursorCheckCounts(total, valid, invalid) {
    cursorCheckTotalCountElement.textContent = total;
    cursorCheckValidCountElement.textContent = valid;
    cursorCheckInvalidCountElement.textContent = invalid;
  }

  // Final sonuçlarını gösteren yardımcı fonksiyon
  function showFinalCursorCheckResult(invalidAccountsData, totalCount) {
    const invalidCount = invalidAccountsData.length;
    const validCount = totalCount - invalidCount;

    let statusMessage = `Kontrol tamamlandı: ${validCount} geçerli, ${invalidCount} geçersiz.`;
    showCursorCheckStatus(statusMessage, invalidCount > 0 ? "info" : "success");

    // Eğer geçersiz hesap varsa, toplu kopyalama butonu ekle
    if (invalidCount > 0) {
      // Tüm geçersiz hesap verilerini formatla (email:token)
      const invalidDataString = invalidAccountsData.map((acc) => `${acc.email}:${acc.token}`).join("\n");

      // Toplu kopyalama butonu
      const copyAllInvalidBtn = document.createElement("button");
      copyAllInvalidBtn.innerHTML = `<i class="fas fa-copy mr-1"></i> ${invalidCount} Geçersiz Hesabı Kopyala (email:token)`;
      copyAllInvalidBtn.className = "btn btn-outline btn-outline-red text-xs px-3 py-1 mt-2 rounded"; // Tailwind sınıfları
      copyAllInvalidBtn.style.display = "inline-block"; // Butonun yanına sığması için

      // Butona tıklama işlevi
      copyAllInvalidBtn.addEventListener("click", () => {
        navigator.clipboard
          .writeText(invalidDataString)
          .then(() => {
            copyAllInvalidBtn.innerHTML = `<i class="fas fa-check mr-1"></i> Kopyalandı!`;
            copyAllInvalidBtn.disabled = true;
            setTimeout(() => {
              copyAllInvalidBtn.innerHTML = `<i class="fas fa-copy mr-1"></i> ${invalidCount} Geçersiz Hesabı Kopyala (email:token)`;
              copyAllInvalidBtn.disabled = false;
            }, 2500);
          })
          .catch((err) => {
            console.error("Kopyalama hatası:", err);
            copyAllInvalidBtn.textContent = "Kopyalama Başarısız!";
          });
      });

      // Durum çubuğuna butonu ekle (mevcut mesajın yanına)
      cursorCheckStatusBar.appendChild(document.createTextNode(" ")); // Boşluk ekle
      cursorCheckStatusBar.appendChild(copyAllInvalidBtn);
    }
  }

  // Sonuçlar alanındaki kopyalama butonları için olay dinleyicisi (event delegation)
  cursorCheckResultsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("copy-cursor-check-btn")) {
      const button = event.target;
      const email = button.dataset.email;
      const token = button.dataset.token;
      const copyText = `${email}:${token}`;

      navigator.clipboard
        .writeText(copyText)
        .then(() => {
          const originalText = button.innerHTML;
          button.innerHTML = '<i class="fas fa-check mr-1"></i> Kopyalandı!';
          button.disabled = true;
          setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
          }, 2000);
        })
        .catch((err) => {
          console.error("Kopyalama hatası:", err);
          button.textContent = "Hata!";
        });
    }
  });

  // Background script ile iletişim kurma
  chrome.runtime.sendMessage({ action: "dashboardOpened" });

  // Background script'ten gelen mesajları dinle
  chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === "accountAdded") {
      if (message.accountType === "codeium") {
        updateCodeiumAccountsList();
      } else if (message.accountType === "cursor") {
        updateCursorAccountsList();
      }
    }
  });

  // Sayfa yüklendiğinde hesap listelerini güncelle
  updateCodeiumAccountsList();
  updateCursorAccountsList();
  setInitialTabState(); // Başlangıç durumunu ayarla
});
