/**
 * Content Script - Sayfada çalışan script
 */

/**
 * Log paneli oluşturan ve yöneten sınıf
 */
class LogPanel {
  constructor() {
    this.panel = null;
    this.logContainer = null;
    this.isCollapsed = false;
    this.logQueue = [];
    this.isCreating = false;
    this.dragStartPos = { x: 0, y: 0 };
    this.panelPos = { x: 20, y: 20 };

    this.createPanel();
  }

  /**
   * Log paneli oluşturur
   */
  async createPanel() {
    if (this.panel || this.isCreating) return;
    this.isCreating = true;

    // Panel elementini oluştur
    const panel = document.createElement("div");
    panel.className = "automation-panel";
    panel.style.top = `${this.panelPos.y}px`;
    panel.style.right = `${this.panelPos.x}px`;

    // Panel içeriğini oluştur
    panel.innerHTML = `
      <div class="panel-header">
        <div class="panel-title">Otomasyon İşlemi</div>
        <div class="panel-controls">
          <button class="panel-button" id="collapseBtn" title="Küçült/Genişlet">▼</button>
          <button class="panel-button" id="closeBtn" title="Kapat">✕</button>
        </div>
      </div>
      <div class="panel-content">
        <div class="log-container"></div>
      </div>
    `;

    // Panel'i sayfaya ekle
    document.body.appendChild(panel);

    // Referansları sakla
    this.panel = panel;
    this.logContainer = panel.querySelector(".log-container");

    // Bekleyen log mesajlarını göster
    this.processLogQueue();

    // Event listener'lar
    this.addEventListeners();

    this.isCreating = false;
  }

  /**
   * Panel için event listener'ları ekler
   */
  addEventListeners() {
    if (!this.panel) return;

    // Collapse butonu
    const collapseBtn = this.panel.querySelector("#collapseBtn");
    collapseBtn.addEventListener("click", () => this.toggleCollapse());

    // Close butonu
    const closeBtn = this.panel.querySelector("#closeBtn");
    closeBtn.addEventListener("click", () => this.closePanel());

    // Sürükleme işlemi
    const header = this.panel.querySelector(".panel-header");
    header.addEventListener("mousedown", (e) => this.startDrag(e));
    document.addEventListener("mousemove", (e) => this.drag(e));
    document.addEventListener("mouseup", () => this.endDrag());
  }

  /**
   * Sürükleme işlemini başlatır
   * @param {MouseEvent} e - Mouse olayı
   */
  startDrag(e) {
    if (this.isCollapsed) return;

    this.isDragging = true;
    this.dragStartPos = {
      x: e.clientX,
      y: e.clientY,
    };
  }

  /**
   * Sürükleme işlemini gerçekleştirir
   * @param {MouseEvent} e - Mouse olayı
   */
  drag(e) {
    if (!this.isDragging) return;

    const deltaX = this.dragStartPos.x - e.clientX;
    const deltaY = this.dragStartPos.y - e.clientY;

    this.panelPos.x += deltaX;
    this.panelPos.y -= deltaY;

    // Sınırlar içinde tut
    this.panelPos.x = Math.max(20, Math.min(window.innerWidth - 320, this.panelPos.x));
    this.panelPos.y = Math.max(20, Math.min(window.innerHeight - 100, this.panelPos.y));

    this.panel.style.right = `${this.panelPos.x}px`;
    this.panel.style.top = `${this.panelPos.y}px`;

    this.dragStartPos = {
      x: e.clientX,
      y: e.clientY,
    };
  }

  /**
   * Sürükleme işlemini sonlandırır
   */
  endDrag() {
    this.isDragging = false;
  }

  /**
   * Panel'i küçültüp/genişletir
   */
  toggleCollapse() {
    if (!this.panel) return;

    this.isCollapsed = !this.isCollapsed;

    if (this.isCollapsed) {
      this.panel.classList.add("collapsed");
      this.panel.querySelector("#collapseBtn").textContent = "▲";
    } else {
      this.panel.classList.remove("collapsed");
      this.panel.querySelector("#collapseBtn").textContent = "▼";
    }
  }

