/**
 * Şifre oluşturan fonksiyon
 * @returns {string} Oluşturulan şifre
 */
function generatePassword() {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  // CSV exportunda problem oluşturmayacak özel karakterler (virgül, noktalı virgül, tırnak işaretleri ve diğer CSV sorunlu karakterler kaldırıldı)
  const special = "!@#$%^&*()_-+=[]{}|~";

  // Her kategoriden en az bir karakter içermesi için
  let password = "";
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));

  // Geri kalan karakterleri ekle (toplam 10 karakter olacak şekilde)
  const allChars = lowercase + uppercase + numbers + special;
  for (let i = 0; i < 6; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Karakterleri karıştır
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

/**
 * İsim oluşturan fonksiyon
 * @returns {Object} İsim ve soyisim içeren obje
 */
function generateName() {
  // Latin alfabesine uygun isimler
  const firstNames = ["Adam", "Alex", "Alice", "Anna", "Brad", "Chloe", "David", "Emma", "Ethan", "Gabriel", "Hannah", "Jasmine", "John", "Liam", "Linda", "Maria", "Michael", "Natalie", "Noah", "Olivia", "Robert", "Sarah", "Thomas", "Victoria", "William", "Zoe"];

  const lastNames = ["Adams", "Brown", "Clark", "Davis", "Evans", "Fisher", "Garcia", "Harris", "Jackson", "Johnson", "King", "Lee", "Miller", "Nelson", "Parker", "Robinson", "Smith", "Taylor", "Walker", "White", "Wilson", "Young"];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return { firstName, lastName };
}

/**
 * DOM elementinin yüklenmesini bekleyen fonksiyon
 * @param {string} selector - CSS seçici
 * @param {number} maxAttempts - Maksimum deneme sayısı
 * @param {number} interval - Denemeler arası süre (ms)
 * @returns {Promise<Element>} DOM elementi
 */
function waitForElement(selector, maxAttempts = 20, interval = 500) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    // Seçici türünü logla
    console.log(`Element bekleniyor: "${selector}", max deneme: ${maxAttempts}, interval: ${interval}ms`);

    const checkElement = () => {
      attempts++;

      // Önce doğrudan seçiciyi dene
      let element = null;

      try {
        element = document.querySelector(selector);
      } catch (error) {
        console.warn(`Geçersiz seçici ${selector}: ${error.message}`);
      }

      // Element bulundu mu?
      if (element) {
        console.log(`Element bulundu (deneme ${attempts}): ${selector}`);
        console.log(`Element özellikleri - type: ${element.type}, id: ${element.id}, name: ${element.name}`);
        resolve(element);
        return;
      }

      // Element bulunamadı, deneme sayısını kontrol et
      if (attempts >= maxAttempts) {
        // Deneme sayısı aşıldı, ancak son bir kaç farklı yöntemle de deneyelim

        // 1. Seçici bir id ise, başka yöntemlerle bulmayı dene
        if (selector.startsWith("#")) {
          const idWithoutHash = selector.substring(1);
          const elementById = document.getElementById(idWithoutHash);
          if (elementById) {
            console.log(`Element ID ile bulundu: ${idWithoutHash}`);
            resolve(elementById);
            return;
          }
        }

        // 2. Seçici bir name özelliği içeriyorsa
        if (selector.includes("name=") || selector.includes("[name")) {
          // name değerini çıkar
          let nameMatch = selector.match(/name=['"]?([^'"[\]]+)['"]?/);
          if (nameMatch && nameMatch[1]) {
            const name = nameMatch[1];
            const elementsByName = document.getElementsByName(name);
            if (elementsByName.length > 0) {
              console.log(`Element name ile bulundu: ${name}`);
              resolve(elementsByName[0]);
              return;
            }
          }
        }

        // 3. Benzeri elementlere bak
        try {
          // Seçiciyi basitleştirmeyi dene
          const simplifiedSelector = selector
            .replace(/\[.*?\]/g, "") // Tüm özellikleri kaldır
            .replace(/#[a-zA-Z0-9_-]+/g, "") // ID'leri kaldır
            .replace(/\.[a-zA-Z0-9_-]+/g, "") // Sınıfları kaldır
            .trim();

          if (simplifiedSelector && simplifiedSelector !== selector) {
            const similarElements = document.querySelectorAll(simplifiedSelector);
            if (similarElements.length > 0) {
              console.log(`Benzer element bulundu (basitleştirilmiş seçici: ${simplifiedSelector})`);
              resolve(similarElements[0]);
              return;
            }
          }
        } catch (error) {
          console.warn(`Benzer element arama hatası: ${error.message}`);
        }

        // Tüm yöntemler başarısız oldu, input türünden elementi bulmayı dene
        try {
          // Seçici bir input, textarea, veya select olabilir mi?
          if (selector.includes("input") || selector.toLowerCase().includes("name")) {
            // Seçiciden ismi veya id çıkarmaya çalış
            const nameOrId = selector.match(/['"#]([a-zA-Z0-9_-]+)['"]/);

            if (nameOrId && nameOrId[1]) {
              // Tüm input elemanlarını kontrol et
              const allInputs = document.querySelectorAll("input, textarea, select");
              for (const input of allInputs) {
                if (input.id === nameOrId[1] || input.name === nameOrId[1]) {
                  console.log(`Element id/name eşleşmesiyle bulundu: ${nameOrId[1]}`);
                  resolve(input);
                  return;
                }
              }
            }
          }
        } catch (error) {
          console.warn(`Input arama hatası: ${error.message}`);
        }

        // En son hata durumunu logla
        console.error(`Element bulunamadı (${attempts} deneme): ${selector}`);
        console.log("Sayfadaki tüm input elemanları:");
        document.querySelectorAll("input").forEach((input) => {
          console.log(`- input: id="${input.id}", name="${input.name}", type="${input.type}"`);
        });

        reject(new Error(`Element bulunamadı: ${selector} (${attempts} deneme sonra)`));
        return;
      }

      // Bir sonraki deneme için zamanlayıcı ayarla
      console.log(`Element bulunamadı, ${interval}ms sonra tekrar denenecek (${attempts}/${maxAttempts})...`);
      setTimeout(checkElement, interval);
    };

    // İlk kontrolü başlat
    checkElement();
  });
}

/**
 * Input alanını dolduran ve highlight eden fonksiyon
 * @param {Element} inputElement Input elementi
 * @param {string} value Doldurulacak değer
 * @param {boolean} highlight Highlight yapılacak mı
 * @returns {Promise<void>}
 */
function fillInput(inputElement, value, highlight = true) {
  return new Promise((resolve, reject) => {
    if (!inputElement) {
      console.error("fillInput: Input elementi bulunamadı");
      reject(new Error("Input elementi bulunamadı"));
      return;
    }

    // İnput türünü logla
    console.log(`Input dolduruluyor - id: ${inputElement.id}, type: ${inputElement.type}, name: ${inputElement.name}`);

    if (highlight) {
      // Doldurulacak alanı vurgula
      const originalBorder = inputElement.style.border;
      const originalBackground = inputElement.style.backgroundColor;

      inputElement.style.border = "2px solid #4CAF50";
      inputElement.style.backgroundColor = "#E8F5E9";

      setTimeout(() => {
        inputElement.style.border = originalBorder;
        inputElement.style.backgroundColor = originalBackground;
      }, 2000);
    }

    // Input'a odaklan ve seç
    try {
      inputElement.focus();
      inputElement.select();
    } catch (e) {
      console.warn("focus/select hatası:", e);
    }

    // Kısa bir gecikme ekle - bazı form frameworkleri için gerekli olabilir
    setTimeout(() => {
      // Değeri ayarlamayı deneyeceğimiz tüm yöntemler
      const setValueMethods = [
        // 1. Focus ve değer direkt atama
        () => {
          try {
            inputElement.focus();
            inputElement.value = value;
            return inputElement.value === value;
          } catch (e) {
            console.warn("Doğrudan atama çalışmadı:", e);
            return false;
          }
        },

        // 2. Object.defineProperty ile setter kullanarak atama
        () => {
          try {
            const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
            const valueSetter = descriptor.set;
            valueSetter.call(inputElement, value);
            return inputElement.value === value;
          } catch (e) {
            console.warn("defineProperty setter çalışmadı:", e);
            return false;
          }
        },

        // 3. Native DOM API ile atama
        () => {
          try {
            inputElement.value = value;
            // İlgili olay tetikleyicilerini manuel olarak çağır
            inputElement.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
            inputElement.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
            return inputElement.value === value;
          } catch (e) {
            console.warn("Native DOM API çalışmadı:", e);
            return false;
          }
        },

        // 4. JavaScript ile veri girişi simülasyonu
        () => {
          try {
            inputElement.focus();
            inputElement.select();
            // Mevcut değeri temizle
            if (inputElement.value !== "") {
              for (let i = 0; i < inputElement.value.length; i++) {
                // Backspace tuşuna basma simülasyonu
                const backspaceEvent = new KeyboardEvent("keydown", {
                  key: "Backspace",
                  code: "Backspace",
                  bubbles: true,
                });
                inputElement.dispatchEvent(backspaceEvent);
              }
            }

            // Her karakteri tek tek gir
            for (let i = 0; i < value.length; i++) {
              const char = value.charAt(i);
              // Her karakter için bir keydown olayı tetikle
              const inputEvent = new InputEvent("input", {
                inputType: "insertText",
                data: char,
                bubbles: true,
              });
              inputElement.dispatchEvent(inputEvent);
              inputElement.value = inputElement.value + char; // Karakter ekleme
            }

            return inputElement.value === value;
          } catch (e) {
            console.warn("Klavye simülasyonu çalışmadı:", e);
            return false;
          }
        },
      ];

      // Tüm yöntemleri dene
      let valueSet = false;
      let usedMethod = "";

      for (let i = 0; i < setValueMethods.length; i++) {
        try {
          valueSet = setValueMethods[i]();
          if (valueSet) {
            usedMethod = `Yöntem ${i + 1}`;
            console.log(`Değer başarıyla ayarlandı (${usedMethod}):`, value);
            break;
          }
        } catch (e) {
          console.warn(`Yöntem ${i + 1} hatası:`, e);
        }
      }

      if (!valueSet) {
        console.warn(`Tüm değer atama yöntemleri başarısız oldu. Son deneme olarak direkt atama yapılıyor.`);

        try {
          // Son çare olarak en basit atama
          inputElement.value = value;
          usedMethod = "Son çare direkt atama";
        } catch (e) {
          console.error("Son çare atama da başarısız:", e);
        }
      }

      // DOM olaylarını tetikle - Framework'lerin değişiklikleri algılaması için
      const events = [new Event("input", { bubbles: true, cancelable: true }), new Event("change", { bubbles: true, cancelable: true }), new Event("blur", { bubbles: true, cancelable: true })];

      // Her olayı ayrı try-catch bloğunda çalıştır (biri başarısız olsa bile diğerleri çalışsın)
      events.forEach((event) => {
        try {
          inputElement.dispatchEvent(event);
        } catch (e) {
          console.warn(`Event tetikleme hatası (${event.type}):`, e);
        }
      });

      // Son bir kez daha değerin doğru atanıp atanmadığını kontrol et
      if (inputElement.value !== value) {
        console.warn(`Değer doğru atanmadı. Beklenen: "${value}", Gerçek: "${inputElement.value}"`);

        // Son bir deneme daha
        setTimeout(() => {
          try {
            inputElement.focus();
            inputElement.value = value;

            // Olay tetikleyicilerini tekrar çalıştır
            events.forEach((event) => {
              try {
                inputElement.dispatchEvent(event);
              } catch (e) {
                console.warn(`Son deneme event tetikleme hatası (${event.type}):`, e);
              }
            });

            console.log(`Son kontrol - Input değeri: "${inputElement.value}"`);

            if (inputElement.value === value) {
              console.log("Son denemede değer başarıyla ayarlandı");
              resolve();
            } else {
              console.error(`Değer atanamadı: Beklenen "${value}", Gerçek: "${inputElement.value}"`);
              reject(new Error(`Değer atanamadı: ${value}`));
            }
          } catch (e) {
            console.error("Son deneme hatası:", e);
            reject(new Error(`Son deneme hatası: ${e.message}`));
          }
        }, 500);
      } else {
        console.log(`Input değeri başarıyla ayarlandı (${usedMethod}): "${value}"`);
        resolve();
      }
    }, 100); // Kısa gecikme
  });
}

/**
 * URL değişikliklerini izleyen fonksiyon
 * @param {Function} callback URL değiştiğinde çalıştırılacak callback
 * @returns {void}
 */
function watchForUrlChanges(callback) {
  let lastUrl = location.href;

  // MutationObserver ile DOM değişikliklerini izle
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      callback(location.href);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Sayfa yüklendiğinde callback'i çağır
  callback(location.href);

  // history API metotlarını override et
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function () {
    originalPushState.apply(this, arguments);
    callback(location.href);
  };

  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    callback(location.href);
  };

  // popstate event'ini dinle
  window.addEventListener("popstate", () => {
    callback(location.href);
  });
}

