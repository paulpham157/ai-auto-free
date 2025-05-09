/**
 * Form doldurma işlemlerini yöneten sınıf
 */
class FormFiller {
  /**
   * Constructor
   * @param {Function} logger - Log mesajlarını görüntüleyecek fonksiyon
   */
  constructor(logger) {
    this.logger = logger || console.log;
    this.currentEmail = "";
    this.currentPassword = "";

    // İşlenmiş form alanlarını takip etmek için
    this.processedFields = new Set();

    // Şifre alanları için MutationObserver
    this.passwordObserver = null;
  }

  /**
   * Input alanının daha önce doldurulup doldurulmadığını kontrol eder
   * @param {string} fieldId - Alan ID'si (element ID veya özel bir tanımlayıcı)
   * @returns {boolean} - Daha önce doldurulmuş mu?
   */
  isFieldProcessed(fieldId) {
    return this.processedFields.has(fieldId);
  }

  /**
   * Input alanını işlenmiş olarak işaretler
   * @param {string} fieldId - Alan ID'si
   */
  markFieldAsProcessed(fieldId) {
    this.processedFields.add(fieldId);
  }

  /**
   * Codeium kayıt formunu doldurur
   * @returns {Promise<void>}
   */
  async fillCodeiumRegistrationForm() {
    try {
      this.logger("Codeium kayıt formu dolduruluyor...");

      // İsim ve soyisim alanlarını doldur
      const name = window.automationHelpers.generateName();

      // İsim alanını doldur (eğer daha önce doldurulmadıysa)
      if (!this.isFieldProcessed("codeium-firstName")) {
        const firstNameInput = await window.automationHelpers.waitForElement("#firstName");

        if (firstNameInput) {
          await window.automationHelpers.fillInput(firstNameInput, name.firstName);
          this.logger(`İsim alanı dolduruldu: ${name.firstName}`);
          this.markFieldAsProcessed("codeium-firstName");
        }
      }

      // Soyisim alanını doldur (eğer daha önce doldurulmadıysa)
      if (!this.isFieldProcessed("codeium-lastName")) {
        const lastNameInput = await window.automationHelpers.waitForElement("#lastName");

        if (lastNameInput) {
          await window.automationHelpers.fillInput(lastNameInput, name.lastName);
          this.logger(`Soyisim alanı dolduruldu: ${name.lastName}`);
          this.markFieldAsProcessed("codeium-lastName");
        }
      }

      // Email alanındaki değişiklikleri dinle (eğer daha önce dinlenmediyse)
      if (!this.isFieldProcessed("codeium-email-listener")) {
        try {
          const emailInput = await window.automationHelpers.waitForElement("#email");

          if (emailInput) {
            // Email input değişikliğini dinle
            emailInput.addEventListener("change", () => {
              this.currentEmail = emailInput.value;
              this.logger(`Email adresi alındı: ${this.currentEmail}`);
            });

            this.markFieldAsProcessed("codeium-email-listener");
            this.logger("Email alanı dinleniyor");
          }
        } catch (error) {
          this.logger(`Email alanı bulunamadı: ${error.message}`, "warning");
        }
      }
    } catch (error) {
      this.logger(`Kayıt formu doldurma hatası: ${error.message}`, "error");
    }
  }