  /**
   * Panel'i kapatır
   */
  closePanel() {
    if (!this.panel) return;

    document.body.removeChild(this.panel);
    this.panel = null;
    this.logContainer = null;
  }

  /**
   * Log mesajı ekler
   * @param {string} message - Log mesajı
   * @param {string} type - Log tipi (info, success, error, warning)
   */
  log(message, type = "info") {
    // Panel yoksa oluşturmayı bekleyen mesajları kuyruğa ekle
    if (!this.panel) {
      this.logQueue.push({ message, type });
      this.createPanel();
      return;
    }

    const logEntry = document.createElement("div");
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = message;

    this.logContainer.appendChild(logEntry);

    // Her log eklendiğinde otomatik olarak en alta scroll yap
    this.scrollToBottom();
  }

  /**
   * Log panelini en alta kaydırır
   */
  scrollToBottom() {
    if (this.logContainer) {
      // Doğrudan scrollTop ile kaydırma - daha güvenilir
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
  }

  /**
   * Bekleyen log mesajlarını işler
   */
  processLogQueue() {
    if (!this.logContainer) return;

    this.logQueue.forEach((item) => {
      this.log(item.message, item.type);
    });

    this.logQueue = [];
  }
}

// URL işlenmesini takip etmek için işlenmiş URL'leri tutacak nesne
const processedUrls = {
  // URL'leri ve o URL'nin işlendiği zaman damgasını saklayacak Map
  urlMap: new Map(),

  // URL işlendi mi?
  isProcessed: function (url, actionType) {
    const key = `${url}:${actionType}`;
    // URL işlendiyse ve son 10 saniye içinde işlendiyse true döndür
    if (this.urlMap.has(key)) {
      const timestamp = this.urlMap.get(key);
      const now = Date.now();
      const elapsed = now - timestamp;

      // Son 10 saniye içinde işlendiyse, tekrar işleme
      if (elapsed < 10000) {
        return true;
      }
    }
    return false;
  },

  // URL'yi işlenmiş olarak işaretle
  markAsProcessed: function (url, actionType) {
    const key = `${url}:${actionType}`;
    this.urlMap.set(key, Date.now());

    // 5 dakika sonra URL'yi temizle
    setTimeout(() => {
      this.urlMap.delete(key);
    }, 5 * 60 * 1000); // 5 dakika
  },

  // URL işleme durumunu temizle
  clearProcessedUrl: function (url) {
    // URL ile başlayan tüm kayıtları temizle
    for (const key of this.urlMap.keys()) {
      if (key.startsWith(url)) {
        this.urlMap.delete(key);
      }
    }
  },
};

// Eklenti başlatıldı mı kontrolü
let isExtensionInitialized = false;

// Singleton log panel'i oluştur
const logPanel = new LogPanel();

// Form filler instance'ını güncelleyen fonksiyon
function updateFormFiller() {
  if (window.formFiller) {
    // formFiller'a logger fonksiyonu ekle
    window.formFiller.logger = (message, type = "info") => {
      logPanel.log(message, type);
      console.log(`[${type}]`, message);
    };
  }

  // accountDB'ye de logger fonksiyonu ekle
  if (window.accountDB) {
    window.accountDB.logger = (message, type = "info") => {
      logPanel.log(`[DB] ${message}`, type);
      console.log(`[DB][${type}]`, message);
    };
  }
}

// URL değişikliklerini takip et
function setupUrlWatcher() {
  if (window.automationHelpers && window.automationHelpers.watchForUrlChanges) {
    window.automationHelpers.watchForUrlChanges((url) => {
      logPanel.log(`Sayfa değişti: ${url}`, "info");

      // URL tipine göre işlemler
      processUrl(url, "urlWatcher");
    });
  }
}

// URL işleme fonksiyonu - hem iç hem dış kaynaklardan gelen URL değişikliklerinde çağrılır
function processUrl(url, source = "unknown") {
  logPanel.log(`URL işlemi başlatılıyor (kaynak: ${source}): ${url}`, "info");

  // Codeium kayıt sayfası
  if (url.includes("windsurf.com/account/register")) {
    // Sayfanın hangi adımda olduğunu anla
    logPanel.log("Windsurf kayıt sayfası tespit edildi, sayfa analiz ediliyor...", "info");

    // Sayfa tipini tespit için DOM kontrolü yapalım
    setTimeout(() => {
      // Sayfa tamamen yüklensin
      if (document.readyState !== "complete") {
        logPanel.log("Sayfa hala yükleniyor, DOM kontrolleri için bekleniyor...", "warning");
        return;
      }

      // Sayfa analizini yap
      const inputTypes = {};
      document.querySelectorAll("input").forEach((input) => {
        const type = input.type || "unknown";
        inputTypes[type] = (inputTypes[type] || 0) + 1;
        logPanel.log(`Bulunan input: id=${input.id}, name=${input.name}, type=${input.type}`, "info");
      });

      logPanel.log(`Sayfada bulunan input tipleri: ${JSON.stringify(inputTypes)}`, "info");

      // Şifre alanı var mı kontrol et
      // Şifre alanı direkt olarak mevcut olabilir veya dinamik olarak yüklenebilir
      const hasPasswordField = document.querySelector("#password") !== null || document.querySelector("[type='password']") !== null;

      // Şifre sayfası ise
      if (hasPasswordField) {
        const actionType = "codeium-password";

        if (!processedUrls.isProcessed(url, actionType)) {
          logPanel.log("Codeium şifre sayfası tespit edildi", "success");
          processedUrls.markAsProcessed(url, actionType);

          if (window.formFiller) {
            logPanel.log("Şifre form işleyicisi başlatılıyor...", "info");
            window.formFiller.fillCodeiumPasswordStep();
          }
        }
      }
      // Normal kayıt sayfası ise
      else {
        const actionType = "codeium-registration";

        if (!processedUrls.isProcessed(url, actionType)) {
          logPanel.log("Codeium kayıt formu tespit edildi", "info");
          processedUrls.markAsProcessed(url, actionType);

          if (window.formFiller) {
            window.formFiller.fillCodeiumRegistrationForm();
          }

          // Şifre sayfasının dinamik olarak yüklenmesi için bir DOM gözlemcisi başlat
          setupPasswordPageObserver();
        }
      }
    }, 1000); // Sayfanın yüklenmesi için biraz bekleyelim
  }

  // Codeium onboarding sayfası
  else if (url.includes("windsurf.com/account/onboarding")) {
    const actionType = "codeium-onboarding";

    if (!processedUrls.isProcessed(url, actionType)) {
      logPanel.log("Codeium onboarding sayfası tespit edildi", "info");
      processedUrls.markAsProcessed(url, actionType);

      if (window.formFiller) {
        window.formFiller.extractCodeiumTokens().then(() => {
          // İşlem tamamlandıktan sonra verileri temizle ve kayıt sayfasına dön
          setTimeout(() => {
            logPanel.log("Token verileri alındı, tarayıcı verileri temizleniyor...", "info");

            // Form doldurma işlem geçmişini temizle
            if (window.formFiller.resetProcessedFields) {
              window.formFiller.resetProcessedFields();
            }

            // İşlenen URL'leri temizle
            processedUrls.clearProcessedUrl(url);

            window.automationHelpers
              .clearBrowserData()
              .then(() => {
                // Veri temizlemeyi tamamlamak için biraz bekle
                setTimeout(() => {
                  // Codeium çerezlerinin temizlenip temizlenmediğini kontrol et
                  chrome.runtime.sendMessage(
                    {
                      action: "getAllCookies",
                      details: { domain: "windsurf.com" },
                    },
                    (response) => {
                      if (response && response.success && response.cookies && response.cookies.length > 0) {
                        logPanel.log(`Uyarı: Hala ${response.cookies.length} çerez bulundu, tekrar temizleme deneniyor...`, "warning");

                        // Tekrar temizlemeyi dene
                        window.automationHelpers.clearBrowserData().then(() => {
                          logPanel.log("Tekrar temizleme tamamlandı, yönlendiriliyor...", "info");
                          redirectToRegistration();
                        });
                      } else {
                        logPanel.log("Çerezler başarıyla temizlendi, yönlendiriliyor...", "success");
                        redirectToRegistration();
                      }
                    }
                  );
                }, 1000);

                function redirectToRegistration() {
                  logPanel.log("Veriler temizlendi, kayıt sayfasına yönlendiriliyor...", "success");
                  chrome.runtime.sendMessage({
                    action: "clearAndRedirect",
                    tabId: chrome.runtime.id,
                    redirectUrl: "https://windsurf.com/account/register",
                  });
                }
              })
              .catch((error) => {
                logPanel.log(`Veri temizleme hatası: ${error.message}`, "error");

                // Hata olsa bile yönlendirmeyi dene
                chrome.runtime.sendMessage({
                  action: "clearAndRedirect",
                  tabId: chrome.runtime.id,
                  redirectUrl: "https://windsurf.com/account/register",
                });
              });
          }, 2000);
        });
      }
    }
  }
  // Cursor kayıt sayfası
  else if (url.includes("authenticator.cursor.sh/sign-up") && !document.querySelector('input[name="password"]')) {
    const actionType = "cursor-registration";

    if (!processedUrls.isProcessed(url, actionType)) {
      logPanel.log("Cursor kayıt sayfası tespit edildi", "info");
      processedUrls.markAsProcessed(url, actionType);

      if (window.formFiller) {
        window.formFiller.fillCursorRegistrationForm();
      }
    }
  }
  // Cursor şifre sayfası
  else if (url.includes("authenticator.cursor.sh/sign-up") && document.querySelector('input[name="password"]')) {
    const actionType = "cursor-password";

    if (!processedUrls.isProcessed(url, actionType)) {
      logPanel.log("Cursor şifre sayfası tespit edildi", "info");
      processedUrls.markAsProcessed(url, actionType);

      if (window.formFiller) {
        window.formFiller.fillCursorPasswordStep();
      }
    }
  }
  // Cursor ana sayfası
  else if (url === "https://www.cursor.com/" || url === "https://www.cursor.com") {
    const actionType = "cursor-main";

    if (!processedUrls.isProcessed(url, actionType)) {
      logPanel.log("Ana Sayfaya Ulaşıldı", "info");
      processedUrls.markAsProcessed(url, actionType);
    
      // Önce settings sayfasına yönlendir
      logPanel.log("Cursor settings sayfasına yönlendiriliyor...", "info");
      chrome.runtime.sendMessage({
        action: "clearAndRedirect",
        tabId: chrome.runtime.id,
        redirectUrl: "https://www.cursor.com/settings",
      });
    }
  }
  // Cursor loginDeepPage sayfası - Token giriş sayfası
  else if (url.includes("cursor.com/loginDeepPage")) {
    const actionType = "cursor-token-input";

    if (!processedUrls.isProcessed(url, actionType)) {
      logPanel.log("Cursor loginDeepPage sayfası tespit edildi", "info");
      processedUrls.markAsProcessed(url, actionType);

      // Token input ve buton elementlerini oluştur
      setTimeout(() => {
        // Sayfanın tamamen yüklenmesini bekle
        logPanel.log("Token girişi için form oluşturuluyor...", "info");

        // Konteyner oluştur
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "50%";
        container.style.left = "50%";
        container.style.transform = "translate(-50%, -50%)";
        container.style.backgroundColor = "#1e1e1e";
        container.style.padding = "20px";
        container.style.borderRadius = "8px";
        container.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
        container.style.zIndex = "9999";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "15px";
        container.style.minWidth = "360px";

        // Form başlığı
        const heading = document.createElement("h2");
        heading.textContent = "Cursor Token Girişi";
        heading.style.margin = "0 0 10px 0";
        heading.style.color = "#ffffff";
        heading.style.fontSize = "18px";
        heading.style.textAlign = "center";

        // Açıklama metni
        const description = document.createElement("p");
        description.textContent = "Lütfen Cursor oturum token'inizi girin";
        description.style.margin = "0 0 15px 0";
        description.style.color = "#cccccc";
        description.style.fontSize = "14px";
        description.style.textAlign = "center";

        // Input alanı
        const input = document.createElement("input");
        input.id = "cursorTokenInput";
        input.type = "text";
        input.placeholder = "WorkosCursorSessionToken değeri";
        input.style.padding = "10px";
        input.style.borderRadius = "4px";
        input.style.border = "1px solid #555";
        input.style.backgroundColor = "#2a2a2a";
        input.style.color = "#ffffff";
        input.style.width = "100%";
        input.style.boxSizing = "border-box";

        // Kaydet butonu
        const saveButton = document.createElement("button");
        saveButton.textContent = "Token'ı Kaydet";
        saveButton.style.padding = "10px";
        saveButton.style.borderRadius = "4px";
        saveButton.style.border = "none";
        saveButton.style.backgroundColor = "#007acc";
        saveButton.style.color = "#ffffff";
        saveButton.style.cursor = "pointer";
        saveButton.style.width = "100%";
        saveButton.style.fontWeight = "bold";

        // Durum mesajı için alan
        const statusMsg = document.createElement("div");
        statusMsg.id = "tokenStatusMsg";
        statusMsg.style.marginTop = "10px";
        statusMsg.style.color = "#cccccc";
        statusMsg.style.fontSize = "14px";
        statusMsg.style.textAlign = "center";
        statusMsg.style.display = "none";

        // Buton tıklama olayı
        saveButton.addEventListener("click", async () => {
          const tokenValue = input.value.trim();

          if (!tokenValue) {
            statusMsg.textContent = "Lütfen geçerli bir token girin!";
            statusMsg.style.color = "#ff6b6b";
            statusMsg.style.display = "block";
            return;
          }

          statusMsg.textContent = "Token doğrulanıyor...";
          statusMsg.style.color = "#cccccc";
          statusMsg.style.display = "block";

          try {
            // Token geçerliliğini test et
            if (window.formFiller) {
              const isValid = await window.formFiller.testCursorToken(tokenValue);

              if (isValid) {
                statusMsg.textContent = "Token geçerli! Kaydediliyor...";
                statusMsg.style.color = "#4caf50";

                // Token'ı kaydet - saveManualToken fonksiyonunu kullanarak
                await window.formFiller.saveManualToken(tokenValue);

                statusMsg.textContent = "Token başarıyla kaydedildi! Yönlendiriliyor...";

                // Form doldurma işlem geçmişini temizle
                if (window.formFiller.resetProcessedFields) {
                  window.formFiller.resetProcessedFields();
                }

                // İşlenen URL'leri temizle
                processedUrls.clearProcessedUrl(url);

                // Kullanıcıyı kayıt sayfasına yönlendir
                setTimeout(() => {
                  window.location.href = "https://authenticator.cursor.sh/sign-up";
                }, 2000);
              } else {
                statusMsg.textContent = "Token geçersiz! Lütfen doğru bir token girin.";
                statusMsg.style.color = "#ff6b6b";
              }
            } else {
              statusMsg.textContent = "Form doldurma servisi bulunamadı!";
              statusMsg.style.color = "#ff6b6b";
            }
          } catch (error) {
            statusMsg.textContent = `Hata: ${error.message}`;
            statusMsg.style.color = "#ff6b6b";
          }
        });

        // Elementleri konteyner'a ekle
        container.appendChild(heading);
        container.appendChild(description);
        container.appendChild(input);
        container.appendChild(saveButton);
        container.appendChild(statusMsg);

        // Konteyner'ı sayfaya ekle
        document.body.appendChild(container);

        logPanel.log("Token giriş formu oluşturuldu", "success");
      }, 1000);
    }
  }
  // Cursor settings sayfası - Eskiden Token alıyordu ama artık farklı bir mantıkla çalışıyor
  else if (url === "https://www.cursor.com/settings") {
    const actionType = "cursor-settings";

    if (!processedUrls.isProcessed(url, actionType)) {
      logPanel.log("Cursor settings sayfası tespit edildi", "info");
      processedUrls.markAsProcessed(url, actionType);

      // Token alma işlemini yapma, kullanıcı loginDeepPage'e yönlendirilecek
      logPanel.log("Cursor loginDeepPage sayfasına yönlendiriliyor...", "info");
      setTimeout(() => {
        chrome.runtime.sendMessage({
          action: "clearAndRedirect",
          tabId: chrome.runtime.id,
          redirectUrl: "https://www.cursor.com/loginDeepPage",
        });
      }, 1000);
    }
  }
}

// Şifre sayfasının dinamik olarak yüklenip yüklenmediğini kontrol eden gözlemci
function setupPasswordPageObserver() {
  logPanel.log("Şifre sayfası gözlemcisi kuruluyor...", "info");

  // Eğer varsa önceki gözlemciyi temizle
  if (window.passwordPageObserver) {
    window.passwordPageObserver.disconnect();
  }

  // Yeni bir gözlemci oluştur
  window.passwordPageObserver = new MutationObserver((mutations) => {
    // Şifre alanının varlığını kontrol et
    const passwordField = document.querySelector("#password");

    if (passwordField) {
      logPanel.log("Şifre sayfasına geçiş tespit edildi", "success");

      // Sayfa URL'si değişmemiş olsa bile şifre sayfasını işle
      processUrl(window.location.href, "passwordObserver");

      // Gözlemciyi durdur
      window.passwordPageObserver.disconnect();
      window.passwordPageObserver = null;
    }
  });

  // Tüm DOM değişikliklerini izle
  window.passwordPageObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["id", "type"],
  });

  logPanel.log("Şifre sayfası gözlemcisi başlatıldı", "info");
}

