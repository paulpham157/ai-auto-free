/**
 * Background script - Chrome eklentisi arkaplanda çalışan kodu
 */

// Tab işlemleri için yardımcı fonksiyonlar
const tabUtils = {
  /**
   * Yeni bir sekme açar
   * @param {string} url - Açılacak URL
   * @returns {Promise<chrome.tabs.Tab>} Açılan sekme
   */
  openTab: (url) => {
    return new Promise((resolve) => {
      chrome.tabs.create({ url: url }, (tab) => {
        resolve(tab);
      });
    });
  },

  /**
   * Belirli bir sekmeyi günceller
   * @param {number} tabId - Sekme ID'si
   * @param {string} url - Yeni URL
   * @returns {Promise<chrome.tabs.Tab>} Güncellenen sekme
   */
  updateTab: (tabId, url) => {
    return new Promise((resolve) => {
      chrome.tabs.update(tabId, { url: url }, (tab) => {
        resolve(tab);
      });
    });
  },

  /**
   * Sekmeye mesaj gönderir
   * @param {number} tabId - Sekme ID'si
   * @param {Object} message - Gönderilecek mesaj
   * @returns {Promise<any>} Cevap
   */
  sendMessageToTab: (tabId, message) => {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        resolve(response);
      });
    });
  },
};

// Eklenti ilk yüklendiğinde
chrome.runtime.onInstalled.addListener(() => {
  console.log("Cursor & Codeium otomasyon eklentisi yüklendi");

  // Eklenti veri yapısını başlat
  chrome.storage.local.get(["codeiumAccounts", "cursorAccounts"], (result) => {
    if (!result.codeiumAccounts) {
      chrome.storage.local.set({ codeiumAccounts: [] });
    }

    if (!result.cursorAccounts) {
      chrome.storage.local.set({ cursorAccounts: [] });
    }
  });
});

// Eklenti ikonuna tıklandığında
chrome.action.onClicked.addListener((tab) => {
  // Dashboard sayfasını aç
  const dashboardUrl = chrome.runtime.getURL("dashboard.html");

  // Önce mevcut dashboard sekmesi var mı kontrol et
  chrome.tabs.query({ url: dashboardUrl }, (tabs) => {
    if (tabs.length > 0) {
      // Varsa mevcut sekmeye odaklan
      chrome.tabs.update(tabs[0].id, { active: true });
    } else {
      // Yoksa yeni sekme aç
      chrome.tabs.create({ url: dashboardUrl });
    }
  });
});

