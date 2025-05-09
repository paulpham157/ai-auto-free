document.addEventListener("DOMContentLoaded", function () {
  // Tab değiştirme fonksiyonalitesi
  const codeiumTab = document.getElementById("codeiumTab");
  const cursorTab = document.getElementById("cursorTab");
  const codeiumContent = document.getElementById("codeiumContent");
  const cursorContent = document.getElementById("cursorContent");

  // Auto-scroll kontrolü
  let autoScroll = false;
  let logCount = 0;
  const maxLogEntries = 100; // Maksimum log sayısı

  codeiumTab.addEventListener("click", function () {
    codeiumTab.className = "px-4 py-2 text-blue-400 border-b-2 border-blue-400";
    cursorTab.className = "px-4 py-2 text-gray-400";
    codeiumContent.classList.remove("hidden");
    cursorContent.classList.add("hidden");
  });

  cursorTab.addEventListener("click", function () {
    cursorTab.className = "px-4 py-2 text-green-400 border-b-2 border-green-400";
    codeiumTab.className = "px-4 py-2 text-gray-400";
    cursorContent.classList.remove("hidden");
    codeiumContent.classList.add("hidden");
  });

  // Codeium hesaplarını temizleme butonu
  document.getElementById("clearAllCodeium").addEventListener("click", function () {
    if (confirm("Tüm Codeium hesaplarını silmek istediğinize emin misiniz?")) {
      chrome.storage.local.set({ codeiumAccounts: [] }, function () {
        updateCodeiumAccountsList();
        logMessage("Tüm Codeium hesapları silindi.", "success");
      });
    }
  });

  // Cursor hesaplarını temizleme butonu
  document.getElementById("clearAllCursor").addEventListener("click", function () {
    if (confirm("Tüm Cursor hesaplarını silmek istediğinize emin misiniz?")) {
      chrome.storage.local.set({ cursorAccounts: [] }, function () {
        updateCursorAccountsList();
        logMessage("Tüm Cursor hesapları silindi.", "success");
      });
    }
  });

  // Auto-scroll toggle butonu oluştur
  const logContainer = document.getElementById("logMessages");
  const logControls = document.createElement("div");
  logControls.className = "flex justify-between items-center mb-2 p-2 bg-gray-800 rounded";

  const logTitle = document.createElement("span");
  logTitle.textContent = "İşlem Kayıtları";
  logTitle.className = "text-sm font-semibold text-gray-300";

  const controlButtons = document.createElement("div");
  controlButtons.className = "flex gap-2";

  const autoScrollToggle = document.createElement("button");
  autoScrollToggle.textContent = "Otomatik Kaydır: Kapalı";
  autoScrollToggle.className = "text-xs py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded";
  autoScrollToggle.addEventListener("click", function () {
    autoScroll = !autoScroll;
    this.textContent = autoScroll ? "Otomatik Kaydır: Açık" : "Otomatik Kaydır: Kapalı";
    this.className = autoScroll ? "text-xs py-1 px-2 bg-blue-700 hover:bg-blue-600 rounded" : "text-xs py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded";

    if (autoScroll) {
      scrollToBottom();
    }
  });

  const clearLogsBtn = document.createElement("button");
  clearLogsBtn.textContent = "Kayıtları Temizle";
  clearLogsBtn.className = "text-xs py-1 px-2 bg-red-700 hover:bg-red-600 rounded";
  clearLogsBtn.addEventListener("click", function () {
    logContainer.innerHTML = "";
    logCount = 0;
  });

  controlButtons.appendChild(autoScrollToggle);
  controlButtons.appendChild(clearLogsBtn);
  logControls.appendChild(logTitle);
  logControls.appendChild(controlButtons);

  // Log container'ın üstüne ekle
  logContainer.parentNode.insertBefore(logControls, logContainer);

  // Log container'a stil ekle
  logContainer.style.maxHeight = "150px";
  logContainer.style.overflowY = "auto";
  logContainer.style.backgroundColor = "#1e1e2e";
  logContainer.style.padding = "8px";
  logContainer.style.borderRadius = "4px";
  logContainer.style.fontSize = "12px";
  logContainer.style.fontFamily = "monospace";

  // Log mesajlarını en alta kaydırır
  function scrollToBottom() {
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  // Codeium tüm hesapları kopyalama butonu
  document.getElementById("copyAllCodeium").addEventListener("click", function () {
    chrome.storage.local.get("codeiumAccounts", function (result) {
      const accounts = result.codeiumAccounts || [];

      if (accounts.length === 0) {
        logMessage("Kopyalanacak Codeium hesabı bulunamadı.", "warning");
        return;
      }

      let allText = "";

      accounts.forEach((account) => {
        if (account.apiKey) allText += `${account.apiKey}\n`;
        if (account.refreshToken) allText += `${account.refreshToken}\n`;
        if (account.email) allText += `${account.email}\n`;
        if (account.password) allText += `${account.password}\n`;
        allText += "\n"; // Hesaplar arasında boşluk
      });

      navigator.clipboard.writeText(allText).then(
        function () {
          logMessage(`${accounts.length} Codeium hesabı toplu olarak kopyalandı.`, "success");
        },
        function () {
          logMessage("Toplu kopyalama işlemi başarısız oldu.", "error");
        }
      );
    });
  });

  // Cursor tüm hesapları kopyalama butonu
  document.getElementById("copyAllCursor").addEventListener("click", function () {
    chrome.storage.local.get("cursorAccounts", function (result) {
      const accounts = result.cursorAccounts || [];

      if (accounts.length === 0) {
        logMessage("Kopyalanacak Cursor hesabı bulunamadı.", "warning");
        return;
      }

      let allText = "";

      accounts.forEach((account) => {
        if (account.token) allText += `${account.token}\n`;
        if (account.email) allText += `${account.email}\n`;
        if (account.password) allText += `${account.password}\n`;
        allText += "\n"; // Hesaplar arasında boşluk
      });

      navigator.clipboard.writeText(allText).then(
        function () {
          logMessage(`${accounts.length} Cursor hesabı toplu olarak kopyalandı.`, "success");
        },
        function () {
          logMessage("Toplu kopyalama işlemi başarısız oldu.", "error");
        }
      );
    });
  });

  // Codeium access token oluştur butonu
  document.getElementById("generateAccessTokens").addEventListener("click", function () {
    const container = document.getElementById("accessTokenContainer");
    container.innerHTML = '<div class="text-center py-2"><div class="loader"></div> Access token\'lar oluşturuluyor...</div>';

    // Gizli container'ı görünür yap
    container.classList.remove("hidden");

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "generateCodeiumAccessTokens" }, function (response) {
        if (response && response.tokens) {
          displayAccessTokens(response.tokens);
        } else {
          container.innerHTML = '<div class="text-red-400 text-center py-2">Token oluşturulamadı. Lütfen daha sonra tekrar deneyin.</div>';
        }
      });
    });
  });

  // Access Token'ları görüntüleme
  function displayAccessTokens(tokens) {
    const container = document.getElementById("accessTokenContainer");

    if (tokens.length === 0) {
      container.innerHTML = '<div class="text-yellow-400 text-center py-2">Hiç token oluşturulamadı. Geçerli API Key ve Refresh Token olan hesaplar bulunamadı.</div>';
      return;
    }

    let html = '<h3 class="text-blue-400 font-medium text-sm mb-2">Oluşturulan Access Token\'lar</h3>';

    tokens.forEach((token) => {
      html += `
        <div class="access-token-card bg-gray-800 rounded p-2 mb-2">
          <div class="text-xs text-blue-300 mb-1">${token.email}</div>
          <div class="text-xs text-gray-400 overflow-hidden overflow-ellipsis">${token.accessToken}</div>
          <button class="copy-token w-full mt-1 bg-blue-800 hover:bg-blue-700 text-xs py-1 rounded"
                  data-token="${token.accessToken}">
            Kopyala
          </button>
        </div>
      `;
    });

    // Tüm token'ları kopyalama butonu
    html += `
      <button id="copyAllTokens" class="w-full mt-2 bg-blue-700 hover:bg-blue-600 text-xs py-1 rounded">
        Tüm Token'ları Kopyala
      </button>
      <button id="closeTokens" class="w-full mt-1 bg-gray-700 hover:bg-gray-600 text-xs py-1 rounded">
        Kapat
      </button>
    `;

    container.innerHTML = html;

    // Token kopyalama butonlarına event listener ekle
    document.querySelectorAll(".copy-token").forEach((button) => {
      button.addEventListener("click", function () {
        const token = this.getAttribute("data-token");
        navigator.clipboard.writeText(token).then(
          function () {
            logMessage("Token kopyalandı.", "success");
          },
          function () {
            logMessage("Token kopyalama başarısız oldu.", "error");
          }
        );
      });
    });

    // Tüm token'ları kopyalama butonu
    document.getElementById("copyAllTokens").addEventListener("click", function () {
      let allTokens = tokens.map((t) => t.accessToken).join("\n");
      navigator.clipboard.writeText(allTokens).then(
        function () {
          logMessage(`${tokens.length} token toplu olarak kopyalandı.`, "success");
        },
        function () {
          logMessage("Toplu token kopyalama başarısız oldu.", "error");
        }
      );
    });

    // Kapat butonu
    document.getElementById("closeTokens").addEventListener("click", function () {
      container.classList.add("hidden");
    });
  }

  // Hesap listelerini güncelleme fonksiyonları
  function updateCodeiumAccountsList() {
    const accountsContainer = document.getElementById("codeiumAccounts");
    chrome.storage.local.get("codeiumAccounts", function (result) {
      const accounts = result.codeiumAccounts || [];

      if (accounts.length === 0) {
        accountsContainer.innerHTML = '<div class="text-gray-400 text-center py-4">Henüz kayıtlı Codeium hesabı yok</div>';
        return;
      }

      let html = `<div class="bg-gray-800 p-2 rounded-t mb-2 text-gray-300 text-xs font-semibold">Toplam ${accounts.length} Codeium hesabı</div>`;

      accounts.forEach((account, index) => {
        html += `
          <div class="account-card bg-gray-700 rounded-lg p-3 mb-3 border-l-4 border-blue-500">
            <div class="flex justify-between items-center mb-2">
              <span class="text-blue-300 font-semibold">${account.email || "Email yok"}</span>
              <button class="delete-account text-xs px-2 py-1 bg-red-800 hover:bg-red-700 text-white rounded" data-type="codeium" data-index="${index}">Sil</button>
            </div>
            <div class="text-xs text-gray-400 mb-1 truncate">
              <span class="text-gray-300 font-medium">API Key:</span> ${account.apiKey ? account.apiKey.substring(0, 15) + "..." : "Yok"}
            </div>
            <div class="text-xs text-gray-400 mb-1 truncate">
              <span class="text-gray-300 font-medium">Refresh Token:</span> ${account.refreshToken ? account.refreshToken.substring(0, 15) + "..." : "Yok"}
            </div>
            <div class="text-xs text-gray-400 truncate">
              <span class="text-gray-300 font-medium">Şifre:</span> ${account.password || "Yok"}
            </div>
            <button class="copy-data w-full mt-2 bg-blue-800 hover:bg-blue-700 text-xs py-1 rounded" data-type="codeium" data-index="${index}">
              Verileri Kopyala
            </button>
          </div>
        `;
      });

      accountsContainer.innerHTML = html;

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
    const accountsContainer = document.getElementById("cursorAccounts");
    chrome.storage.local.get("cursorAccounts", function (result) {
      const accounts = result.cursorAccounts || [];

      if (accounts.length === 0) {
        accountsContainer.innerHTML = '<div class="text-gray-400 text-center py-4">Henüz kayıtlı Cursor hesabı yok</div>';
        return;
      }

      let html = `<div class="bg-gray-800 p-2 rounded-t mb-2 text-gray-300 text-xs font-semibold">Toplam ${accounts.length} Cursor hesabı</div>`;

      accounts.forEach((account, index) => {
        html += `
          <div class="account-card bg-gray-700 rounded-lg p-3 mb-3 border-l-4 border-green-500">
            <div class="flex justify-between items-center mb-2">
              <span class="text-green-300 font-semibold">${account.email || "Email yok"}</span>
              <button class="delete-account text-xs px-2 py-1 bg-red-800 hover:bg-red-700 text-white rounded" data-type="cursor" data-index="${index}">Sil</button>
            </div>
            <div class="text-xs text-gray-400 mb-1 truncate">
              <span class="text-gray-300 font-medium">Token:</span> ${account.token ? account.token.substring(0, 15) + "..." : "Yok"}
            </div>
            <div class="text-xs text-gray-400 truncate">
              <span class="text-gray-300 font-medium">Şifre:</span> ${account.password || "Yok"}
            </div>
            <button class="copy-data w-full mt-2 bg-green-800 hover:bg-green-700 text-xs py-1 rounded" data-type="cursor" data-index="${index}">
              Verileri Kopyala
            </button>
          </div>
        `;
      });

      accountsContainer.innerHTML = html;

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
    const type = e.target.dataset.type;
    const index = parseInt(e.target.dataset.index);

    const storageKey = type === "codeium" ? "codeiumAccounts" : "cursorAccounts";

    chrome.storage.local.get(storageKey, function (result) {
      const accounts = result[storageKey] || [];
      if (index >= 0 && index < accounts.length) {
        const accountEmail = accounts[index].email;
        accounts.splice(index, 1);

        chrome.storage.local.set({ [storageKey]: accounts }, function () {
          if (type === "codeium") {
            updateCodeiumAccountsList();
          } else {
            updateCursorAccountsList();
          }
          logMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} hesabı silindi: ${accountEmail || "Email yok"}`, "success");
        });
      }
    });
  }

  // Hesap verilerini kopyalama fonksiyonu
  function copyAccountData(e) {
    const type = e.target.dataset.type;
    const index = parseInt(e.target.dataset.index);

    const storageKey = type === "codeium" ? "codeiumAccounts" : "cursorAccounts";

    chrome.storage.local.get(storageKey, function (result) {
      const accounts = result[storageKey] || [];
      if (index >= 0 && index < accounts.length) {
        const account = accounts[index];
        let textToCopy = "";

        if (type === "codeium") {
          textToCopy = `${account.apiKey || "API Key yok"}\n${account.refreshToken || "Refresh Token yok"}\n${account.email || "Email yok"}\n${account.password || "Şifre yok"}`;
        } else {
          textToCopy = `${account.token || "Token yok"}\n${account.email || "Email yok"}\n${account.password || "Şifre yok"}`;
        }

        navigator.clipboard.writeText(textToCopy).then(
          function () {
            logMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} hesap verileri kopyalandı.`, "success");
          },
          function () {
            logMessage("Kopyalama işlemi başarısız oldu.", "error");
          }
        );
      }
    });
  }

  // Log mesajı ekleme fonksiyonu
  function logMessage(message, type = "info") {
    const logContainer = document.getElementById("logMessages");

    // Log sayısı kontrol
    if (logCount >= maxLogEntries) {
      // İlk logu kaldır
      if (logContainer.firstChild) {
        logContainer.removeChild(logContainer.firstChild);
      }
    } else {
      logCount++;
    }

    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement("div");
    logEntry.className = "log-entry mb-1 animate-pulse-once";

    // Log tipine göre renk ve ikon ekle
    let iconHTML = "";
    let textColorClass = "";

    switch (type) {
      case "success":
        iconHTML = "✅";
        textColorClass = "text-green-400";
        break;
      case "error":
        iconHTML = "❌";
        textColorClass = "text-red-400";
        break;
      case "warning":
        iconHTML = "⚠️";
        textColorClass = "text-yellow-400";
        break;
      default:
        iconHTML = "📌";
        textColorClass = "text-blue-300";
    }

    logEntry.innerHTML = `
      <span class="text-gray-500 text-xs">[${timestamp}]</span>
      <span class="mr-1">${iconHTML}</span>
      <span class="${textColorClass}">${message}</span>
    `;

    logContainer.appendChild(logEntry);

    // Otomatik scroll aktifse aşağı kaydır
    if (autoScroll) {
      scrollToBottom();
    }

    // Animasyonu kaldır
    setTimeout(() => {
      logEntry.classList.remove("animate-pulse-once");
    }, 1000);
  }

  // Sayfa yüklendiğinde hesap listelerini güncelle
  updateCodeiumAccountsList();
  updateCursorAccountsList();

  // Background script ile iletişim kur
  chrome.runtime.sendMessage({ action: "popupOpened" });

  // Background script'ten gelen mesajları dinle
  chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === "accountAdded") {
      if (message.accountType === "codeium") {
        updateCodeiumAccountsList();
      } else if (message.accountType === "cursor") {
        updateCursorAccountsList();
      }
      logMessage(`Yeni ${message.accountType === "codeium" ? "Codeium" : "Cursor"} hesabı eklendi: ${message.email || "Email yok"}`, "success");
    }
  });

  // Popup yüklendiğinde bir mesaj göster
  logMessage("Popup paneli açıldı", "info");
});