// Temizleme butonu ekleyen fonksiyon
function addClearDataButton() {
  // Düğme zaten varsa ekleme
  if (document.getElementById("clearCookiesBtn")) {
    return;
  }

  // Sayfa yüklendikten sonra çalış
  const button = document.createElement("button");
  button.id = "clearCookiesBtn";
  button.innerText = "Verileri Temizle ve Yeniden Başla";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.backgroundColor = "#e74c3c";
  button.style.color = "white";
  button.style.padding = "10px 15px";
  button.style.borderRadius = "5px";
  button.style.border = "none";
  button.style.cursor = "pointer";
  button.style.zIndex = "9999";

  button.addEventListener("click", async () => {
    logPanel.log("Tarayıcı verileri temizleniyor...", "info");

    try {
      // Form doldurma işlem geçmişini temizle
      if (window.formFiller && window.formFiller.resetProcessedFields) {
        window.formFiller.resetProcessedFields();
      }

      // İşlenen URL'leri temizle
      processedUrls.clearProcessedUrl(window.location.href);

      await window.automationHelpers.clearBrowserData();

      logPanel.log("Veriler temizlendi, sayfa yeniden yükleniyor...", "success");

      // Sayfaya özel yönlendirme
      if (window.location.href.includes("windsurf.com")) {
        window.location.href = "https://windsurf.com/account/register";
      } else if (window.location.href.includes("cursor.sh") || window.location.href.includes("cursor.com")) {
        window.location.href = "https://authenticator.cursor.sh/sign-up";
      } else {
        window.location.reload();
      }
    } catch (error) {
      logPanel.log(`Veri temizleme hatası: ${error.message}`, "error");
    }
  });

  document.body.appendChild(button);
}