// Content script'ten veya popup'tan gelen mesajları dinle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Dashboard açıldığında
  if (message.action === "dashboardOpened") {
    console.log("Dashboard açıldı");
    sendResponse({ status: "ok" });
  }

  // Yeni hesap eklendiğinde
  if (message.action === "accountAdded") {
    console.log(`Yeni ${message.accountType} hesabı eklendi:`, message.email);

    // Dashboard açıksa bilgilendir (broadcast)
    chrome.runtime.sendMessage({
      action: "accountAdded",
      accountType: message.accountType,
      email: message.email,
    });

    sendResponse({ status: "ok" });
  }

  // Cookie alma talebi geldiğinde
  if (message.action === "getCookie") {
    console.log("Cookie alma talebi alındı:", message.details);

    try {
      if (message.details && message.details.url && message.details.name) {
        chrome.cookies.get({ url: message.details.url, name: message.details.name }, (cookie) => {
          if (chrome.runtime.lastError) {
            console.error("Cookie alma hatası:", chrome.runtime.lastError);
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
            return;
          }

          if (cookie) {
            console.log("Cookie bulundu:", cookie.name);
            sendResponse({ success: true, cookie: cookie });
          } else {
            console.log("Cookie bulunamadı:", message.details.name);
            sendResponse({ success: false, error: "Cookie bulunamadı" });
          }
        });

        return true; // Asenkron yanıt için true döndür
      } else {
        sendResponse({
          success: false,
          error: "Eksik cookie parametreleri",
        });
      }
    } catch (error) {
      console.error("Cookie alma istisna hatası:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // Tüm cookie'leri alma talebi
  if (message.action === "getAllCookies") {
    console.log("Tüm cookie'leri alma talebi alındı:", message.details);

    try {
      if (message.details && message.details.domain) {
        chrome.cookies.getAll({ domain: message.details.domain }, (cookies) => {
          if (chrome.runtime.lastError) {
            console.error("Cookie alma hatası:", chrome.runtime.lastError);
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
            return;
          }

          console.log(`${cookies.length} cookie bulundu.`);
          sendResponse({ success: true, cookies: cookies });
        });

        return true; // Asenkron yanıt için true döndür
      } else {
        sendResponse({
          success: false,
          error: "Eksik domain parametresi",
        });
      }
    } catch (error) {
      console.error("Cookie alma istisna hatası:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // Token test etme talebi
  if (message.action === "testCursorToken") {
    console.log("Token test etme talebi alındı");

    try {
      if (!message.token) {
        sendResponse({ success: false, error: "Token eksik" });
        return;
      }

      // Token'ı işle, eğer %3A%3A içeriyorsa ikinci kısmını al
      let processedToken = message.token;
      if (processedToken.includes("%3A%3A")) {
        const parts = processedToken.split("%3A%3A");
        if (parts.length > 1) {
          processedToken = parts[1]; // İkinci kısmı al
          console.log("Token %3A%3A ile ayrıştırıldı");
        }
      }

      // Authorization header'ı her zaman "Bearer " ile başlamalı
      const headers = {
        "Accept-Encoding": "gzip, deflate, br",
        Authorization: "Bearer " + processedToken,
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

      fetch("https://api2.cursor.sh/aiserver.v1.AuthService/GetEmail", {
        method: "POST",
        headers: headers,
        body: "",
      })
        .then((response) => {
          const isValid = response.status === 200;
          console.log("Token test sonucu:", isValid ? "Geçerli" : "Geçersiz", "Status:", response.status);

          if (!isValid) {
            // Hata durumunda yanıt içeriğini de al
            return response.text().then((errorText) => {
              return { success: true, isValid: false, status: response.status, errorDetails: errorText };
            });
          }

          return { success: true, isValid: true };
        })
        .then((responseData) => {
          sendResponse(responseData);
        })
        .catch((error) => {
          console.error("Token test hatası:", error);
          sendResponse({ success: false, error: error.message, errorType: "network" });
        });

      return true; // Asenkron yanıt için true döndür
    } catch (error) {
      console.error("Token test istisna hatası:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // Access token oluşturma talebi geldiğinde
  if (message.action === "generateAccessTokens") {
    console.log("Access token oluşturma talebi alındı");

    // Aktif sekmeyi bul ve oraya istek yolla
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const activeTab = tabs[0];

        // Windsurf.com'da açık bir sekme var mı kontrol et
        if (activeTab.url.includes("windsurf.com")) {
          // Aktif sekme Codeium sitesindeyse ona istek gönder
          chrome.tabs.sendMessage(activeTab.id, { action: "generateCodeiumAccessTokens" }, (response) => {
            if (response && response.tokens) {
              sendResponse({ tokens: response.tokens });
            } else {
              // Herhangi bir sekmede Codeium token'ı üretmeyi dene (backup plan)
              tryAnyTabForTokens(sendResponse);
            }
          });
        } else {
          // Codeium sitesinde bir sekme ara
          chrome.tabs.query({ url: "*://windsurf.com/*" }, (codeiumTabs) => {
            if (codeiumTabs.length > 0) {
              const codeiumTab = codeiumTabs[0];
              chrome.tabs.sendMessage(codeiumTab.id, { action: "generateCodeiumAccessTokens" }, (response) => {
                if (response && response.tokens) {
                  sendResponse({ tokens: response.tokens });
                } else {
                  // Herhangi bir sekmede Codeium token'ı üretmeyi dene (backup plan)
                  tryAnyTabForTokens(sendResponse);
                }
              });
            } else {
              // Codeium sitesinde bir sekme yoksa, tüm sekmelere sor
              tryAnyTabForTokens(sendResponse);
            }
          });
        }
      } else {
        // Aktif sekme yoksa, tüm sekmelere sor
        tryAnyTabForTokens(sendResponse);
      }
    });

    return true; // Asenkron yanıt için true döndür
  }

  // Çerez silme talebi geldiğinde
  if (message.action === "removeCookies") {
    console.log("Çerez silme talebi alındı:", message.details);

    try {
      if (message.details && message.details.domains) {
        const domains = message.details.domains;
        const cookieNames = message.details.cookieNames || [];
        let processedCount = 0;
        let totalCount = 0;
        let errors = [];

        // Tüm domainleri ve çerez isimlerini işle
        domains.forEach((domain) => {
          // Belirli çerezleri sil
          if (cookieNames.length > 0) {
            cookieNames.forEach((cookieName) => {
              totalCount++;

              // HTTP ve HTTPS için çerezleri sil
              const urls = [`http://${domain}`, `https://${domain}`];

              urls.forEach((url) => {
                chrome.cookies.remove({ url: url, name: cookieName }, (result) => {
                  processedCount++;

                  if (chrome.runtime.lastError) {
                    console.error(`${url}, ${cookieName} çerezi silinirken hata:`, chrome.runtime.lastError);
                    errors.push({
                      url,
                      name: cookieName,
                      error: chrome.runtime.lastError.message,
                    });
                  } else if (result) {
                    console.log(`${url}, ${cookieName} çerezi silindi`);
                  } else {
                    console.log(`${url}, ${cookieName} çerezi bulunamadı`);
                  }

                  // Tüm işlemler tamamlandığında yanıt ver
                  if (processedCount >= totalCount * 2) {
                    // Her URL için 2 işlem
                    sendResponse({
                      success: true,
                      message: `${processedCount} çerez işlendi`,
                      errors: errors.length > 0 ? errors : null,
                    });
                  }
                });
              });
            });
          } else {
            // Eğer belirli çerez isimleri belirtilmemişse, tüm çerezleri alma ve silme
            chrome.cookies.getAll({ domain }, (cookies) => {
              if (chrome.runtime.lastError) {
                console.error(`${domain} için çerez alınırken hata:`, chrome.runtime.lastError);
                sendResponse({
                  success: false,
                  error: chrome.runtime.lastError.message,
                });
                return;
              }

              totalCount += cookies.length;
              console.log(`${domain} için ${cookies.length} çerez bulundu, siliniyor...`);

              if (cookies.length === 0) {
                sendResponse({ success: true, message: "Silinecek çerez bulunamadı" });
                return;
              }

              cookies.forEach((cookie) => {
                const url = `http${cookie.secure ? "s" : ""}://${cookie.domain}${cookie.path}`;

                chrome.cookies.remove({ url, name: cookie.name }, (result) => {
                  processedCount++;

                  if (chrome.runtime.lastError) {
                    console.error(`${url}, ${cookie.name} çerezi silinirken hata:`, chrome.runtime.lastError);
                    errors.push({
                      url,
                      name: cookie.name,
                      error: chrome.runtime.lastError.message,
                    });
                  } else if (result) {
                    console.log(`${url}, ${cookie.name} çerezi silindi`);
                  } else {
                    console.log(`${url}, ${cookie.name} çerezi bulunamadı`);
                  }

                  // Tüm işlemler tamamlandığında yanıt ver
                  if (processedCount >= totalCount) {
                    sendResponse({
                      success: true,
                      message: `${processedCount} çerez silindi`,
                      errors: errors.length > 0 ? errors : null,
                    });
                  }
                });
              });
            });
          }
        });

        return true; // Asenkron yanıt için true döndür
      } else {
        sendResponse({
          success: false,
          error: "Eksik domain parametresi",
        });
      }
    } catch (error) {
      console.error("Çerez silme istisna hatası:", error);
      sendResponse({ success: false, error: error.message });
    }

    return true; // Asenkron yanıt için true döndür
  }

  // Tarayıcı verilerini temizleme ve URL'ye yönlendirme talebi
  if (message.action === "clearAndRedirect") {
    console.log("Tarayıcı verileri temizleniyor ve yönlendiriliyor...");

    if (message.redirectUrl) {
      // Aktif sekmenin ID'sini al veya gelen ID'yi kullan
      const getTabId = new Promise((resolve) => {
        if (message.tabId && message.tabId !== chrome.runtime.id) {
          resolve(message.tabId);
        } else {
          // Aktif sekmeyi al
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0) {
              resolve(tabs[0].id);
            } else {
              resolve(null);
            }
          });
        }
      });

      getTabId
        .then((tabId) => {
          if (tabId) {
            return tabUtils.updateTab(tabId, message.redirectUrl);
          } else {
            // Sekme ID bulunamadıysa yeni sekme aç
            return tabUtils.openTab(message.redirectUrl);
          }
        })
        .then(() => {
          console.log(`Sayfa yönlendirildi: ${message.redirectUrl}`);
          sendResponse({ status: "ok" });
        })
        .catch((error) => {
          console.error("Yönlendirme hatası:", error);
          sendResponse({ status: "error", error: error.message });
        });
    } else {
      console.error("Yönlendirme URL'si belirtilmedi");
      sendResponse({ status: "error", error: "Yönlendirme URL'si belirtilmedi" });
    }

    return true; // Asenkron sendResponse için
  }
});

// URL değişikliklerini dinle (webNavigation API) ve content script'e bildir
chrome.webNavigation.onCompleted.addListener((details) => {
  // Ana frame için (iframe'ler için değil)
  if (details.frameId === 0) {
    const url = details.url;

    // Content script'e URL değişikliğini bildir
    chrome.tabs
      .sendMessage(details.tabId, {
        action: "urlChanged",
        url: url,
      })
      .catch((error) => {
        // Content script henüz yüklenmemiş olabilir, hata gösterme
        console.log(`URL değişikliği bildirilemedi: ${url}`);
      });
  }
});

// İlk başlangıç - eklenti icon'una tıklandığında popup açıldığı için özel bir işlem gerekmez

// Herhangi bir sekmede token üretmeyi dene
function tryAnyTabForTokens(sendResponse) {
  console.log("Herhangi bir sekmede token üretmeyi deniyorum...");

  chrome.tabs.query({}, (tabs) => {
    let tokenPromises = [];

    for (const tab of tabs) {
      tokenPromises.push(
        new Promise((resolve) => {
          try {
            chrome.tabs.sendMessage(tab.id, { action: "generateCodeiumAccessTokens" }, (response) => {
              if (response && response.tokens) {
                resolve(response.tokens);
              } else {
                resolve(null);
              }
            });

            // 500ms sonra timeout
            setTimeout(() => resolve(null), 500);
          } catch (error) {
            console.log("Tab istisna oluşturdu:", error);
            resolve(null);
          }
        })
      );
    }

    // İlk cevap veren tabı kullan
    Promise.all(tokenPromises).then((results) => {
      // null olmayan ilk sonuç
      const tokens = results.find((r) => r !== null);

      if (tokens) {
        sendResponse({ tokens: tokens });
      } else {
        sendResponse({
          error: "Token oluşturulamadı",
          message: "Mevcut sekmelerde token oluşturulamadı. Lütfen Codeium sitesinde bir sekme açın.",
        });
      }
    });
  });
}