  /**
   * DOM'a şifre alanları eklendiğinde yakalamak için MutationObserver başlatır
   */
  startPasswordFieldsObserver() {
    // Eğer daha önce oluşturulmuş bir observer varsa, önce onu durdur
    if (this.passwordObserver) {
      this.passwordObserver.disconnect();
    }

    this.logger("Şifre alanları için gözlemci başlatılıyor...", "info");

    // Yeni bir MutationObserver oluştur
    this.passwordObserver = new MutationObserver((mutations) => {
      // Sayfada şifre alanları var mı kontrol et
      const passwordField = document.querySelector("#password");
      const confirmPasswordField = document.querySelector("#passwordConfirmation");

      if (passwordField && confirmPasswordField) {
        this.logger("Şifre alanları DOM'a eklendi, doldurma işlemi başlatılıyor...", "success");
        this.fillPasswordFields(passwordField, confirmPasswordField);

        // Alanlar bulunduğunda observer'ı durdur
        this.passwordObserver.disconnect();
        this.passwordObserver = null;
      }
    });

    // Tüm DOM değişikliklerini izle
    this.passwordObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["id", "name", "type"],
    });

    this.logger("Şifre alanları gözlemcisi başlatıldı", "info");
  }

  /**
   * Bulunan şifre alanlarını doldur
   * @param {Element} passwordField - Şifre alanı
   * @param {Element} confirmPasswordField - Şifre onay alanı
   */
  async fillPasswordFields(passwordField, confirmPasswordField) {
    // Şifre oluştur (eğer daha önce oluşturulmadıysa)
    if (!this.currentPassword) {
      this.currentPassword = window.automationHelpers.generatePassword();
      this.logger(`Yeni şifre oluşturuldu: ${this.currentPassword}`, "success");
    }

    // Şifre alanını doldur
    if (!this.isFieldProcessed("codeium-password")) {
      try {
        this.logger("Şifre alanı dolduruluyor...", "info");
        await window.automationHelpers.fillInput(passwordField, this.currentPassword);
        this.markFieldAsProcessed("codeium-password");
        this.logger("Şifre alanı dolduruldu", "success");
      } catch (error) {
        this.logger(`Şifre alanı doldurma hatası: ${error.message}`, "error");
      }
    }

    // Şifre onay alanını doldur
    if (!this.isFieldProcessed("codeium-passwordConfirmation")) {
      try {
        this.logger("Şifre onay alanı dolduruluyor...", "info");
        await window.automationHelpers.fillInput(confirmPasswordField, this.currentPassword);
        this.markFieldAsProcessed("codeium-passwordConfirmation");
        this.logger("Şifre onay alanı dolduruldu", "success");
      } catch (error) {
        this.logger(`Şifre onay alanı doldurma hatası: ${error.message}`, "error");
      }
    }

    // Hesap bilgilerini kaydet
    if (this.currentEmail) {
      await window.accountDB.addCodeiumAccount({
        email: this.currentEmail,
        password: this.currentPassword,
      });

      this.logger("Hesap bilgileri geçici olarak kaydedildi", "success");
    } else {
      this.logger("Email adresi bulunamadı, sadece şifre kaydedildi", "warning");
    }
  }

  /**
   * Codeium şifre adımını doldurur
   * @returns {Promise<void>}
   */
  async fillCodeiumPasswordStep() {
    try {
      this.logger("Codeium şifre adımı işlemi başlatılıyor...", "info");

      // Sayfada halihazırda şifre alanları var mı kontrol et
      const passwordField = document.querySelector("#password");
      const confirmPasswordField = document.querySelector("#passwordConfirmation");

      if (passwordField && confirmPasswordField) {
        // Şifre alanları zaten mevcut, hemen doldur
        this.logger("Şifre alanları sayfada bulundu", "success");
        await this.fillPasswordFields(passwordField, confirmPasswordField);
      } else {
        // Şifre alanları henüz yüklenmemiş, gözlemci başlat
        this.logger("Şifre alanları bulunamadı, dinamik yükleme için gözlemci başlatılıyor", "info");
        this.startPasswordFieldsObserver();

        // Halihazırda DOM'da şifre alanları olup olmadığını kontrol etmek için tüm input alanlarını listele
        this.logger("Mevcut input alanları:", "info");
        document.querySelectorAll("input").forEach((input) => {
          this.logger(`Input: id=${input.id}, name=${input.name}, type=${input.type}`, "info");
        });
      }
    } catch (error) {
      this.logger(`Şifre adımı işleme hatası: ${error.message}`, "error");
    }
  }

  /**
   * Codeium token'larını çıkarır ve kaydeder
   * @returns {Promise<void>}
   */
  async extractCodeiumTokens() {
    try {
      this.logger("Codeium token'ları çıkarılıyor...");

      const tokens = await this.extractTokensFromFirebaseStorage();

      if (tokens && tokens.apiKey && tokens.refreshToken) {
        // Email ve şifre kayıtlı bir hesap var mı kontrol et
        if (this.currentEmail && this.currentPassword) {
          await window.accountDB.addCodeiumAccount({
            email: this.currentEmail,
            password: this.currentPassword,
            apiKey: tokens.apiKey,
            refreshToken: tokens.refreshToken,
          });

          this.logger("Token'lar kaydedildi");
        } else {
          // Email ve şifre yoksa token'ları kaydet
          await window.accountDB.addCodeiumAccount({
            apiKey: tokens.apiKey,
            refreshToken: tokens.refreshToken,
          });

          this.logger("Token'lar email olmadan kaydedildi");
        }
      } else {
        this.logger("Token'lar bulunamadı");
      }
    } catch (error) {
      this.logger(`Token çıkarma hatası: ${error.message}`, "error");
    }
  }

  /**
   * Firebase storage'dan token'ları çıkarır
   * @returns {Promise<Object>} Token objesi
   */
  extractTokensFromFirebaseStorage() {
    return new Promise((resolve, reject) => {
      try {
        (async () => {
          try {
            const e = await new Promise((e, t) => {
              const o = indexedDB.open("firebaseLocalStorageDb");
              (o.onerror = (e) => t("IndexedDB hatası: " + e.target.errorCode)),
                (o.onsuccess = (o) => {
                  const n = o.target.result;
                  try {
                    const o = n.transaction(["firebaseLocalStorage"], "readonly").objectStore("firebaseLocalStorage").getAll();
                    (o.onsuccess = (o) => {
                      const n = o.target.result,
                        s = n.find((e) => e.fbase_key && e.fbase_key.startsWith("firebase:authUser"));
                      if (s) {
                        const t = s.value,
                          o = { apiKey: t.apiKey, refreshToken: t.stsTokenManager.refreshToken, accessToken: t.stsTokenManager.accessToken };
                        e(o);
                      } else t("Kullanıcı verisi bulunamadı");
                    }),
                      (o.onerror = (e) => t("Veri alınamadı: " + e.target.errorCode));
                  } catch (e) {
                    const o = Array.from(n.objectStoreNames);
                    if (o.length > 0) {
                      const s = n.transaction(o, "readonly");
                      let r = !1;
                      o.forEach((o) => {
                        const n = s.objectStore(o).getAll();
                        n.onsuccess = (s) => {
                          if (!r)
                            for (const n of s.target.result)
                              if (n.fbase_key && n.fbase_key.startsWith("firebase:authUser")) {
                                r = !0;
                                const s = n.value,
                                  a = { apiKey: s.apiKey, refreshToken: s.stsTokenManager.refreshToken, accessToken: s.stsTokenManager.accessToken };
                                return void e(a);
                              }
                        };
                      });
                    } else t("Store bulunamadı");
                  }
                });
            });
            resolve(e);
          } catch (e) {
            reject(e);
          }
        })();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Cursor kayıt formunu doldurur
   * @returns {Promise<void>}
   */
  async fillCursorRegistrationForm() {
    try {
      this.logger("Cursor kayıt formu dolduruluyor...");

      // İsim ve soyisim alanlarını doldur
      const name = window.automationHelpers.generateName();

      // Sayfa yüklenmeden işlem yapmamak için kısa bir bekleme
      this.logger("Formun tamamen yüklenmesi için bekleniyor...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Form alanlarını logla - Debug için
      document.querySelectorAll("input").forEach((input) => {
        this.logger(`Form alanı bulundu: id=${input.id}, name=${input.name}, type=${input.type}`, "info");
      });

      // İsim alanını doldur (eğer daha önce doldurulmadıysa)
      if (!this.isFieldProcessed("cursor-firstName")) {
        let firstNameInput = null;
        let attempts = 0;
        const maxAttempts = 5;

        // İsim alanını bulmak için birkaç deneme yap
        while (!firstNameInput && attempts < maxAttempts) {
          try {
            attempts++;
            this.logger(`İsim alanı aranıyor (${attempts}/${maxAttempts})...`, "info");

            // Doğrudan DOM'dan alma dene
            firstNameInput = document.querySelector('input[name="first_name"]');

            // Bulunamadıysa waitForElement ile dene
            if (!firstNameInput) {
              this.logger("İsim alanı doğrudan bulunamadı, waitForElement ile deneniyor...", "info");
              firstNameInput = await window.automationHelpers.waitForElement('input[name="first_name"]', 5, 500);
            }

            // Bulunamadıysa farklı seçiciler dene
            if (!firstNameInput) {
              this.logger("Alternatif seçiciler deneniyor...", "info");
              firstNameInput = document.querySelector("#first_name") || document.querySelector('input[placeholder*="First"]') || document.querySelector('input[placeholder*="first"]') || document.querySelector('input[placeholder*="İsim"]');
            }

            if (firstNameInput) {
              break;
            } else {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          } catch (error) {
            this.logger(`İsim alanı arama denemesi ${attempts} başarısız: ${error.message}`, "warning");
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        if (firstNameInput) {
          this.logger("İsim alanı bulundu, dolduruluyor...", "success");
          try {
            // İsim alanını doldur
            await window.automationHelpers.fillInput(firstNameInput, name.firstName);
            this.logger(`İsim alanı dolduruldu: ${name.firstName}`, "success");
            this.markFieldAsProcessed("cursor-firstName");

            // Doğrulama
            if (firstNameInput.value !== name.firstName) {
              this.logger("İsim alanı doldurma işlemi sonrası değer kontrolü başarısız!", "warning");
              // Manuel olarak tekrar doldur
              firstNameInput.value = name.firstName;
              firstNameInput.dispatchEvent(new Event("input", { bubbles: true }));
              firstNameInput.dispatchEvent(new Event("change", { bubbles: true }));
              this.logger("İsim alanı manuel olarak dolduruldu", "info");
            }
          } catch (error) {
            this.logger(`İsim alanı doldurma hatası: ${error.message}`, "error");
          }
        } else {
          this.logger("İsim alanı bulunamadı! Tüm denemeler başarısız oldu.", "error");
        }
      }

      // Soyisim alanını doldur (eğer daha önce doldurulmadıysa)
      if (!this.isFieldProcessed("cursor-lastName")) {
        let lastNameInput = null;
        let attempts = 0;
        const maxAttempts = 5;

        // Soyisim alanını bulmak için birkaç deneme yap
        while (!lastNameInput && attempts < maxAttempts) {
          try {
            attempts++;
            this.logger(`Soyisim alanı aranıyor (${attempts}/${maxAttempts})...`, "info");

            // Doğrudan DOM'dan alma dene
            lastNameInput = document.querySelector('input[name="last_name"]');

            // Bulunamadıysa waitForElement ile dene
            if (!lastNameInput) {
              this.logger("Soyisim alanı doğrudan bulunamadı, waitForElement ile deneniyor...", "info");
              lastNameInput = await window.automationHelpers.waitForElement('input[name="last_name"]', 5, 500);
            }

            if (lastNameInput) {
              break;
            } else {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          } catch (error) {
            this.logger(`Soyisim alanı arama denemesi ${attempts} başarısız: ${error.message}`, "warning");
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        if (lastNameInput) {
          this.logger("Soyisim alanı bulundu, dolduruluyor...", "success");
          try {
            await window.automationHelpers.fillInput(lastNameInput, name.lastName);
            this.logger(`Soyisim alanı dolduruldu: ${name.lastName}`, "success");
            this.markFieldAsProcessed("cursor-lastName");

            // Doğrulama
            if (lastNameInput.value !== name.lastName) {
              this.logger("Soyisim alanı doldurma işlemi sonrası değer kontrolü başarısız!", "warning");
              // Manuel olarak tekrar doldur
              lastNameInput.value = name.lastName;
              lastNameInput.dispatchEvent(new Event("input", { bubbles: true }));
              lastNameInput.dispatchEvent(new Event("change", { bubbles: true }));
              this.logger("Soyisim alanı manuel olarak dolduruldu", "info");
            }
          } catch (error) {
            this.logger(`Soyisim alanı doldurma hatası: ${error.message}`, "error");
          }
        } else {
          this.logger("Soyisim alanı bulunamadı! Tüm denemeler başarısız oldu.", "error");
        }
      }

      // Email alanındaki değişiklikleri dinle (eğer daha önce dinlenmediyse)
      if (!this.isFieldProcessed("cursor-email-listener")) {
        try {
          const emailInput = await window.automationHelpers.waitForElement('input[name="email"]', 10, 500);

          if (emailInput) {
            // Email input değişikliğini dinle
            emailInput.addEventListener("change", () => {
              this.currentEmail = emailInput.value;
              this.logger(`Email adresi alındı: ${this.currentEmail}`);
            });

            this.markFieldAsProcessed("cursor-email-listener");
            this.logger("Email alanı dinleniyor");
          }
        } catch (error) {
          this.logger(`Email alanı bulunamadı: ${error.message}`, "warning");
        }
      }
    } catch (error) {
      this.logger(`Kayıt formu doldurma hatası: ${error.message}`, "error");
    }
  }

  /**
   * Cursor şifre adımını doldurur
   * @returns {Promise<void>}
   */
  async fillCursorPasswordStep() {
    try {
      this.logger("Cursor şifre alanı tespit ediliyor...");

      // Şifre alanı var mı kontrol et
      const passwordInput = document.querySelector('input[name="password"]');

      // Şifre alanı yoksa fonksiyonu sonlandır
      if (!passwordInput) {
        this.logger("Şifre alanı henüz yüklenmedi", "warning");
        return;
      }

      this.logger("Cursor şifre alanı dolduruluyor...");

      // Şifre oluştur (eğer daha önce oluşturulmadıysa)
      if (!this.currentPassword) {
        this.currentPassword = window.automationHelpers.generatePassword();
        this.logger(`Yeni şifre oluşturuldu: ${this.currentPassword}`);
      }

      // Şifre alanını doldur (eğer daha önce doldurulmadıysa)
      if (!this.isFieldProcessed("cursor-password")) {
        await window.automationHelpers.fillInput(passwordInput, this.currentPassword);
        this.markFieldAsProcessed("cursor-password");
        this.logger("Şifre alanı dolduruldu");
      }

      // Hesap bilgilerini kaydet
      if (this.currentEmail) {
        await window.accountDB.addCursorAccount({
          email: this.currentEmail,
          password: this.currentPassword,
        });

        this.logger("Hesap bilgileri geçici olarak kaydedildi");
      } else {
        this.logger("Email adresi bulunamadı, sadece şifre kaydedildi", "warning");
      }
    } catch (error) {
      this.logger(`Şifre alanı doldurma hatası: ${error.message}`, "error");
    }
  }

  /**
   * Cursor oturum token'ını çıkarır
   * @returns {Promise<{token: string, source: string}>}
   */
  async extractCursorSessionToken() {
    try {
      const cookieData = await this.getCursorCookie();

      if (!cookieData || !cookieData.value) {
        this.logger("Cookie içeriği bulunamadı", "error");
        return null;
      }

      let token = cookieData.value;
      let tokenSource = cookieData.source || "cookie";

      // Token'ı ham haliyle kullan, bölme işlemi yapma
      this.logger("Token ham haliyle kullanılıyor", "info");

      // Token, base64 karakterleri ve tireleri içermeli, ancak üçlü nokta içermemeli
      const tokenRegex = /^[A-Za-z0-9+/=_-]+$/;
      if (!tokenRegex.test(token)) {
        this.logger("Token formatı geçersiz görünüyor", "warning");

        // Base64 formatına yakın bir şey varmı diye kontrol edelim
        const possibleToken = token.match(/([A-Za-z0-9+/=_-]{10,})/);
        if (possibleToken && possibleToken[0]) {
          token = possibleToken[0];
          this.logger("Regex ile token ayrıştırıldı", "info");
        }
      }

      if (!token || token.length < 10) {
        this.logger("Geçerli bir token bulunamadı", "error");
        return null;
      }

      this.logger(`Token alındı (${token.substring(0, 10)}...) (Kaynak: ${tokenSource})`, "success");
      return { token, source: tokenSource };
    } catch (error) {
      this.logger(`Token çıkarma hatası: ${error.message}`, "error");
      return null;
    }
  }

  /**
   * Cursor sitesinden cookie değerini alır
   * @returns {Promise<{value: string, source: string}|null>} Cookie değeri veya null
   */
  async getCursorCookie() {
    try {
      // Background script aracılığıyla cookie alınıyor
      return new Promise((resolve) => {
        this.logger("Background script aracılığıyla cookie alınıyor...", "info");

        // Birincil cookie alma metodu: Background script'e getCookie mesajı gönder
        chrome.runtime.sendMessage(
          {
            action: "getCookie",
            details: {
              url: "https://www.cursor.com",
              name: "WorkosCursorSessionToken",
            },
          },
          (response) => {
            if (response && response.success && response.cookie) {
              this.logger("Background script aracılığıyla cookie alındı", "success");
              resolve({ value: response.cookie.value, source: "background-api" });
              return;
            }

            // İlk yöntem başarısız olduysa, tüm cookie'leri almayı dene
            this.logger("Ana cookie bulunamadı, alternatif cookie'ler kontrol ediliyor", "warning");

            chrome.runtime.sendMessage(
              {
                action: "getAllCookies",
                details: { domain: "cursor.com" },
              },
              (response) => {
                if (response && response.success && response.cookies && response.cookies.length > 0) {
                  // İlgili cookie'yi bul
                  const cursorCookie = response.cookies.find((c) => c.name.includes("Cursor") || c.name.includes("cursor") || c.name.includes("Session") || c.name.includes("session") || c.name.includes("Token") || c.name.includes("token"));

                  if (cursorCookie) {
                    this.logger(`Alternatif cookie bulundu: ${cursorCookie.name}`, "info");
                    resolve({ value: cursorCookie.value, source: "background-alt-cookie" });
                    return;
                  }
                }

                // Son çare: Document cookie'yi kontrol et
                this.tryDocumentCookie(resolve);
              }
            );
          }
        );
      });
    } catch (error) {
      this.logger(`Cookie alma hatası: ${error.message}`, "error");
      return null;
    }
  }

  /**
   * Document cookie'den token almayı dener
   * @param {Function} resolve - Promise resolve fonksiyonu
   */
  tryDocumentCookie(resolve) {
    try {
      const docCookies = document.cookie;
      const cookieMatch = docCookies.match(/WorkosCursorSessionToken=([^;]+)/);

      if (cookieMatch && cookieMatch[1]) {
        this.logger("Document.cookie üzerinden cookie bulundu", "info");
        resolve({ value: cookieMatch[1], source: "document-cookie" });
      } else {
        this.logger("Hiçbir cookie bulunamadı", "error");
        resolve(null);
      }
    } catch (error) {
      this.logger(`Document cookie hatası: ${error.message}`, "error");
      resolve(null);
    }
  }

  /**
   * İşlenmiş form alanlarını temizler
   */
  resetProcessedFields() {
    this.processedFields.clear();
    this.logger("İşlenmiş form alanları temizlendi");
  }

  /**
   * Cursor token'ının geçerliliğini test eder
   * @param {string} token - Test edilecek token
   * @returns {Promise<boolean>} Token geçerli mi
   */
  async testCursorToken(token) {
    try {
      this.logger("Cursor token geçerliliği test ediliyor (Background Script aracılığıyla)...");

      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            action: "testCursorToken",
            token: token,
          },
          (response) => {
            if (!response) {
              this.logger("Background script'ten yanıt alınamadı", "error");
              resolve(false);
              return;
            }

            if (!response.success) {
              this.logger(`Token test hatası: ${response.error}`, "error");
              resolve(false);
              return;
            }

            const isValid = response.isValid;

            if (isValid) {
              this.logger("Cursor token geçerli", "success");
            } else {
              // Hata detaylarını göster
              if (response.status) {
                this.logger(`Cursor token geçersiz. HTTP Durum Kodu: ${response.status}`, "error");

                if (response.errorDetails) {
                  try {
                    // JSON formatında olabilir, deneyelim
                    const errorJson = JSON.parse(response.errorDetails);
                    this.logger(`Hata Detayı: ${JSON.stringify(errorJson)}`, "error");
                  } catch (e) {
                    // JSON değilse düz metin olarak göster
                    this.logger(`Hata Detayı: ${response.errorDetails}`, "error");
                  }
                }

                // Popup ile göster
                alert(`Token Doğrulama Hatası!\nHTTP Durum Kodu: ${response.status}\n${response.errorDetails ? `Hata Detayı: ${response.errorDetails.substring(0, 100)}...` : ""}`);
              } else {
                this.logger("Cursor token geçersiz", "error");
              }
            }

            resolve(isValid);
          }
        );
      });
    } catch (error) {
      this.logger(`Token test hatası: ${error.message}`, "error");
      return false;
    }
  }

  /**
   * Cursor token'ını kaydeder
   * @returns {Promise<boolean>} İşlem başarılı mı
   */
  async saveCursorToken() {
    try {
      this.logger("Cursor token alma ve kaydetme işlemi başlatılıyor...", "info");

      // Bu fonksiyon artık loginDeepPage'deki manuel token girişi ile çalışacak
      // Eski token alma işlemi kullanılmayacak, bu fonksiyon sadece geriye dönük uyumluluk için tutuldu
      this.logger("Token alma işlemi değiştirildi. Doğrudan token girişi bekleniyor...", "info");
      return false;
    } catch (error) {
      this.logger(`Token alma ve kaydetme hatası: ${error.message}`, "error");
      return false;
    }
  }

  /**
   * Cursor token'ını Chrome API kullanarak al
   * @returns {Promise<string>} İşlenmiş token
   */
  async getCursorToken() {
    return new Promise((resolve, reject) => {
      try {
        // Bu fonksiyon artık kullanılmayacak, tarayıcıdan token almayacağız
        this.logger("Token alma işlemi değiştirildi. Doğrudan token girişi bekleniyor...", "info");
        reject(new Error("Bu özellik kaldırıldı, doğrudan token girişi bekleniyor"));
      } catch (error) {
        this.logger(`Token alma hatası: ${error.message}`, "error");
        reject(error);
      }
    });
  }

  /**
   * Cursor token'ını al ve kaydet
   * @returns {Promise<boolean>} İşlem başarılı mı
   */
  async saveCursorTokenWithApi() {
    try {
      this.logger("Token alma ve kaydetme işlemi değiştirildi. Doğrudan token girişi bekleniyor...", "info");
      return false;
    } catch (error) {
      this.logger(`Token alma ve kaydetme hatası: ${error.message}`, "error");
      return false;
    }
  }

  /**
   * Verilen token'ı doğrulayıp kaydet
   * @param {string} token - Kullanıcı tarafından girilen token
   * @returns {Promise<boolean>} İşlem başarılı mı
   */
  async saveManualToken(token) {
    try {
      if (!token) {
        this.logger("Geçersiz token, boş değer girildi", "error");
        return false;
      }

      this.logger(`Manuel girilen token doğrulanıyor...`, "info");

      // Token geçerliliğini test et
      const isValid = await this.testCursorToken(token);

      if (!isValid) {
        this.logger("Token geçerli değil, kaydedilmedi", "error");
        return false;
      }

      // Kaydedilecek hesap bilgilerini belirle
      let accountData = { token };

      // Mevcut oturumda email/şifre var mı kontrol et
      if (this.currentEmail && this.currentPassword) {
        accountData.email = this.currentEmail;
        accountData.password = this.currentPassword;
        this.logger(`Mevcut oturumdaki hesap bilgileri kullanılıyor: ${this.currentEmail}`, "info");
      } else {
        // Mevcut oturumda bilgi yoksa, veritabanındaki son kaydedilen email/şifre bilgisini al
        const accounts = await window.accountDB.getCursorAccounts();

        // Email ve şifresi olan ama tokeni olmayan hesapları bul
        const pendingAccounts = accounts.filter((acc) => acc.email && acc.password && !acc.token);

        if (pendingAccounts.length > 0) {
          // Timestamp'e göre sırala, en yeni kayıt en üstte olsun
          pendingAccounts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

          // En son kayıtlı hesabın bilgilerini al
          const lastAccount = pendingAccounts[0];
          accountData.email = lastAccount.email;
          accountData.password = lastAccount.password;

          this.logger(`Son kaydedilen hesap bilgileri kullanılıyor: ${lastAccount.email}`, "info");
        } else {
          this.logger("Email/şifre bilgisi bulunamadı, token bağımsız olarak kaydedilecek", "warning");
        }
      }

      // Token ile birlikte hesap bilgilerini kaydet
      await window.accountDB.addCursorAccount(accountData);

      if (accountData.email) {
        this.logger(`Token email (${accountData.email}) ve şifre ile birlikte kaydedildi`, "success");
      } else {
        this.logger("Token kaydedildi (email/şifre olmadan)", "warning");
      }

      return true;
    } catch (error) {
      this.logger(`Token kaydetme hatası: ${error.message}`, "error");
      return false;
    }
  }
}

// Global scope'ta erişilebilir instance
window.formFiller = new FormFiller();