// Eklentiyi başlatır
function initializeExtension() {
  // Eklenti zaten başlatıldıysa tekrar başlatma
  if (isExtensionInitialized) {
    return;
  }

  logPanel.log("Eklenti başlatılıyor...", "info");

  // Form filler instance'ını güncelle
  updateFormFiller();

  // Temizleme butonu ekle
  setTimeout(addClearDataButton, 1000);

  // URL değişikliklerini izle
  setupUrlWatcher();

  // Mevcut URL'yi işle
  processUrl(window.location.href, "initialization");

  // Eklentiyi başlatıldı olarak işaretle
  isExtensionInitialized = true;

  logPanel.log("Eklenti başlatıldı", "success");
}

// Background script'ten gelen mesajları dinleme
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // URL değişikliği bildirimi - background script'ten
  if (message.action === "urlChanged") {
    if (message.url) {
      processUrl(message.url, "background");
    }
    sendResponse({ status: "ok" });
  }

  // Codeium Access Token oluşturma
  if (message.action === "generateCodeiumAccessTokens") {
    try {
      logPanel.log("Access token oluşturma isteği alındı", "info");

      if (window.accountDB) {
        logPanel.log("AccountDB kullanılarak token'ler oluşturuluyor...", "info");

        // Token oluşturma işlemini başlat
        window.accountDB
          .generateAllCodeiumAccessTokens()
          .then((tokens) => {
            logPanel.log(`${tokens.length} token başarıyla oluşturuldu`, "success");
            sendResponse({ tokens: tokens });
          })
          .catch((error) => {
            logPanel.log(`Token oluşturma hatası: ${error.message}`, "error");
            sendResponse({ error: "Token oluşturma hatası", message: error.message });
          });
      } else {
        logPanel.log("AccountDB mevcut değil", "error");
        sendResponse({ error: "AccountDB bulunamadı" });
      }

      return true; // Asenkron yanıt için true döndür
    } catch (error) {
      logPanel.log(`Token oluşturma istisna hatası: ${error.message}`, "error");
      sendResponse({ error: "İşlem hatası", message: error.message });
      return false;
    }
  }

  // Doğrudan komut mesajları - bunları hala desteklemek istiyoruz (manuel test için)
  if (message.action === "fillCodeiumRegistrationForm") {
    if (window.formFiller) {
      window.formFiller.fillCodeiumRegistrationForm();
    }
    sendResponse({ status: "ok" });
  }

  if (message.action === "fillCodeiumPasswordStep") {
    if (window.formFiller) {
      window.formFiller.fillCodeiumPasswordStep();
    }
    sendResponse({ status: "ok" });
  }

  if (message.action === "extractCodeiumTokens") {
    if (window.formFiller) {
      window.formFiller.extractCodeiumTokens();
    }
    sendResponse({ status: "ok" });
  }

  if (message.action === "fillCursorRegistrationForm") {
    if (window.formFiller) {
      window.formFiller.fillCursorRegistrationForm();
    }
    sendResponse({ status: "ok" });
  }

  if (message.action === "fillCursorPasswordStep") {
    if (window.formFiller) {
      window.formFiller.fillCursorPasswordStep();
    }
    sendResponse({ status: "ok" });
  }

  if (message.action === "saveCursorToken") {
    if (window.formFiller) {
      window.formFiller.saveCursorToken();
    }
    sendResponse({ status: "ok" });
  }
});

// DOM yüklendiğinde başlat
document.addEventListener("DOMContentLoaded", initializeExtension);

// Sayfa zaten yüklendiyse başlat
if (document.readyState === "complete" || document.readyState === "interactive") {
  initializeExtension();
}