/**
 * IndexedDB'yi temizleyen fonksiyon
 * @returns {Promise<void>}
 */
function clearIndexedDB() {
  return new Promise((resolve, reject) => {
    try {
      indexedDB.deleteDatabase("firebaseLocalStorageDb");
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * LocalStorage'ı temizleyen fonksiyon
 */
function clearLocalStorage() {
  localStorage.clear();
}

/**
 * Cookie'leri temizleyen fonksiyon
 */
function clearCookies() {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

    // Temel yolda sil
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";

    // Alt yollardan da sil
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.cursor.com";
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=cursor.com";
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.cursor.sh";
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=cursor.sh";
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=api2.cursor.sh";
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=authenticator.cursor.sh";

    // Özellikle cursor token cookie'sini temizle
    if (name === "WorkosCursorSessionToken") {
      console.log("Cursor token çerezi özel olarak temizleniyor...");
      document.cookie = "WorkosCursorSessionToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = "WorkosCursorSessionToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.cursor.com";
      document.cookie = "WorkosCursorSessionToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=cursor.com";
      document.cookie = "WorkosCursorSessionToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=www.cursor.com";
    }
  }

  console.log("Çerezler temizlendi");
}

/**
 * Tüm tarayıcı verilerini temizleyen fonksiyon
 * @returns {Promise<void>}
 */
async function clearBrowserData() {
  // IndexedDB'yi temizle
  await clearIndexedDB();

  // LocalStorage'ı temizle
  clearLocalStorage();

  // Document API ile çerezleri temizle
  clearCookies();

  // Chrome API ile çerezleri temizle
  try {
    // Background script'e çerez silme mesajı gönder
    await new Promise((resolve) => {
      console.log("Chrome API ile çerezler temizleniyor...");

      chrome.runtime.sendMessage(
        {
          action: "removeCookies",
          details: {
            domains: ["cursor.com", "www.cursor.com", "api2.cursor.sh", "cursor.sh", "authenticator.cursor.sh"],
            cookieNames: ["WorkosCursorSessionToken"],
          },
        },
        (response) => {
          if (response && response.success) {
            console.log("Chrome API ile çerezler temizlendi:", response.message);
          } else {
            console.error("Chrome API ile çerez temizleme hatası:", response?.error || "Bilinmeyen hata");
          }
          resolve();
        }
      );
    });

    // Tüm domain çerezlerini de temizle (ikinci bir temizlik dalgası)
    await new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          action: "removeCookies",
          details: {
            domains: ["cursor.com", "www.cursor.com", "api2.cursor.sh", "cursor.sh", "authenticator.cursor.sh"],
          },
        },
        () => resolve()
      );
    });

    console.log("Çerez temizleme işlemi tamamlandı");
  } catch (error) {
    console.error("Chrome API ile çerez temizleme istisna hatası:", error);
  }
}

// Fonksiyonları global scope'a ekle
window.automationHelpers = {
  generatePassword,
  generateName,
  waitForElement,
  fillInput,
  watchForUrlChanges,
  clearBrowserData,
};
