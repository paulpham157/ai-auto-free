document.addEventListener("DOMContentLoaded", function () {
  console.log("Admin dashboard yükleniyor...");

  // Sayfa yüklendiğinde oturum kontrolü yapan fonksiyon
  checkSessionOnLoad();

  // Özellikleri yükle
  loadFeatures();

  // Günlük giriş istatistiklerini yükle
  loadDailyLoginStats();

  // Döviz kurlarını ve kredi değerlerini yükle
  loadCurrencyData();

  // Periyodik olarak oturum durumunu kontrol et (her 30 saniyede bir)
  setInterval(checkSession, 30000);

  // Hesaplama butonunu dinle
  document.getElementById("calculateBtn").addEventListener("click", calculateCredits);

  // Filtre durumunu takip etmek için değişken
  let filtersApplied = false;

  // 401 hatası kontrolü için tüm fetch isteklerini yakalayan fonksiyon
  const originalFetch = window.fetch;
  window.fetch = function (url, options) {
    return originalFetch(url, options)
      .then((response) => {
        if (response.status === 401) {
          console.log("Oturum geçersiz, yeniden giriş yapmanız gerekiyor.");
          // Sayfayı yenilemeden önce kullanıcıya bilgi ver
          alert("Oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.");
          window.location.href = "/admin";
          return Promise.reject("Oturum geçersiz");
        }
        return response;
      })
      .catch((error) => {
        // Network hatalarını yakala
        if (error.message && error.message.includes("Failed to fetch")) {
          console.log("Ağ hatası, sunucuya erişilemiyor.");
        }
        return Promise.reject(error);
      });
  };

  // Periyodik olarak oturum durumunu kontrol et (her 30 saniyede bir)
  function checkSession() {
    fetch("/admin/check-session")
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Oturum geçersiz");
        }
      })
      .then((data) => {
        console.log("Oturum kontrolü başarılı:", data.status);
      })
      .catch((error) => {
        console.log("Oturum kontrolü sırasında hata:", error);
        // Oturum geçersizse sayfayı yenile
        if (error.message === "Oturum geçersiz") {
          alert("Oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.");
          window.location.href = "/admin";
        }
      });
  }

  // İlk kontrolü 30 saniye sonra yap, sonra her 30 saniyede bir tekrarla
  setTimeout(() => {
    checkSession();
    setInterval(checkSession, 30 * 1000); // 30 saniye
  }, 30 * 1000);

  // Feature seçimine göre windsurf alanlarını göster/gizle
  document.getElementById("accountFeature").addEventListener("change", function () {
    const windsurfFields = document.getElementById("windsurfFields");
    if (this.value === "windsurf_auth") {
      windsurfFields.style.display = "block";
    } else {
      windsurfFields.style.display = "none";
    }
  });

  // Düzenleme modalında feature seçimine göre windsurf alanlarını göster/gizle
  document.getElementById("editAccountFeature").addEventListener("change", function () {
    const editWindsurfFields = document.getElementById("editWindsurfFields");
    if (this.value === "windsurf_auth") {
      editWindsurfFields.style.display = "block";
    } else {
      editWindsurfFields.style.display = "none";
    }
  });

  // Çoklu hesap ekleme modalında feature seçimine göre format açıklamasını değiştir
  document.getElementById("accountFeatureMultiple").addEventListener("change", function () {
    const formatDescription = document.getElementById("formatDescription");
    const windsurfFormatDescription = document.getElementById("windsurfFormatDescription");

    if (this.value === "windsurf_auth") {
      formatDescription.style.display = "none";
      windsurfFormatDescription.style.display = "block";
    } else {
      formatDescription.style.display = "block";
      windsurfFormatDescription.style.display = "none";
    }
  });

  // Hesapları Göster butonuna tıklama olayı
  document.getElementById("loadPoolAccountsBtn").addEventListener("click", function () {
    loadPoolAccounts();
  });

  // Filtreleri uygula butonuna tıklama olayı
  document.getElementById("applyFiltersBtn").addEventListener("click", function () {
    applyAccountFilters();
  });

  // Aktif hesapları temizleme butonu
  document.getElementById("clearActiveAccountsBtn").addEventListener("click", clearActiveAccounts);

  // Özellik ekleme/düzenleme modalları için stil ekle
  const style = document.createElement("style");
  style.textContent = `
    .feature-modal .nav-tabs .nav-link {
      padding: 8px 15px;
      border-radius: 5px 5px 0 0;
      font-weight: 500;
    }
    .feature-modal .nav-tabs .nav-link.active {
      background-color: #f8f9fa;
      border-color: #dee2e6 #dee2e6 #f8f9fa;
    }
    .feature-modal .tab-content {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-top: none;
      padding: 20px;
      border-radius: 0 0 5px 5px;
    }
    .feature-modal .form-label {
      font-weight: 500;
    }
    .feature-modal .form-check-label {
      font-weight: normal;
    }
    .feature-modal .card {
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .feature-modal .card-header {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    .feature-item.dragging {
      opacity: 0.5;
      border: 2px dashed #0d6efd !important;
    }
    .feature-item.drag-over {
      border-top: 3px solid #0d6efd !important;
    }
    .drag-handle {
      cursor: grab;
    }
    .drag-handle:active {
      cursor: grabbing;
    }
    .feature-item {
      transition: all 0.2s ease;
    }
    .feature-item:hover {
      transform: translateY(-2px);
    }
    #addFeatureModal, #editFeatureModal {
      --bs-modal-width: 800px;
    }
  `;
  document.head.appendChild(style);

  // Addon görünürlüğünü kontrol eden olay dinleyicileri
  document.getElementById("hasAddon").addEventListener("change", function () {
    document.getElementById("addonSection").style.display = this.checked ? "block" : "none";
  });

  document.getElementById("editHasAddon").addEventListener("change", function () {
    document.getElementById("editAddonSection").style.display = this.checked ? "block" : "none";
  });

  // Mobil menü işlevleri
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  sidebarToggle.addEventListener("click", function () {
    sidebar.classList.toggle("show");
    sidebarOverlay.style.display = sidebar.classList.contains("show") ? "block" : "none";
  });

  sidebarOverlay.addEventListener("click", function () {
    sidebar.classList.remove("show");
    sidebarOverlay.style.display = "none";
  });

  // Mobil görünümde menü öğelerine tıklandığında menüyü kapat
  document.querySelectorAll(".nav-link[data-tab]").forEach((link) => {
    link.addEventListener("click", function () {
      if (window.innerWidth < 992) {
        sidebar.classList.remove("show");
        sidebarOverlay.style.display = "none";
      }
    });
  });

  // Pencere boyutu değiştiğinde overlay'i kontrol et
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 992) {
      sidebarOverlay.style.display = "none";
      sidebar.classList.remove("show");
    }
  });

  // İlk tab'ı aktif et
  document.querySelector('.nav-link[data-tab="user-tab"]').classList.add("active");
  document.getElementById("user-tab").classList.add("active");

  // Tab değiştirme olayları
  document.querySelectorAll(".nav-link[data-tab]").forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();

      // Aktif tab'ı kaldır
      document.querySelectorAll(".nav-link[data-tab]").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));

      // Yeni tab'ı aktif et
      this.classList.add("active");
      const tabId = this.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");

      // Tab değiştiğinde ilgili verileri yükle
      if (tabId === "pool-accounts") {
        // Havuz hesaplarını otomatik yükleme, buton ile yüklenecek
        document.getElementById("poolAccountsTable").innerHTML = "<tr><td colspan='5' class='text-center'>Hesapları görmek için \"Hesapları Göster\" butonuna tıklayın.</td></tr>";
      } else if (tabId === "active-accounts") {
        loadActiveAccounts();
      } else if (tabId === "notifications-tab") {
        loadNotifications();
      } else if (tabId === "services-tab") {
        loadServices();
      } else if (tabId === "pricing-tab") {
        loadPricing();
      } else if (tabId === "update-tab") {
        loadCheckUpdate();
      }
    });
  });

  // Kullanıcı arama formu
  document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const uuid = document.getElementById("uuid").value;

    fetch("/admin/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uuid }),
    })
      .then((response) => response.json())
      .then((data) => {
        const resultDiv = document.getElementById("searchResult");

        if (data.error) {
          resultDiv.innerHTML = `
                <div class="alert alert-danger">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>${data.error}
                </div>
              `;
        } else {
          // Kullanıcı bilgilerini JSON formatında göstermek için stil
          const jsonStyle = `
            .json-view {
              background-color: #1e1e1e;
              color: #d4d4d4;
              border-radius: 5px;
              padding: 15px;
              font-family: 'Consolas', 'Monaco', monospace;
              overflow-x: auto;
              margin-top: 15px;
            }
            .json-key {
              color: #9cdcfe;
            }
            .json-string {
              color: #ce9178;
            }
            .json-number {
              color: #b5cea8;
            }
            .json-boolean {
              color: #569cd6;
            }
            .json-null {
              color: #569cd6;
            }
            .json-mark {
              color: #d4d4d4;
            }
            .json-toggle {
              cursor: pointer;
              color: #808080;
              margin-right: 5px;
            }
            .json-toggle:before {
              content: "▼";
              display: inline-block;
              width: 12px;
            }
            .json-toggle.collapsed:before {
              content: "►";
            }
            .json-hidden {
              display: none;
            }
          `;

          // Stil ekle
          if (!document.getElementById("json-view-style")) {
            const styleEl = document.createElement("style");
            styleEl.id = "json-view-style";
            styleEl.textContent = jsonStyle;
            document.head.appendChild(styleEl);
          }

          // Cihaz bilgilerini hazırla
          let deviceInfoHTML = "";
          if (data.deviceInfo) {
            const deviceInfo = data.deviceInfo;
            deviceInfoHTML = `
              <div class="mt-3">
                <h6 class="fw-bold">Cihaz Bilgileri</h6>
                <div class="table-responsive">
                  <table class="table table-bordered table-striped table-sm">
                    <tr>
                      <th style="width: 40%;">Bilgisayar Adı</th>
                      <td>${deviceInfo.computerName || "-"}</td>
                    </tr>
                    <tr>
                      <th>Cihaz ID</th>
                      <td class="text-monospace">${deviceInfo.deviceId || "-"}</td>
                    </tr>
                    <tr>
                      <th>IP Adresi</th>
                      <td>${deviceInfo.ipAddress || "-"}</td>
                    </tr>
                    <tr>
                      <th>MAC Adresi</th>
                      <td>${deviceInfo.macAddress || "-"}</td>
                    </tr>
                    <tr>
                      <th>Kullanıcı Adı</th>
                      <td>${deviceInfo.username || "-"}</td>
                    </tr>
                    <tr>
                      <th>İşletim Sistemi</th>
                      <td>${deviceInfo.osName || "-"}</td>
                    </tr>
                    <tr>
                      <th>Ürün Adı</th>
                      <td>${deviceInfo.productName || "-"}</td>
                    </tr>
                    <tr>
                      <th>Yerel Ayar</th>
                      <td>${deviceInfo.locale || "-"}</td>
                    </tr>
                    <tr>
                      <th>İşlemci Çekirdek Sayısı</th>
                      <td>${deviceInfo.numberOfCores || "-"}</td>
                    </tr>
                    <tr>
                      <th>Sistem Belleği (MB)</th>
                      <td>${deviceInfo.systemMemoryInMegabytes || "-"}</td>
                    </tr>
                    <tr>
                      <th>Model</th>
                      <td>${deviceInfo.model || "-"}</td>
                    </tr>
                  </table>
                </div>
              </div>
            `;
          } else {
            deviceInfoHTML = `
              <div class="mt-3">
                <div class="alert alert-info">
                  <i class="bi bi-info-circle me-2"></i>Bu kullanıcı için cihaz bilgisi bulunmamaktadır.
                </div>
              </div>
            `;
          }

          // Ban durumu bilgisini hazırla
          let banStatusHTML = "";
          if (data.isBanned) {
            banStatusHTML = `
              <div class="alert alert-danger mt-3">
                <h6 class="fw-bold"><i class="bi bi-ban me-2"></i>Bu Kullanıcı Banlı</h6>
                <div><span class="fw-bold">Ban Sebebi:</span> ${data.banInfo.reason || "Belirtilmemiş"}</div>
                <div><span class="fw-bold">Ban Tarihi:</span> ${new Date(data.banInfo.date).toLocaleString()}</div>
              </div>
            `;
          }

          // Tüm kullanıcı verilerini JSON formatında göster
          const userDataJSON = JSON.stringify(data, null, 2);
          const formattedJSON = formatJSON(userDataJSON);

          resultDiv.innerHTML = `
                <div class="card">
                  <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Kullanıcı Bilgileri</h5>
                  </div>
                  <div class="card-body">
                    <div class="row mb-3">
                      <div class="col-md-4 fw-bold">UUID:</div>
                      <div class="col-md-8 token-cell">${data.uuid}</div>
                    </div>
                    <div class="row mb-3">
                      <div class="col-md-4 fw-bold">Kredi:</div>
                      <div class="col-md-8">
                        <input type="number" id="credits" class="form-control" value="${data.credits}">
                      </div>
                    </div>
                    ${deviceInfoHTML}
                    ${banStatusHTML}
                    <div class="mt-3">
                      <button id="updateCreditsBtn" class="btn btn-success">
                        <i class="bi bi-check-circle me-2"></i>Krediyi Güncelle
                      </button>
                      ${
                        !data.isBanned
                          ? `<button id="banUserBtn" class="btn btn-danger ms-2">
                          <i class="bi bi-ban me-2"></i>Kullanıcıyı Banla
                        </button>`
                          : `<button id="unbanUserBtn" class="btn btn-warning ms-2">
                          <i class="bi bi-unlock me-2"></i>Ban Kaldır
                        </button>`
                      }
                    </div>
                  </div>
                </div>
              `;

          // Kredi güncelleme butonu için event listener ekle
          document.getElementById("updateCreditsBtn").addEventListener("click", function () {
            updateCredits(data.uuid);
          });

          // Ban butonu için event listener
          if (document.getElementById("banUserBtn")) {
            document.getElementById("banUserBtn").addEventListener("click", function () {
              if (confirm(`${data.uuid} ID'li kullanıcıyı banlamak istediğinizden emin misiniz?`)) {
                // Ban sebebi için prompt göster
                const banReason = prompt("Ban sebebini giriniz:", "Sistem tarafından engellendi");

                if (banReason !== null) {
                  // Kullanıcının cihaz bilgilerini kontrol et
                  if (!data.deviceInfo || (!data.deviceInfo.deviceId && !data.deviceInfo.macAddress)) {
                    alert("Bu kullanıcının cihaz bilgileri bulunamadı. Banlama işlemi yapılamıyor.");
                    return;
                  }

                  // Ban API'sine istek gönder
                  fetch("/admin/ban-device", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem("adminToken")}`, // Admin token'ını ekle
                    },
                    body: JSON.stringify({
                      deviceId: data.deviceInfo.deviceId || "",
                      macAddress: data.deviceInfo.macAddress || "",
                      banReason: banReason,
                      ipAddress: data.deviceInfo.ipAddress || "",
                      additionalInfo: {
                        uuid: data.uuid,
                        banDate: new Date().toISOString(),
                        computerName: data.deviceInfo.computerName || "",
                        username: data.deviceInfo.username || "",
                        locale: data.deviceInfo.locale || "",
                        osName: data.deviceInfo.osName || "",
                        productName: data.deviceInfo.productName || "",
                        numberOfCores: data.deviceInfo.numberOfCores || "",
                        systemMemoryInMegabytes: data.deviceInfo.systemMemoryInMegabytes || "",
                        model: data.deviceInfo.model || "",
                      },
                    }),
                  })
                    .then((response) => response.json())
                    .then((result) => {
                      if (result.success) {
                        alert("Kullanıcı başarıyla banlandı!");
                        // Arama sonuçlarını güncelle
                        document.getElementById("searchForm").dispatchEvent(new Event("submit"));
                      } else {
                        alert("Banlama işlemi başarısız oldu: " + (result.error || "Bilinmeyen hata"));
                      }
                    })
                    .catch((error) => {
                      console.error("Ban işlemi hatası:", error);
                      alert("Banlama işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
                    });
                }
              }
            });
          }

          // Ban kaldırma butonu için event listener
          if (document.getElementById("unbanUserBtn")) {
            document.getElementById("unbanUserBtn").addEventListener("click", function () {
              if (confirm(`${data.uuid} ID'li kullanıcının banını kaldırmak istediğinizden emin misiniz?`)) {
                // Ban kaldırma API'sine istek gönder
                fetch(`/admin/unban-device/${data.banInfo.id}`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`, // Admin token'ını ekle
                  },
                })
                  .then((response) => response.json())
                  .then((result) => {
                    if (result.success) {
                      alert("Kullanıcının banı başarıyla kaldırıldı!");
                      // Arama sonuçlarını güncelle
                      document.getElementById("searchForm").dispatchEvent(new Event("submit"));
                    } else {
                      alert("Ban kaldırma işlemi başarısız oldu: " + (result.error || "Bilinmeyen hata"));
                    }
                  })
                  .catch((error) => {
                    console.error("Ban kaldırma hatası:", error);
                    alert("Ban kaldırma işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
                  });
              }
            });
          }

          // JSON içindeki toggle butonları için event listener
          document.querySelectorAll(".json-toggle").forEach((toggle) => {
            toggle.addEventListener("click", function () {
              this.classList.toggle("collapsed");
              const content = this.nextElementSibling;
              if (content.classList.contains("json-hidden")) {
                content.classList.remove("json-hidden");
              } else {
                content.classList.add("json-hidden");
              }
            });
          });
        }

        resultDiv.style.display = "block";
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("searchResult").innerHTML = `
              <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>Bir hata oluştu. Lütfen tekrar deneyin.
              </div>
            `;
        document.getElementById("searchResult").style.display = "block";
      });
  });

  // Yeni hesap ekleme
  document.getElementById("saveAccountBtn").addEventListener("click", function () {
    const token = document.getElementById("accountToken").value;
    const email = document.getElementById("accountEmail").value;
    const password = document.getElementById("accountPassword").value;
    const featureKey = document.getElementById("accountFeature").value;

    if (!email || !password || !featureKey) {
      // Feature seçimini kontrol et
      alert("Lütfen email, şifre ve özellik alanlarını doldurun!");
      return;
    }

    // Hesap verilerini oluştur
    const accountData = { token, email, password, featureKey };

    // Eğer windsurf seçilmişse apiKey ve refreshToken alanlarını da ekle
    if (featureKey === "windsurf_auth") {
      const apiKey = document.getElementById("accountApiKey").value;
      const refreshToken = document.getElementById("accountRefreshToken").value;

      // apiKey ve refreshToken zorunlu değil, varsa ekle
      if (apiKey) accountData.apiKey = apiKey;
      if (refreshToken) accountData.refreshToken = refreshToken;
    }

    fetch("/admin/accounts/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(accountData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Hesap başarıyla eklendi!");
          document.getElementById("addAccountForm").reset();
          bootstrap.Modal.getInstance(document.getElementById("addAccountModal")).hide();
          // Otomatik yüklemeyi kaldırıyoruz
          // loadPoolAccounts();
        } else {
          alert("Hata: " + data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Bir hata oluştu. Lütfen tekrar deneyin.");
      });
  });

  // Hesap güncelleme
  document.getElementById("updateAccountBtn").addEventListener("click", function () {
    const id = document.getElementById("editAccountId").value;
    const token = document.getElementById("editAccountToken").value;
    const email = document.getElementById("editAccountEmail").value;
    const password = document.getElementById("editAccountPassword").value;
    const featureKey = document.getElementById("editAccountFeature").value;

    if (!email || !password) {
      alert("Lütfen email ve şifre alanlarını doldurun!");
      return;
    }

    // Hesap verilerini oluştur
    const accountData = { id, token, email, password, featureKey };

    // Eğer windsurf seçilmişse apiKey ve refreshToken alanlarını da ekle
    if (featureKey === "windsurf_auth") {
      const apiKey = document.getElementById("editAccountApiKey").value;
      const refreshToken = document.getElementById("editAccountRefreshToken").value;

      // apiKey ve refreshToken zorunlu değil, varsa ekle
      if (apiKey) accountData.apiKey = apiKey;
      if (refreshToken) accountData.refreshToken = refreshToken;
    }

    fetch("/admin/accounts/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(accountData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Hesap başarıyla güncellendi!");
          bootstrap.Modal.getInstance(document.getElementById("editAccountModal")).hide();
          // Otomatik yüklemeyi kaldırıyoruz
          // loadPoolAccounts();
        } else {
          alert("Hata: " + data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Bir hata oluştu. Lütfen tekrar deneyin.");
      });
  });

  // Hesap silme
  document.getElementById("deleteAccountBtn").addEventListener("click", function () {
    if (confirm("Bu hesabı silmek istediğinizden emin misiniz?")) {
      const id = document.getElementById("editAccountId").value;
      const featureKey = document.getElementById("editAccountFeature").value;

      fetch("/admin/accounts/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, featureKey }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Hesap başarıyla silindi!");
            bootstrap.Modal.getInstance(document.getElementById("editAccountModal")).hide();
            // Otomatik yüklemeyi kaldırıyoruz
            // loadPoolAccounts();
          } else {
            alert("Hata: " + data.error);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        });
    }
  });

  // Servis ayarlarını kaydetme butonu
  document.getElementById("saveServicesBtn").addEventListener("click", function () {
    // Mevcut servisleri güncelle
    const services = {
      repository: document.getElementById("repositoryUrl").value,
      needs: document
        .getElementById("needsFiles")
        .value.split(",")
        .map((item) => item.trim())
        .filter((item) => item),
      dependencies: document
        .getElementById("dependencies")
        .value.split(",")
        .map((item) => item.trim())
        .filter((item) => item),
    };

    // Servis ayarlarını doğrudan güncelle
    fetch("/admin/services")
      .then((response) => response.json())
      .then((existingServices) => {
        // Önceki özellikleri koru
        services.features = existingServices.features || [];

        // Güncellenmiş services nesnesini sunucuya gönder
        updateServices(services);
      })
      .catch((error) => {
        console.error("Servis bilgilerini alma hatası:", error);
        alert("Servis bilgileri alınırken bir hata oluştu.");
      });
  });

  // Free Credits kaydetme butonu
  document.getElementById("saveFreeCreditsBtn").addEventListener("click", function () {
    // Free credits değerini al
    const freeCredits = parseInt(document.getElementById("freeCredits").value) || 0;

    fetch("/admin/free-credits/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: freeCredits }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Free Credits güncelleme yanıtı:", data);

        if (data.success) {
          showCopyToast("Ücretsiz kredi değeri güncellendi");
        } else {
          alert("Free Credits güncellenirken bir hata oluştu: " + (data.error || "Bilinmeyen hata"));
        }
      })
      .catch((error) => {
        console.error("Free Credits güncelleme hatası:", error);
        alert("Free Credits güncellenirken bir hata oluştu.");
      });
  });

  // Addon bölümünü göster/gizle
  document.getElementById("hasAddon").addEventListener("change", function () {
    document.getElementById("addonSection").style.display = this.checked ? "block" : "none";
  });

  // Düzenleme modalında addon bölümünü göster/gizle
  document.getElementById("editHasAddon").addEventListener("change", function () {
    document.getElementById("editAddonSection").style.display = this.checked ? "block" : "none";
  });

  // Yeni özellik kaydetme butonu
  document.getElementById("saveFeatureBtn").addEventListener("click", function () {
    const name = document.getElementById("featureName").value;
    const nameKey = document.getElementById("featureNameKey").value;
    const fileName = document.getElementById("featureFileName").value;
    const credit = parseInt(document.getElementById("featureCredit").value);
    const pool = document.getElementById("featurePool").checked;
    const isActive = document.getElementById("featureIsActive").checked;
    const hintTr = document.getElementById("featureHintTr").value;
    const hintEn = document.getElementById("featureHintEn").value;
    const hintZh = document.getElementById("featureHintZh").value;
    const args = document
      .getElementById("featureArgs")
      .value.split(",")
      .map((item) => item.trim())
      .filter((item) => item);

    if (!name || !nameKey || !fileName || !hintTr || !hintEn) {
      alert("Lütfen gerekli alanları doldurun!");
      return;
    }

    const newFeature = {
      name,
      nameKey,
      fileName,
      credit,
      pool,
      isActive,
      hint: {
        tr: hintTr,
        en: hintEn,
      },
      args,
    };

    if (hintZh) {
      newFeature.hint.zh = hintZh;
    }

    // Addon varsa ekle
    const hasAddon = document.getElementById("hasAddon").checked;
    if (hasAddon) {
      const addonName = document.getElementById("addonName").value;
      const addonNameKey = document.getElementById("addonNameKey").value;
      const addonFileName = document.getElementById("addonFileName").value;
      const addonCredit = parseInt(document.getElementById("addonCredit").value);
      const addonIsActive = document.getElementById("addonIsActive").checked;
      const addonHintTr = document.getElementById("addonHintTr").value;
      const addonHintEn = document.getElementById("addonHintEn").value;
      const addonHintZh = document.getElementById("addonHintZh").value;
      const addonArgs = document
        .getElementById("addonArgs")
        .value.split(",")
        .map((item) => item.trim())
        .filter((item) => item);

      if (!addonName || !addonNameKey || !addonFileName || !addonHintTr || !addonHintEn) {
        alert("Lütfen eklenti için gerekli alanları doldurun!");
        return;
      }

      newFeature.addon = {
        name: addonName,
        nameKey: addonNameKey,
        fileName: addonFileName,
        credit: addonCredit,
        isActive: addonIsActive,
        hint: {
          tr: addonHintTr,
          en: addonHintEn,
        },
        args: addonArgs,
      };

      if (addonHintZh) {
        newFeature.addon.hint.zh = addonHintZh;
      }
    }

    fetch("/admin/services")
      .then((response) => response.json())
      .then((services) => {
        if (!services.features) {
          services.features = [];
        }

        services.features.push(newFeature);
        updateServices(services);

        document.getElementById("addFeatureForm").reset();
        bootstrap.Modal.getInstance(document.getElementById("addFeatureModal")).hide();
      })
      .catch((error) => {
        console.error("Servis bilgilerini alma hatası:", error);
        alert("Servis bilgileri alınırken bir hata oluştu.");
      });
  });

  // Özellik düzenleme
  function editFeature(feature) {
    // Özellik listesini kontrol et ve gerekirse yükle
    const editAccountFeature = document.getElementById("editAccountFeature");
    if (editAccountFeature && editAccountFeature.options.length <= 1) {
      loadFeatures();
    }

    // Özellik düzenleme modalını doldur
    document.getElementById("editFeatureIndex").value = feature.index;
    document.getElementById("editFeatureName").value = feature.name || "";
    document.getElementById("editFeatureNameKey").value = feature.nameKey || "";
    document.getElementById("editFeatureFileName").value = feature.fileName || "";
    document.getElementById("editFeatureCredit").value = feature.credit || 0;
    document.getElementById("editFeaturePool").checked = feature.pool || false;
    document.getElementById("editFeatureIsActive").checked = feature.isActive || false;
    document.getElementById("editFeatureHintTr").value = feature.hint?.tr || "";
    document.getElementById("editFeatureHintEn").value = feature.hint?.en || "";
    document.getElementById("editFeatureHintZh").value = feature.hint?.zh || "";
    document.getElementById("editFeatureArgs").value = (feature.args || []).join(", ");

    // Addon bilgilerini doldur
    const hasAddon = !!feature.addon;
    document.getElementById("editHasAddon").checked = hasAddon;
    document.getElementById("editAddonSection").style.display = hasAddon ? "block" : "none";

    if (hasAddon) {
      document.getElementById("editAddonName").value = feature.addon.name || "";
      document.getElementById("editAddonNameKey").value = feature.addon.nameKey || "";
      document.getElementById("editAddonFileName").value = feature.addon.fileName || "";
      document.getElementById("editAddonCredit").value = feature.addon.credit || 0;
      document.getElementById("editAddonIsActive").checked = feature.addon.isActive || false;
      document.getElementById("editAddonHintTr").value = feature.addon.hint?.tr || "";
      document.getElementById("editAddonHintEn").value = feature.addon.hint?.en || "";
      document.getElementById("editAddonHintZh").value = feature.addon.hint?.zh || "";
      document.getElementById("editAddonArgs").value = (feature.addon.args || []).join(", ");
    } else {
      // Addon alanlarını temizle
      document.getElementById("editAddonName").value = "";
      document.getElementById("editAddonNameKey").value = "";
      document.getElementById("editAddonFileName").value = "";
      document.getElementById("editAddonCredit").value = 0;
      document.getElementById("editAddonIsActive").checked = false;
      document.getElementById("editAddonHintTr").value = "";
      document.getElementById("editAddonHintEn").value = "";
      document.getElementById("editAddonHintZh").value = "";
      document.getElementById("editAddonArgs").value = "";
    }

    // Modalı göster
    const editFeatureModal = new bootstrap.Modal(document.getElementById("editFeatureModal"));
    editFeatureModal.show();
  }

  // Özellik silme
  function deleteFeature(index, services) {
    // Özelliği services nesnesinden kaldır
    services.features.splice(index, 1);

    // Güncellenmiş services nesnesini sunucuya gönder
    updateServices(services);
  }

  // Özellik güncelleme butonu
  document.getElementById("updateFeatureBtn").addEventListener("click", function () {
    const index = parseInt(document.getElementById("editFeatureIndex").value);
    const name = document.getElementById("editFeatureName").value;
    const nameKey = document.getElementById("editFeatureNameKey").value;
    const fileName = document.getElementById("editFeatureFileName").value;
    const credit = parseInt(document.getElementById("editFeatureCredit").value);
    const pool = document.getElementById("editFeaturePool").checked;
    const isActive = document.getElementById("editFeatureIsActive").checked;
    const hintTr = document.getElementById("editFeatureHintTr").value;
    const hintEn = document.getElementById("editFeatureHintEn").value;
    const hintZh = document.getElementById("editFeatureHintZh").value;
    const args = document
      .getElementById("editFeatureArgs")
      .value.split(",")
      .map((item) => item.trim())
      .filter((item) => item);

    if (!name || !nameKey || !fileName || !hintTr || !hintEn) {
      alert("Lütfen gerekli alanları doldurun!");
      return;
    }

    const updatedFeature = {
      name,
      nameKey,
      fileName,
      credit,
      pool,
      isActive,
      hint: {
        tr: hintTr,
        en: hintEn,
      },
      args,
    };

    if (hintZh) {
      updatedFeature.hint.zh = hintZh;
    }

    // Addon varsa ekle
    const hasAddon = document.getElementById("editHasAddon").checked;
    if (hasAddon) {
      const addonName = document.getElementById("editAddonName").value;
      const addonNameKey = document.getElementById("editAddonNameKey").value;
      const addonFileName = document.getElementById("editAddonFileName").value;
      const addonCredit = parseInt(document.getElementById("editAddonCredit").value);
      const addonIsActive = document.getElementById("editAddonIsActive").checked;
      const addonHintTr = document.getElementById("editAddonHintTr").value;
      const addonHintEn = document.getElementById("editAddonHintEn").value;
      const addonHintZh = document.getElementById("editAddonHintZh").value;
      const addonArgs = document
        .getElementById("editAddonArgs")
        .value.split(",")
        .map((item) => item.trim())
        .filter((item) => item);

      if (!addonName || !addonNameKey || !addonFileName || !addonHintTr || !addonHintEn) {
        alert("Lütfen eklenti için gerekli alanları doldurun!");
        return;
      }

      updatedFeature.addon = {
        name: addonName,
        nameKey: addonNameKey,
        fileName: addonFileName,
        credit: addonCredit,
        isActive: addonIsActive,
        hint: {
          tr: addonHintTr,
          en: addonHintEn,
        },
        args: addonArgs,
      };

      if (addonHintZh) {
        updatedFeature.addon.hint.zh = addonHintZh;
      }
    }

    fetch("/admin/services")
      .then((response) => response.json())
      .then((services) => {
        if (!services.features) {
          services.features = [];
        }

        // Özelliği güncelle
        services.features[index] = updatedFeature;
        updateServices(services);

        // Modalı kapat
        bootstrap.Modal.getInstance(document.getElementById("editFeatureModal")).hide();
      })
      .catch((error) => {
        console.error("Servis bilgilerini alma hatası:", error);
        alert("Servis bilgileri alınırken bir hata oluştu.");
      });
  });

  // Fiyatlandırma bilgilerini yükleme
  function loadPricing() {
    fetch("/admin/pricing")
      .then((response) => response.json())
      .then((data) => {
        if (!data || Object.keys(data).length === 0) {
          alert("Fiyatlandırma bilgileri bulunamadı. Lütfen bilgileri doldurun.");
          return;
        }

        // Form alanlarını doldur
        document.getElementById("creditPrice").value = data.credit_price || 0;
        document.getElementById("pricingName").value = data.name || "";
        document.getElementById("pricingImage").value = data.image || "";
        document.getElementById("pricingUrl").value = data.url || "";

        // Mesajları doldur
        if (data.msg) {
          document.getElementById("pricingMsgTr").value = data.msg.tr || "";
          document.getElementById("pricingMsgEn").value = data.msg.en || "";
          document.getElementById("pricingMsgZh").value = data.msg.zh || "";
        }

        // Sosyal medya öğelerini doldur
        const socialsContainer = document.getElementById("socialsContainer");
        socialsContainer.innerHTML = "";

        if (data.socials && data.socials.length > 0) {
          data.socials.forEach((social, index) => {
            const socialCard = document.createElement("div");
            socialCard.className = "card mb-2";
            socialCard.innerHTML = `
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${social.name}</h6>
                        <button type="button" class="btn btn-sm btn-danger delete-social" data-index="${index}">Sil</button>
                      </div>
                      <p class="mb-1"><small>URL: ${social.url}</small></p>
                      <p class="mb-0"><small>Resim: ${social.image}</small></p>
                    </div>
                  `;
            socialsContainer.appendChild(socialCard);
          });

          // Silme butonlarına olay dinleyicileri ekle
          document.querySelectorAll(".delete-social").forEach((button) => {
            button.addEventListener("click", function () {
              const index = parseInt(this.getAttribute("data-index"));
              if (confirm("Bu sosyal medya öğesini silmek istediğinizden emin misiniz?")) {
                data.socials.splice(index, 1);
                loadPricing(); // Listeyi yenile
              }
            });
          });
        }
      })
      .catch((error) => {
        console.error("Fiyatlandırma bilgilerini yükleme hatası:", error);
        alert("Fiyatlandırma bilgileri yüklenirken bir hata oluştu.");
      });
  }

  // Fiyatlandırma bilgilerini kaydetme
  document.getElementById("savePricingBtn").addEventListener("click", function () {
    // Form verilerini al
    const creditPrice = parseFloat(document.getElementById("creditPrice").value);
    const name = document.getElementById("pricingName").value;
    const image = document.getElementById("pricingImage").value;
    const url = document.getElementById("pricingUrl").value;
    const msgTr = document.getElementById("pricingMsgTr").value;
    const msgEn = document.getElementById("pricingMsgEn").value;
    const msgZh = document.getElementById("pricingMsgZh").value;

    // Sosyal medya öğelerini al
    const socials = [];
    document.querySelectorAll(".delete-social").forEach((button) => {
      const index = parseInt(button.getAttribute("data-index"));
      const socialCard = button.closest(".card");
      const socialName = socialCard.querySelector("h6").textContent;
      const socialUrl = socialCard.querySelector("p:nth-child(2) small").textContent.replace("URL: ", "");
      const socialImage = socialCard.querySelector("p:nth-child(3) small").textContent.replace("Resim: ", "");

      socials.push({
        name: socialName,
        url: socialUrl,
        image: socialImage,
      });
    });

    // Fiyatlandırma nesnesini oluştur
    const pricing = {
      credit_price: creditPrice,
      name: name,
      image: image,
      url: url,
      msg: {
        tr: msgTr,
        en: msgEn,
      },
      socials: socials,
    };

    // Çince mesaj varsa ekle
    if (msgZh) {
      pricing.msg.zh = msgZh;
    }

    // Sunucuya gönder
    fetch("/admin/pricing/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pricing),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Fiyatlandırma bilgileri başarıyla güncellendi.");
          loadPricing(); // Yeniden yükle
        } else {
          alert("Fiyatlandırma bilgileri güncellenirken bir hata oluştu: " + (data.error || "Bilinmeyen hata"));
        }
      })
      .catch((error) => {
        console.error("Fiyatlandırma bilgileri güncelleme hatası:", error);
        alert("Fiyatlandırma bilgileri güncellenirken bir hata oluştu.");
      });
  });

  // Sosyal medya ekleme modalını göster
  document.getElementById("addSocialBtn").addEventListener("click", function () {
    // Form alanlarını temizle
    document.getElementById("addSocialForm").reset();

    // Modalı göster
    const modal = new bootstrap.Modal(document.getElementById("addSocialModal"));
    modal.show();
  });

  // Sosyal medya ekleme
  document.getElementById("saveSocialBtn").addEventListener("click", function () {
    const name = document.getElementById("socialName").value;
    const url = document.getElementById("socialUrl").value;
    const image = document.getElementById("socialImage").value;

    if (!name || !url || !image) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    // Mevcut fiyatlandırma bilgilerini al
    fetch("/admin/pricing")
      .then((response) => response.json())
      .then((data) => {
        if (!data.socials) {
          data.socials = [];
        }

        // Yeni sosyal medya öğesini ekle
        data.socials.push({
          name: name,
          url: url,
          image: image,
        });

        // Sunucuya gönder
        return fetch("/admin/pricing/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Modalı kapat
          bootstrap.Modal.getInstance(document.getElementById("addSocialModal")).hide();

          // Listeyi yenile
          loadPricing();
        } else {
          alert("Sosyal medya eklenirken bir hata oluştu: " + (data.error || "Bilinmeyen hata"));
        }
      })
      .catch((error) => {
        console.error("Sosyal medya ekleme hatası:", error);
        alert("Sosyal medya eklenirken bir hata oluştu.");
      });
  });

  // Güncelleme bilgilerini yükleme
  function loadCheckUpdate() {
    fetch("/admin/check-update")
      .then((response) => response.json())
      .then((data) => {
        if (!data || Object.keys(data).length === 0) {
          alert("Güncelleme bilgileri bulunamadı. Lütfen bilgileri doldurun.");
          return;
        }

        // Form alanlarını doldur
        document.getElementById("updateVersion").value = data.version || "";
        document.getElementById("updateMandatory").checked = data.mandatory || false;
        document.getElementById("updateChanges").value = data.changes || "";

        // URL'leri doldur
        if (data.url) {
          document.getElementById("updateUrlWindows").value = data.url.windows || "";
          document.getElementById("updateUrlMacos").value = data.url.macos || "";
          document.getElementById("updateUrlLinux").value = data.url.linux || "";
        }
      })
      .catch((error) => {
        console.error("Güncelleme bilgilerini yükleme hatası:", error);
        alert("Güncelleme bilgileri yüklenirken bir hata oluştu.");
      });
  }

  // Güncelleme bilgilerini kaydetme
  document.getElementById("saveUpdateBtn").addEventListener("click", function () {
    // Form verilerini al
    const version = document.getElementById("updateVersion").value;
    const mandatory = document.getElementById("updateMandatory").checked;
    const changes = document.getElementById("updateChanges").value;
    const urlWindows = document.getElementById("updateUrlWindows").value;
    const urlMacos = document.getElementById("updateUrlMacos").value;
    const urlLinux = document.getElementById("updateUrlLinux").value;

    // Gerekli alanları kontrol et
    if (!version || !changes || !urlWindows || !urlMacos || !urlLinux) {
      alert("Lütfen tüm gerekli alanları doldurun!");
      return;
    }

    // Güncelleme nesnesini oluştur
    const checkUpdate = {
      version: version,
      mandatory: mandatory,
      changes: changes,
      url: {
        windows: urlWindows,
        macos: urlMacos,
        linux: urlLinux,
      },
    };

    // Sunucuya gönder
    fetch("/admin/check-update/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkUpdate),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Güncelleme bilgileri başarıyla kaydedildi.");
          loadCheckUpdate(); // Yeniden yükle
        } else {
          alert("Güncelleme bilgileri kaydedilirken bir hata oluştu: " + (data.error || "Bilinmeyen hata"));
        }
      })
      .catch((error) => {
        console.error("Güncelleme bilgileri kaydetme hatası:", error);
        alert("Güncelleme bilgileri kaydedilirken bir hata oluştu.");
      });
  });

  // Sekme değiştiğinde ilgili içeriği yükle
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab");

      // Tüm sekmeleri gizle
      document.querySelectorAll(".tab-content").forEach((tab) => {
        tab.classList.remove("active");
      });

      // Tüm nav-link'leri pasif yap
      document.querySelectorAll(".nav-link").forEach((navLink) => {
        navLink.classList.remove("active");
      });

      // Seçilen sekmeyi göster
      document.getElementById(tabId).classList.add("active");

      // Seçilen nav-link'i aktif yap
      this.classList.add("active");

      // Mobil görünümde sidebar'ı kapat
      if (window.innerWidth < 992) {
        document.getElementById("sidebar").classList.remove("show");
        document.getElementById("sidebarOverlay").style.display = "none";
      }

      // İlgili içeriği yükle
      if (tabId === "pool-accounts") {
        // Havuz hesaplarını otomatik yükleme, buton ile yüklenecek
        document.getElementById("poolAccountsTable").innerHTML = "<tr><td colspan='5' class='text-center'>Hesapları görmek için \"Hesapları Göster\" butonuna tıklayın.</td></tr>";
      } else if (tabId === "active-accounts") {
        loadActiveAccounts();
      } else if (tabId === "notifications-tab") {
        loadNotifications();
      } else if (tabId === "services-tab") {
        loadServices();
      } else if (tabId === "pricing-tab") {
        loadPricing();
      } else if (tabId === "update-tab") {
        loadCheckUpdate();
      }
    });
  });

  // Özellikleri yükleme - Multiple select'i de doldurmak için güncellendi
  function loadFeatures() {
    console.log("Özellikler yükleniyor...");
    fetch("/admin/features")
      .then((response) => response.json())
      .then((data) => {
        if (data.features && data.features.length > 0) {
          const addSelect = document.getElementById("accountFeature");
          const editSelect = document.getElementById("editAccountFeature");
          const multipleSelect = document.getElementById("accountFeatureMultiple");
          const featureFilter = document.getElementById("featureFilter"); // Özellik filtresi select elementi

          // Sadece seçim uyarısı seçeneği
          let options = '<option value="">Özellik seçin...</option>';

          data.features.forEach((feature) => {
            options += `<option value="${feature.nameKey}">${feature.name}</option>`;
          });

          addSelect.innerHTML = options;
          editSelect.innerHTML = options;
          multipleSelect.innerHTML = options;

          // Özellik filtresini de doldur
          let filterOptions = '<option value="">Tüm Hesaplar</option>';
          data.features.forEach((feature) => {
            filterOptions += `<option value="${feature.nameKey}">${feature.name}</option>`;
          });
          featureFilter.innerHTML = filterOptions;

          console.log("Özellikler başarıyla yüklendi:", data.features.length);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("accountFeature").innerHTML = '<option value="">Özellik seçin...</option>';
        document.getElementById("editAccountFeature").innerHTML = '<option value="">Özellik seçin...</option>';
        document.getElementById("accountFeatureMultiple").innerHTML = '<option value="">Özellik seçin...</option>';
        document.getElementById("featureFilter").innerHTML = '<option value="">Tüm Hesaplar</option>'; // Hata durumunda filtre seçeneğini sıfırla
      });
  }

  // Çoklu hesap metin parse etme fonksiyonu
  document.getElementById("parseAccountsBtn").addEventListener("click", function () {
    const textArea = document.getElementById("multipleAccountsText");
    const text = textArea.value.trim();
    const featureKey = document.getElementById("accountFeatureMultiple").value;

    if (!text) {
      alert("Lütfen hesap bilgilerini girin!");
      return;
    }

    if (!featureKey) {
      alert("Lütfen bir özellik seçin!");
      return;
    }

    const parsedAccounts = [];

    // Tüm satırları al ve boş satırları filtrele
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    // Windsurf hesapları için farklı parse işlemi
    if (featureKey === "windsurf_auth") {
      // Hesapları grupla
      let currentAccount = { apiKey: "", refreshToken: "", email: "", password: "" };
      let lineCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Satır sayısına göre işlem yap
        if (lineCount === 0) {
          // İlk satır: API Key
          currentAccount.apiKey = line;
          lineCount = 1;
        } else if (lineCount === 1) {
          // İkinci satır: Refresh Token
          currentAccount.refreshToken = line;
          lineCount = 2;
        } else if (lineCount === 2) {
          // Üçüncü satır: Email
          currentAccount.email = line;
          lineCount = 3;
        } else if (lineCount === 3) {
          // Dördüncü satır: Şifre
          currentAccount.password = line;

          // Hesap tamamlandı, listeye ekle
          parsedAccounts.push({ ...currentAccount });

          // Yeni hesap için hazırla
          currentAccount = { apiKey: "", refreshToken: "", email: "", password: "" };
          lineCount = 0;
        }
      }

      // Eksik bilgi kontrolü
      if (lineCount > 0 && lineCount < 4) {
        alert("Eksik bilgi: Bir hesap için tüm alanlar (API Key, Refresh Token, Email, Şifre) girilmemiş!");
      }
    } else {
      // Normal hesaplar için parse işlemi
      // Hesapları grupla
      let currentAccount = { token: "", email: "", password: "" };
      let lineCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Satır sayısına göre işlem yap
        if (lineCount === 0) {
          // İlk satır: token veya email olabilir
          // Email kontrolü yap (@ işareti içeriyor mu?)
          if (line.includes("@")) {
            // Bu bir email, token yok demektir
            currentAccount.email = line;
            lineCount = 1; // Email olarak işaretlendi
          } else {
            // Bu bir token
            currentAccount.token = line;
            lineCount = 1; // Token olarak işaretlendi
          }
        } else if (lineCount === 1) {
          // İkinci satır: email veya şifre olabilir
          if (currentAccount.email === "") {
            // Henüz email yok, bu satır email olmalı
            currentAccount.email = line;
            lineCount = 2; // Email olarak işaretlendi
          } else {
            // Email zaten var, bu satır şifre olmalı
            currentAccount.password = line;

            // Hesap tamamlandı, listeye ekle
            parsedAccounts.push({ ...currentAccount });

            // Yeni hesap için hazırla
            currentAccount = { token: "", email: "", password: "" };
            lineCount = 0;
          }
        } else if (lineCount === 2) {
          // Üçüncü satır: şifre olmalı
          currentAccount.password = line;

          // Hesap tamamlandı, listeye ekle
          parsedAccounts.push({ ...currentAccount });

          // Yeni hesap için hazırla
          currentAccount = { token: "", email: "", password: "" };
          lineCount = 0;
        }
      }

      // Eğer yarım kalan bir hesap varsa ve email doldurulmuşsa (şifre eksik) uyarı ver
      if (lineCount === 1 && currentAccount.email !== "") {
        alert("Eksik bilgi: " + currentAccount.email + " için şifre girilmemiş!");
      }
    }

    // Sonuçları tabloya doldur
    const tableBody = document.querySelector("#parsedAccountsTable tbody");
    tableBody.innerHTML = "";

    if (parsedAccounts.length === 0) {
      alert("Hiçbir hesap bilgisi ayrıştırılamadı! Lütfen doğru formatı kullandığınızdan emin olun.");
      return;
    }

    // Tablo başlıklarını güncelle
    const tableHead = document.querySelector("#parsedAccountsTable thead tr");
    if (featureKey === "windsurf_auth") {
      tableHead.innerHTML = `
        <th>API Key</th>
        <th>Refresh Token</th>
        <th>Email</th>
        <th>Şifre</th>
      `;

      // Windsurf hesaplarını tabloya ekle
      parsedAccounts.forEach((account) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="token-cell">${account.apiKey}</td>
          <td class="token-cell">${account.refreshToken}</td>
          <td>${account.email}</td>
          <td>${account.password}</td>
        `;
        tableBody.appendChild(row);
      });
    } else {
      tableHead.innerHTML = `
        <th>Token</th>
        <th>Email</th>
        <th>Şifre</th>
      `;

      // Normal hesapları tabloya ekle
      parsedAccounts.forEach((account) => {
        const row = document.createElement("tr");
        // Token yoksa veya boşsa "-" göster
        const tokenDisplay = account.token || "-";
        row.innerHTML = `
          <td class="token-cell">${tokenDisplay}</td>
          <td>${account.email}</td>
          <td>${account.password}</td>
        `;
        tableBody.appendChild(row);
      });
    }

    // Ayrıştırılan hesap sayısını güncelle
    document.getElementById("parsedAccountsCount").textContent = parsedAccounts.length;

    // Kaydet butonunu etkinleştir
    document.getElementById("saveMultipleAccountsBtn").disabled = false;
  });

  // Çoklu hesapları kaydetme
  document.getElementById("saveMultipleAccountsBtn").addEventListener("click", function () {
    const featureKey = document.getElementById("accountFeatureMultiple").value;

    if (!featureKey) {
      alert("Lütfen bir özellik seçin!");
      return;
    }

    // Ayrıştırılmış hesapları tablodaki verilerden al
    const tableBody = document.querySelector("#parsedAccountsTable tbody");
    const rows = tableBody.querySelectorAll("tr");

    if (rows.length === 0) {
      alert("Önce hesapları ayrıştırın!");
      return;
    }

    const accounts = [];

    // Windsurf hesapları için farklı işlem
    if (featureKey === "windsurf_auth") {
      // Her satırı işle
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length === 4) {
          const apiKey = cells[0].textContent;
          const refreshToken = cells[1].textContent;
          const email = cells[2].textContent;
          const password = cells[3].textContent;

          accounts.push({ token: "", apiKey, refreshToken, email, password, featureKey });
        }
      });
    } else {
      // Normal hesaplar için işlem
      // Her satırı işle
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length === 3) {
          const tokenCell = cells[0].textContent;
          const email = cells[1].textContent;
          const password = cells[2].textContent;

          // Token "-" ise boş string olarak gönder
          const token = tokenCell === "-" ? "" : tokenCell;

          accounts.push({ token, email, password, featureKey });
        }
      });
    }

    if (accounts.length === 0) {
      alert("Kaydedilecek hesap bulunamadı!");
      return;
    }

    // Sunucuya gönder
    fetch("/admin/accounts/add-multiple", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accounts }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(`${data.addedCount || accounts.length} hesap başarıyla eklendi!`);
          // Formu temizle
          document.getElementById("multipleAccountsText").value = "";
          document.getElementById("parsedAccountsTable").querySelector("tbody").innerHTML = "";
          document.getElementById("parsedAccountsCount").textContent = "0";
          // Modalı kapat
          bootstrap.Modal.getInstance(document.getElementById("addMultipleAccountsModal")).hide();
          // Kaydet butonunu devre dışı bırak
          document.getElementById("saveMultipleAccountsBtn").disabled = true;
        } else {
          alert("Hata: " + (data.error || "Bilinmeyen bir hata oluştu"));
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Bir hata oluştu. Lütfen tekrar deneyin.");
      });
  });

  // Havuz hesaplarını yükle
  function loadPoolAccounts() {
    fetch("/admin/accounts/pool")
      .then((response) => response.json())
      .then((data) => {
        const accountsTable = document.getElementById("poolAccountsTable");
        accountsTable.innerHTML = "";

        // Toplam sayıyı göster
        const countElement = document.getElementById("poolAccountsCount");
        countElement.textContent = data.totalCount || 0;
        countElement.style.display = "inline-block"; // Sayıyı görünür yap

        // Özellik bazında hesap sayılarını hesapla
        const featureCounts = {};
        data.accounts.forEach((account) => {
          if (!featureCounts[account.featureKey]) {
            featureCounts[account.featureKey] = 0;
          }
          featureCounts[account.featureKey]++;
        });

        // Renk paleti tanımla
        const colors = {
          cursor_auth: "primary",
          windsurf_auth: "success",
          default: "secondary",
        };

        // Özellik sayılarını göster
        const featureCountsText = Object.entries(featureCounts)
          .map(([feature, count]) => {
            const colorClass = colors[feature] || colors.default;
            return `<span class="badge bg-${colorClass} bg-opacity-75 me-1">${feature}: ${count}</span>`;
          })
          .join("");

        countElement.innerHTML = `
          <span class="fw-bold fs-5">${data.totalCount || 0}</span>
          <span class="ms-2">${featureCountsText}</span>
        `;

        if (!data.accounts || data.accounts.length === 0) {
          accountsTable.innerHTML = "<tr><td colspan='6' class='text-center'>Hesap bulunamadı</td></tr>";
          return;
        }

        // Tablo başlığını güncelle - checkbox ekle
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
          <th>
            <input type="checkbox" id="selectAllAccounts" class="form-check-input">
          </th>
          <th>Email</th>
          <th>Özellik</th>
          <th>Oluşturulma</th>
          <th>İşlemler</th>
        `;
        accountsTable.appendChild(headerRow);

        // Toplu silme butonu ekle
        const bulkDeleteBtn = document.createElement("button");
        bulkDeleteBtn.id = "bulkDeleteBtn";
        bulkDeleteBtn.className = "btn btn-danger mb-3 d-none";
        bulkDeleteBtn.innerHTML = '<i class="bi bi-trash me-2"></i>Seçili Hesapları Sil (<span id="selectedCount">0</span>)';
        accountsTable.parentElement.insertBefore(bulkDeleteBtn, accountsTable);

        data.accounts.forEach((account) => {
          const row = document.createElement("tr");

          // Tarih farkını hesapla
          const createdDate = new Date(account.created_at);
          const now = new Date();
          const diffTime = Math.abs(now - createdDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
          const dateDisplay = diffDays === 0 ? '<span class="badge bg-success">Yeni</span>' : `${diffDays} gün önce`;

          // Windsurf hesapları için apiKey ve refreshToken bilgilerini data-attribute olarak ekle
          const dataAttributes = account.featureKey === "windsurf_auth" ? `data-api-key="${account.apiKey || ""}" data-refresh-token="${account.refreshToken || ""}"` : "";

          // Token bilgisini data-attribute olarak ekle ama tabloda gösterme
          const tokenAttribute = `data-token="${account.token || ""}"`;

          row.innerHTML = `
            <td>
              <input type="checkbox" class="form-check-input account-checkbox" data-email="${account.email}" data-feature-key="${account.featureKey}">
            </td>
            <td>${account.email}</td>
            <td class="text-center">
              ${
                account.featureKey === "cursor_auth"
                  ? `<img src="/img/cursor.png" alt="Cursor" width="24" height="24" title="Cursor Auth" class="feature-icon">`
                  : account.featureKey === "windsurf_auth"
                  ? `<img src="/img/windsurf.png" alt="Windsurf" width="24" height="24" title="Windsurf Auth" class="feature-icon">`
                  : `<i class="bi bi-gear-fill text-secondary" title="${account.featureKey}"></i>`
              }
            </td>
            <td>${dateDisplay}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-account" data-email="${account.email}" data-feature-key="${account.featureKey}" ${dataAttributes} ${tokenAttribute}>Düzenle</button>
              <button class="btn btn-sm btn-danger delete-account" data-email="${account.email}" data-feature-key="${account.featureKey}">Sil</button>
            </td>
          `;
          accountsTable.appendChild(row);
        });

        // Tüm hesapları seçme/seçimi kaldırma
        document.getElementById("selectAllAccounts").addEventListener("change", function () {
          const checkboxes = document.querySelectorAll(".account-checkbox");
          checkboxes.forEach((checkbox) => {
            checkbox.checked = this.checked;
          });
          updateSelectedCount();
        });

        // Her checkbox değişiminde seçili sayısını güncelle
        document.querySelectorAll(".account-checkbox").forEach((checkbox) => {
          checkbox.addEventListener("change", updateSelectedCount);
        });

        // Toplu silme butonu işlevi
        document.getElementById("bulkDeleteBtn").addEventListener("click", function () {
          const selectedCheckboxes = document.querySelectorAll(".account-checkbox:checked");

          if (selectedCheckboxes.length === 0) {
            alert("Lütfen silinecek hesapları seçin!");
            return;
          }

          if (confirm(`${selectedCheckboxes.length} hesabı silmek istediğinizden emin misiniz?`)) {
            const deletePromises = [];

            // Seçilen tüm hesapları al
            selectedCheckboxes.forEach((checkbox) => {
              const email = checkbox.getAttribute("data-email");
              const featureKey = checkbox.getAttribute("data-feature-key");

              // Silme isteği gönder - hem email hem featureKey kullanarak
              const deletePromise = fetch("/admin/accounts/delete", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: email, featureKey: featureKey }),
              }).then((res) => res.json());

              deletePromises.push(deletePromise);
            });

            Promise.all(deletePromises)
              .then(() => {
                alert(`${selectedCheckboxes.length} hesap başarıyla silindi.`);
                loadPoolAccounts(); // Listeyi yenile
              })
              .catch((error) => {
                console.error("Toplu silme hatası:", error);
                alert("Hesaplar silinirken bir hata oluştu.");
              });
          }
        });

        // Düzenleme ve silme butonlarına olay dinleyicileri ekle
        addAccountButtonListeners(data.accounts);
      })
      .catch((error) => {
        console.error("Havuz hesapları yükleme hatası:", error);
        alert("Hesaplar yüklenirken bir hata oluştu.");
      });
  }

  // Seçili hesap sayısını güncelleme fonksiyonu
  function updateSelectedCount() {
    const selectedCount = document.querySelectorAll(".account-checkbox:checked").length;
    const bulkDeleteBtn = document.getElementById("bulkDeleteBtn");
    document.getElementById("selectedCount").textContent = selectedCount;

    if (selectedCount > 0) {
      bulkDeleteBtn.classList.remove("d-none");
    } else {
      bulkDeleteBtn.classList.add("d-none");
    }
  }

  // Özelliğe göre hesapları yükle
  function loadAccountsByFeature(featureKey) {
    fetch(`/admin/accounts/pool/by-feature/${featureKey}`)
      .then((response) => response.json())
      .then((data) => {
        const accountsTable = document.getElementById("poolAccountsTable");
        accountsTable.innerHTML = "";

        // Toplam sayıyı göster
        const countElement = document.getElementById("poolAccountsCount");
        countElement.textContent = data.totalCount || 0;
        countElement.style.display = "inline-block"; // Sayıyı görünür yap

        if (!data.accounts || data.accounts.length === 0) {
          accountsTable.innerHTML = `<tr><td colspan='4' class='text-center'>${featureKey} özelliğine ait hesap bulunamadı</td></tr>`;
          return;
        }

        // Özellik filtresini seçili hale getir
        const featureFilter = document.getElementById("featureFilter");
        for (let i = 0; i < featureFilter.options.length; i++) {
          if (featureFilter.options[i].value === featureKey) {
            featureFilter.selectedIndex = i;
            break;
          }
        }

        // Toplu silme butonu ekle
        const poolAccountsDiv = document.getElementById("pool-accounts");
        const tableCard = poolAccountsDiv.querySelector(".card:last-child");

        // Önce mevcut tür butonları konteynerini temizle
        const existingContainer = tableCard.querySelector(".type-buttons-container");
        if (existingContainer) {
          tableCard.removeChild(existingContainer);
        }

        const typeButtonsContainer = document.createElement("div");
        typeButtonsContainer.className = "mb-3 mt-3 type-buttons-container";
        typeButtonsContainer.innerHTML = `<h5>${featureKey} Hesapları (${data.totalCount})</h5>`;

        const buttonRow = document.createElement("div");
        buttonRow.className = "d-flex flex-wrap gap-2";

        // Tüm hesapları silme butonu
        const deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-danger";
        deleteButton.innerHTML = `<i class="bi bi-trash me-2"></i>Tüm ${featureKey} Hesaplarını Sil`;
        deleteButton.onclick = function () {
          if (confirm(`${featureKey} türündeki tüm hesapları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
            deleteAccountsByType(featureKey);
          }
        };
        buttonRow.appendChild(deleteButton);

        // Tüm hesapları gösterme butonu
        const viewAllButton = document.createElement("button");
        viewAllButton.className = "btn btn-secondary";
        viewAllButton.innerHTML = `<i class="bi bi-arrow-left me-2"></i>Tüm Hesapları Göster`;
        viewAllButton.onclick = function () {
          loadPoolAccounts();
        };
        buttonRow.appendChild(viewAllButton);

        typeButtonsContainer.appendChild(buttonRow);

        // Butonları tablonun üstüne ekle
        tableCard.insertBefore(typeButtonsContainer, tableCard.firstChild);

        data.accounts.forEach((account) => {
          const row = document.createElement("tr");
          row.innerHTML = `
                  <td>${account.email}</td>
                  <td class="token-cell">${account.token || "-"}</td>
                  <td>${account.featureKey}</td>
                  <td>
                    <button class="btn btn-sm btn-primary edit-account" data-email="${account.email}" data-feature-key="${account.featureKey}">Düzenle</button>
                    <button class="btn btn-sm btn-danger delete-account" data-email="${account.email}" data-feature-key="${account.featureKey}">Sil</button>
                  </td>
                `;
          accountsTable.appendChild(row);
        });

        // Düzenleme butonlarına olay dinleyicileri ekle
        document.querySelectorAll(".edit-account").forEach((button) => {
          button.addEventListener("click", function () {
            const email = this.getAttribute("data-email");
            const featureKey = this.getAttribute("data-feature-key");

            // Hem email hem de featureKey ile arama yapalım
            const account = data.accounts.find((acc) => acc.email === email && (featureKey ? acc.featureKey === featureKey : true));

            if (!account) {
              console.error("Hesap bulunamadı:", email, featureKey);
              alert("Hesap bilgileri yüklenirken bir hata oluştu!");
              return;
            }

            document.getElementById("editAccountEmail").value = account.email;
            document.getElementById("editAccountToken").value = account.token || "";
            document.getElementById("editAccountPassword").value = account.password; // Orijinal şifreyi göster

            // Feature seçimi
            const featureSelect = document.getElementById("editAccountFeature");
            if (featureSelect) {
              // Eğer özellik listesi boşsa, özellikleri yükle
              if (featureSelect.options.length <= 1) {
                loadFeatures();
              }

              featureSelect.value = account.featureKey;

              // Windsurf alanlarını göster/gizle
              const editWindsurfFields = document.getElementById("editWindsurfFields");
              if (account.featureKey === "windsurf_auth") {
                editWindsurfFields.style.display = "block";

                // Windsurf alanlarını doldur - önce data-attribute'lardan dene, yoksa account nesnesinden al
                const apiKey = this.getAttribute("data-api-key") || account.apiKey || "";
                const refreshToken = this.getAttribute("data-refresh-token") || account.refreshToken || "";

                document.getElementById("editAccountApiKey").value = apiKey;
                document.getElementById("editAccountRefreshToken").value = refreshToken;
              } else {
                editWindsurfFields.style.display = "none";
              }
            }

            // ID'yi gizli alanda sakla (email olarak kullanacağız)
            document.getElementById("editAccountId").value = account.email;

            // Modalı göster
            const editModal = new bootstrap.Modal(document.getElementById("editAccountModal"));
            editModal.show();
          });
        });

        // Silme butonlarına olay dinleyicileri ekle
        document.querySelectorAll(".delete-account").forEach((button) => {
          button.addEventListener("click", function () {
            if (confirm("Bu hesabı silmek istediğinizden emin misiniz?")) {
              const email = this.getAttribute("data-email");
              const featureKey = this.getAttribute("data-feature-key");
              deleteAccount(email, featureKey);
            }
          });
        });
      })
      .catch((error) => {
        console.error(`${featureKey} özelliğine ait hesapları yükleme hatası:`, error);
        alert("Hesaplar yüklenirken bir hata oluştu.");
      });
  }

  // Filtreleri uygula
  function applyAccountFilters() {
    const featureKey = document.getElementById("featureFilter").value;
    const domainFilter = document.getElementById("domainFilter").value.trim().toLowerCase();
    const applyFiltersBtn = document.getElementById("applyFiltersBtn");

    // Filtre uygulanmış mı kontrol et
    if (filtersApplied) {
      // Filtreleri temizle
      document.getElementById("featureFilter").value = "";
      document.getElementById("domainFilter").value = "";

      // Buton görünümünü değiştir
      applyFiltersBtn.innerHTML = '<i class="bi bi-search me-2"></i>Filtreleri Uygula';
      applyFiltersBtn.classList.remove("btn-danger");
      applyFiltersBtn.classList.add("btn-primary");

      // Tüm hesapları yükle
      loadPoolAccounts();

      // Filtre durumunu güncelle
      filtersApplied = false;
      return;
    }

    // Filtre yoksa işlem yapma
    if (!featureKey && !domainFilter) {
      alert("Lütfen en az bir filtre seçin.");
      return;
    }

    if (featureKey) {
      // Önce özelliğe göre hesapları getir
      fetch(`/admin/accounts/pool/by-feature/${featureKey}`)
        .then((response) => response.json())
        .then((data) => {
          const accountsTable = document.getElementById("poolAccountsTable");
          accountsTable.innerHTML = "";

          let filteredAccounts = data.accounts;

          // Domain filtresi varsa uygula
          if (domainFilter) {
            filteredAccounts = filteredAccounts.filter((account) => account.email.toLowerCase().endsWith("@" + domainFilter) || account.email.toLowerCase().includes(domainFilter));
          }

          // Toplam sayıyı güncelle
          const countElement = document.getElementById("poolAccountsCount");
          countElement.textContent = filteredAccounts.length;
          countElement.style.display = "inline-block";

          if (filteredAccounts.length === 0) {
            accountsTable.innerHTML = `<tr><td colspan='4' class='text-center'>Filtrelere uygun hesap bulunamadı</td></tr>`;
            return;
          }

          // Toplu silme butonu ekle
          const poolAccountsDiv = document.getElementById("pool-accounts");
          const tableCard = poolAccountsDiv.querySelector(".card:last-child");

          // Önce mevcut tür butonları konteynerini temizle
          const existingContainer = tableCard.querySelector(".type-buttons-container");
          if (existingContainer) {
            tableCard.removeChild(existingContainer);
          }

          const typeButtonsContainer = document.createElement("div");
          typeButtonsContainer.className = "mb-3 mt-3 type-buttons-container";

          let title = `${featureKey} Hesapları (${filteredAccounts.length})`;
          if (domainFilter) {
            title += ` - Domain: ${domainFilter}`;
          }

          typeButtonsContainer.innerHTML = `<h5>${title}</h5>`;

          // Buton görünümünü değiştir
          applyFiltersBtn.innerHTML = '<i class="bi bi-x-circle-fill me-2"></i>Filtreleri Temizle';
          applyFiltersBtn.classList.remove("btn-primary");
          applyFiltersBtn.classList.add("btn-danger");

          // Filtre durumunu güncelle
          filtersApplied = true;

          const buttonRow = document.createElement("div");
          buttonRow.className = "d-flex flex-wrap gap-2";

          // Filtrelenmiş hesapları silme butonu
          if (filteredAccounts.length > 0) {
            const deleteFilteredButton = document.createElement("button");
            deleteFilteredButton.className = "btn btn-danger";
            deleteFilteredButton.innerHTML = `<i class="bi bi-trash me-2"></i>Filtrelenmiş Hesapları Sil (${filteredAccounts.length})`;
            deleteFilteredButton.onclick = function () {
              if (confirm(`Filtrelenmiş ${filteredAccounts.length} hesabı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
                // Filtrelenmiş hesapları sil
                const deletePromises = filteredAccounts.map((account) =>
                  fetch("/admin/accounts/delete", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      id: account.email,
                      featureKey: account.featureKey,
                    }),
                  }).then((res) => res.json())
                );

                Promise.all(deletePromises)
                  .then(() => {
                    alert(`${filteredAccounts.length} hesap başarıyla silindi.`);
                    // Filtreleri yeniden uygula
                    applyAccountFilters();
                  })
                  .catch((error) => {
                    console.error("Toplu silme hatası:", error);
                    alert("Hesaplar silinirken bir hata oluştu.");
                  });
              }
            };
            buttonRow.appendChild(deleteFilteredButton);
          }

          typeButtonsContainer.appendChild(buttonRow);

          // Butonları tablonun üstüne ekle
          tableCard.insertBefore(typeButtonsContainer, tableCard.firstChild);

          // Hesapları tabloya ekle
          filteredAccounts.forEach((account) => {
            const row = document.createElement("tr");

            // Token bilgisini data-attribute olarak ekle ama tabloda gösterme
            const tokenAttribute = `data-token="${account.token || ""}"`;

            row.innerHTML = `
                    <td>${account.email}</td>
                    <td>${account.featureKey}</td>
                    <td>
                      <button class="btn btn-sm btn-primary edit-account" data-email="${account.email}" ${tokenAttribute}>Düzenle</button>
                      <button class="btn btn-sm btn-danger delete-account" data-email="${account.email}" data-feature-key="${account.featureKey}">Sil</button>
                    </td>
                  `;
            accountsTable.appendChild(row);
          });

          // Düzenleme ve silme butonlarına olay dinleyicileri ekle
          addAccountButtonListeners(filteredAccounts);
        })
        .catch((error) => {
          console.error("Filtreleme hatası:", error);
          alert("Hesaplar filtrelenirken bir hata oluştu.");
        });
    } else if (domainFilter) {
      // Sadece domain filtresi varsa tüm hesapları getir ve filtrele
      fetch("/admin/accounts/pool")
        .then((response) => response.json())
        .then((data) => {
          const accountsTable = document.getElementById("poolAccountsTable");
          accountsTable.innerHTML = "";

          let filteredAccounts = data.accounts.filter((account) => account.email.toLowerCase().endsWith("@" + domainFilter) || account.email.toLowerCase().includes(domainFilter));

          // Toplam sayıyı güncelle
          const countElement = document.getElementById("poolAccountsCount");
          countElement.textContent = filteredAccounts.length;
          countElement.style.display = "inline-block";

          if (filteredAccounts.length === 0) {
            accountsTable.innerHTML = `<tr><td colspan='4' class='text-center'>Filtrelere uygun hesap bulunamadı</td></tr>`;
            return;
          }

          // Toplu silme butonu ekle
          const poolAccountsDiv = document.getElementById("pool-accounts");
          const tableCard = poolAccountsDiv.querySelector(".card:last-child");

          // Önce mevcut tür butonları konteynerini temizle
          const existingContainer = tableCard.querySelector(".type-buttons-container");
          if (existingContainer) {
            tableCard.removeChild(existingContainer);
          }

          const typeButtonsContainer = document.createElement("div");
          typeButtonsContainer.className = "mb-3 mt-3 type-buttons-container";
          typeButtonsContainer.innerHTML = `<h5>Domain Filtresi: ${domainFilter} (${filteredAccounts.length})</h5>`;

          const buttonRow = document.createElement("div");
          buttonRow.className = "d-flex flex-wrap gap-2";

          // Filtrelenmiş hesapları silme butonu
          if (filteredAccounts.length > 0) {
            const deleteFilteredButton = document.createElement("button");
            deleteFilteredButton.className = "btn btn-danger";
            deleteFilteredButton.innerHTML = `<i class="bi bi-trash me-2"></i>Filtrelenmiş Hesapları Sil (${filteredAccounts.length})`;
            deleteFilteredButton.onclick = function () {
              if (confirm(`Filtrelenmiş ${filteredAccounts.length} hesabı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
                // Filtrelenmiş hesapları sil
                const deletePromises = filteredAccounts.map((account) =>
                  fetch("/admin/accounts/delete", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      id: account.email,
                      featureKey: account.featureKey,
                    }),
                  }).then((res) => res.json())
                );

                Promise.all(deletePromises)
                  .then(() => {
                    alert(`${filteredAccounts.length} hesap başarıyla silindi.`);
                    // Filtreleri yeniden uygula
                    applyAccountFilters();
                  })
                  .catch((error) => {
                    console.error("Toplu silme hatası:", error);
                    alert("Hesaplar silinirken bir hata oluştu.");
                  });
              }
            };
            buttonRow.appendChild(deleteFilteredButton);
          }

          // Tüm hesapları gösterme butonu
          const viewAllButton = document.createElement("button");
          viewAllButton.className = "btn btn-secondary";
          viewAllButton.innerHTML = `<i class="bi bi-arrow-left me-2"></i>Tüm Hesapları Göster`;
          viewAllButton.onclick = function () {
            document.getElementById("domainFilter").value = "";
            document.getElementById("featureFilter").value = "";
            loadPoolAccounts();
          };
          buttonRow.appendChild(viewAllButton);

          typeButtonsContainer.appendChild(buttonRow);

          // Butonları tablonun üstüne ekle
          tableCard.insertBefore(typeButtonsContainer, tableCard.firstChild);

          // Hesapları tabloya ekle
          filteredAccounts.forEach((account) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                    <td>${account.email}</td>
                    <td class="token-cell">${account.token || "-"}</td>
                    <td>${account.featureKey}</td>
                    <td>
                      <button class="btn btn-sm btn-primary edit-account" data-email="${account.email}">Düzenle</button>
                      <button class="btn btn-sm btn-danger delete-account" data-email="${account.email}" data-feature-key="${account.featureKey}">Sil</button>
                    </td>
                  `;
            accountsTable.appendChild(row);
          });

          // Düzenleme ve silme butonlarına olay dinleyicileri ekle
          addAccountButtonListeners(filteredAccounts);
        })
        .catch((error) => {
          console.error("Filtreleme hatası:", error);
          alert("Hesaplar filtrelenirken bir hata oluştu.");
        });
    } else {
      // Hiçbir filtre seçilmemişse tüm hesapları göster
      loadPoolAccounts();
    }
  }

  // Hesap butonlarına olay dinleyicileri ekle
  function addAccountButtonListeners(accounts) {
    // Düzenleme butonlarına olay dinleyicileri ekle
    document.querySelectorAll(".edit-account").forEach((button) => {
      button.addEventListener("click", function () {
        const email = this.getAttribute("data-email");
        const featureKey = this.getAttribute("data-feature-key");

        // Hem email hem de featureKey ile arama yapalım
        const account = accounts.find((acc) => acc.email === email && (featureKey ? acc.featureKey === featureKey : true));

        if (!account) {
          console.error("Hesap bulunamadı:", email, featureKey);
          alert("Hesap bilgileri yüklenirken bir hata oluştu!");
          return;
        }

        document.getElementById("editAccountEmail").value = account.email;
        document.getElementById("editAccountToken").value = account.token || "";
        document.getElementById("editAccountPassword").value = account.password; // Orijinal şifreyi göster

        // Feature seçimi
        const featureSelect = document.getElementById("editAccountFeature");
        if (featureSelect) {
          // Eğer özellik listesi boşsa, özellikleri yükle
          if (featureSelect.options.length <= 1) {
            loadFeatures();
          }

          featureSelect.value = account.featureKey;

          // Windsurf alanlarını göster/gizle
          const editWindsurfFields = document.getElementById("editWindsurfFields");
          if (account.featureKey === "windsurf_auth") {
            editWindsurfFields.style.display = "block";

            // Windsurf alanlarını doldur - önce data-attribute'lardan dene, yoksa account nesnesinden al
            const apiKey = this.getAttribute("data-api-key") || account.apiKey || "";
            const refreshToken = this.getAttribute("data-refresh-token") || account.refreshToken || "";

            document.getElementById("editAccountApiKey").value = apiKey;
            document.getElementById("editAccountRefreshToken").value = refreshToken;
          } else {
            editWindsurfFields.style.display = "none";
          }
        }

        // ID'yi gizli alanda sakla (email olarak kullanacağız)
        document.getElementById("editAccountId").value = account.email;

        // Modalı göster
        const editModal = new bootstrap.Modal(document.getElementById("editAccountModal"));
        editModal.show();
      });
    });

    // Silme butonlarına olay dinleyicileri ekle
    document.querySelectorAll(".delete-account").forEach((button) => {
      button.addEventListener("click", function () {
        if (confirm("Bu hesabı silmek istediğinizden emin misiniz?")) {
          const email = this.getAttribute("data-email");
          const featureKey = this.getAttribute("data-feature-key");
          deleteAccount(email, featureKey);
        }
      });
    });
  }

  // Aktif hesapları getirme fonksiyonu
  function loadActiveAccounts() {
    const activeAccountsTable = document.getElementById("activeAccountsTable");
    activeAccountsTable.innerHTML = `<tr><td colspan="9" class="text-center"><div class="spinner-border text-primary" role="status"></div><span class="ms-2">Hesaplar yükleniyor...</span></td></tr>`;

    fetch("/admin/accounts/active")
      .then((response) => response.json())
      .then((data) => {
        const accountsTable = document.getElementById("activeAccountsTable");
        const activeAccountsCountSpan = document.getElementById("activeAccountsCount");

        // Hesap sayısını göster
        if (activeAccountsCountSpan) {
          activeAccountsCountSpan.textContent = data.accounts.length;
          activeAccountsCountSpan.style.display = "inline-block";
        }

        // İllegal hesap tespiti butonu ekle (otomatik çalıştırmak yerine)
        addIllegalAccountDetectionButton(data.accounts);

        // Tablo boşsa bilgi mesajı göster
        if (data.accounts.length === 0) {
          accountsTable.innerHTML = `<tr><td colspan="9" class="text-center">Aktif hesap bulunamadı</td></tr>`;
          return;
        }

        // Tabloyu temizle
        accountsTable.innerHTML = "";

        // Her aktif hesap için bir satır ekle
        data.accounts.forEach((account) => {
          const row = document.createElement("tr");

          // Token bilgisini data-attribute olarak ekle ama tabloda gösterme
          const tokenAttribute = `data-token="${account.token || ""}"`;

          // Windsurf hesapları için apiKey ve refreshToken bilgilerini data-attribute olarak ekle
          const apiKey = account.apiKey || "";
          const refreshToken = account.refreshToken || "";
          const dataAttributes = `data-api-key="${apiKey}" data-refresh-token="${refreshToken}"`;

          row.innerHTML = `
                <td>${account.email}</td>
                <td class="token-cell">
                  <button class="btn btn-sm btn-outline-secondary copy-token" data-token="${account.token || ""}">
                    <i class="bi bi-clipboard"></i> Token Kopyala
                  </button>
                </td>
                <td class="text-center">
                  ${
                    account.featureKey === "cursor_auth"
                      ? `<img src="/img/cursor.png" alt="Cursor" width="24" height="24" title="Cursor Auth" class="feature-icon">`
                      : account.featureKey === "windsurf_auth"
                      ? `<img src="/img/windsurf.png" alt="Windsurf" width="24" height="24" title="Windsurf Auth" class="feature-icon">`
                      : `<i class="bi bi-gear-fill text-secondary" title="${account.featureKey}"></i>`
                  }
                </td>
                <td class="user-id-cell">
                  ${account.userId}
                  <button class="btn btn-sm btn-outline-secondary ms-2 copy-userId" data-user-id="${account.userId}">
                    <i class="bi bi-clipboard"></i>
                  </button>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-secondary copy-password" data-password="${account.password || ""}">
                    <i class="bi bi-clipboard"></i> Şifreyi Kopyala
                  </button>
                </td>
                <td class="token-cell">${apiKey ? apiKey : "-"}</td>
                <td class="token-cell">${refreshToken ? refreshToken : "-"}</td>
                <td>${new Date(account.assigned_at).toLocaleString()}</td>
                <td>
                  <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-warning release-account" data-email="${account.email}" ${tokenAttribute} ${dataAttributes}>
                    Havuza Taşı
                    </button>
                    <button class="btn btn-sm btn-info text-white query-user" data-user-id="${account.userId}">
                      Sorgula
                    </button>
                  </div>
                </td>
              `;
          // appendChild yerine prepend kullanarak en yeni hesabı en üste ekliyoruz
          accountsTable.prepend(row);
        });

        // CSV indirme butonunu göster
        document.getElementById("downloadCsvBtn").style.display = "inline-block";

        // Havuza taşıma butonlarına olay dinleyicileri ekle
        document.querySelectorAll(".release-account").forEach((button) => {
          button.addEventListener("click", function () {
            const email = this.getAttribute("data-email");
            const token = this.getAttribute("data-token") || "";

            // Windsurf hesapları için apiKey ve refreshToken bilgilerini al
            const apiKey = this.getAttribute("data-api-key") || "";
            const refreshToken = this.getAttribute("data-refresh-token") || "";

            if (confirm(`${email} hesabını aktif hesaplardan çıkarıp havuza taşımak istediğinizden emin misiniz?`)) {
              releaseAccount(email, token, apiKey, refreshToken);
            }
          });
        });

        // Kullanıcı sorgula butonlarına olay dinleyicileri ekle
        document.querySelectorAll(".query-user").forEach((button) => {
          button.addEventListener("click", function () {
            const userId = this.getAttribute("data-user-id");
            queryUser(userId);
          });
        });

        // Kopyalama butonlarına olay dinleyicileri ekle
        document.querySelectorAll(".copy-token").forEach((button) => {
          button.addEventListener("click", function () {
            const token = this.getAttribute("data-token");
            navigator.clipboard.writeText(token).then(() => showCopyToast("Token panoya kopyalandı!"));
          });
        });

        document.querySelectorAll(".copy-userId").forEach((button) => {
          button.addEventListener("click", function () {
            const userId = this.getAttribute("data-user-id");
            navigator.clipboard.writeText(userId).then(() => showCopyToast("Kullanıcı ID'si panoya kopyalandı!"));
          });
        });

        document.querySelectorAll(".copy-password").forEach((button) => {
          button.addEventListener("click", function () {
            const password = this.getAttribute("data-password");
            navigator.clipboard.writeText(password).then(() => showCopyToast("Şifre panoya kopyalandı!"));
          });
        });
      })
      .catch((error) => {
        console.error("Aktif hesapları yükleme hatası:", error);
        alert("Aktif hesaplar yüklenirken bir hata oluştu.");
      });
  }

  // İllegal hesap tespiti butonunu ekleyen fonksiyon
  function addIllegalAccountDetectionButton(accounts) {
    // Varolan butonu kaldır (eğer varsa)
    const existingButton = document.getElementById("detectIllegalAccountsBtn");
    if (existingButton) {
      existingButton.remove();
    }

    // Hesap yoksa buton ekleme
    if (!accounts || accounts.length === 0) {
      return;
    }

    // Aktif hesaplar sayfasının başlık kısmını bul
    const activeAccountsTab = document.getElementById("active-accounts");
    const headerContainer = activeAccountsTab.querySelector(".d-flex");

    // Başlık div'i varsa, butonu oraya ekle (mobil uyumlu)
    if (headerContainer) {
      // Buton HTML'i
      const buttonHTML = `
        <button id="detectIllegalAccountsBtn" class="btn btn-warning btn-sm ms-auto">
          <i class="bi bi-shield-exclamation me-1"></i>İllegal Tara
        </button>
      `;

      // Butonu başlık satırına ekle (mobil uyumlu)
      headerContainer.insertAdjacentHTML("beforeend", buttonHTML);
    } else {
      // Başlık bulunamazsa, başlık container'ı oluştur ve butonu ekle
      const headerElement = activeAccountsTab.querySelector("h4");
      if (headerElement && headerElement.parentNode) {
        // Başlık container'ını flex yap
        headerElement.parentNode.classList.add("d-flex", "align-items-center", "mb-3");

        // Buton için container oluştur
        const btnContainer = document.createElement("div");
        btnContainer.className = "ms-auto"; // Sağa yasla

        // Butonu oluştur
        btnContainer.innerHTML = `
          <button id="detectIllegalAccountsBtn" class="btn btn-warning btn-sm">
            <i class="bi bi-shield-exclamation me-1"></i>İllegal Tara
          </button>
        `;

        // Butonu ekle
        headerElement.parentNode.appendChild(btnContainer);
      } else {
        // Son çare olarak tablo üzerine ekle
        const tableContainer = activeAccountsTab.querySelector(".table-responsive") || activeAccountsTab;

        // Container oluştur
        const btnContainer = document.createElement("div");
        btnContainer.className = "d-flex justify-content-end mb-3";

        // Butonu oluştur
        btnContainer.innerHTML = `
          <button id="detectIllegalAccountsBtn" class="btn btn-warning btn-sm">
            <i class="bi bi-shield-exclamation me-1"></i>İllegal Tara
          </button>
        `;

        // Tablodan önce ekle
        if (tableContainer.previousElementSibling) {
          tableContainer.parentNode.insertBefore(btnContainer, tableContainer);
        } else {
          activeAccountsTab.prepend(btnContainer);
        }
      }
    }

    // Butona tıklama olayı ekle
    document.getElementById("detectIllegalAccountsBtn").addEventListener("click", function () {
      // Butonu devre dışı bırak ve yükleniyor göster
      const button = this;
      button.disabled = true;
      const originalText = button.innerHTML;
      button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;

      // İllegal hesap tespitini başlat
      fetchDuplicateDevices(accounts)
        .then(() => {
          // İşlem tamamlandığında butonu tekrar etkinleştir
          button.disabled = false;
          button.innerHTML = originalText;
        })
        .catch((error) => {
          console.error("İllegal hesap tespiti sırasında hata oluştu:", error);
          button.disabled = false;
          button.innerHTML = originalText;
        });
    });
  }

  // İllegal hesapları tespit etme fonksiyonu
  function fetchDuplicateDevices(accounts) {
    return new Promise((resolve, reject) => {
      // Önce aktif hesaplardan benzersiz kullanıcı ID'lerini çıkar
      const uniqueUserIds = [...new Set(accounts.map((account) => account.userId))];

      if (uniqueUserIds.length === 0) {
        resolve();
        return;
      }

      // Mevcut uyarıyı kaldır (varsa)
      const existingWarning = document.getElementById("duplicateDeviceWarning");
      if (existingWarning) {
        existingWarning.remove();
      }

      // Her bir kullanıcı için cihaz bilgilerini sorgula
      const userPromises = uniqueUserIds.map((userId) => {
        return fetch("/admin/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ uuid: userId }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              console.error(`Kullanıcı bilgileri alınamadı: ${userId}`, data.error);
              return null;
            }
            return {
              userId: userId,
              deviceInfo: data.deviceInfo || null,
            };
          })
          .catch((error) => {
            console.error(`Kullanıcı sorgulaması sırasında hata: ${userId}`, error);
            return null;
          });
      });

      // Tüm sorgular tamamlandığında
      Promise.all(userPromises)
        .then((usersWithDeviceInfo) => {
          // Null değerleri filtrele
          const validUsers = usersWithDeviceInfo.filter((user) => user !== null && user.deviceInfo !== null);

          // İllegal hesapları tespit et
          const duplicateDevices = findDuplicateDevices(validUsers);

          // Eğer illegal hesap varsa, uyarı paneli göster
          displayDuplicateDeviceWarning(duplicateDevices);

          resolve();
        })
        .catch((error) => {
          console.error("Kullanıcı cihaz bilgileri alınırken hata oluştu:", error);
          reject(error);
        });
    });
  }

  // Hesabı havuza taşıma fonksiyonu
  function releaseAccount(accountId, token, apiKey, refreshToken) {
    const releaseData = {
      id: accountId,
      token: token,
    };

    // Windsurf hesapları için apiKey ve refreshToken bilgilerini ekle
    if (apiKey) releaseData.apiKey = apiKey;
    if (refreshToken) releaseData.refreshToken = refreshToken;

    fetch("/admin/accounts/release", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(releaseData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Hesap başarıyla havuza taşındı!");
          loadActiveAccounts(); // Aktif hesapları yeniden yükle
        } else {
          alert("Hata: " + (data.error || "Bilinmeyen bir hata oluştu"));
        }
      })
      .catch((error) => {
        console.error("Hesabı havuza taşıma hatası:", error);
        alert("Hesabı havuza taşırken bir hata oluştu. Lütfen tekrar deneyin.");
      });
  }

  // Aktif hesapları temizleme
  function clearActiveAccounts() {
    if (confirm("Tüm aktif hesapları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!")) {
      fetch("/admin/accounts/active/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Tüm aktif hesaplar başarıyla silindi.");
            loadActiveAccounts(); // Aktif hesapları yeniden yükle
            // Havuz hesapları görünüyorsa onları da yenile
            if (document.querySelector(".nav-link[data-tab='pool-accounts']").classList.contains("active")) {
              loadPoolAccounts();
            }
          } else {
            alert("Hesapları temizlerken bir hata oluştu: " + (data.error || "Bilinmeyen hata"));
          }
        })
        .catch((error) => {
          console.error("Aktif hesapları temizleme hatası:", error);
          alert("Hesapları temizlerken bir hata oluştu.");
        });
    }
  }

  // Panoya kopyalama fonksiyonu
  function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Kopyalama başarılı olduğunda bildirim göster
        const toast = document.createElement("div");
        toast.className = "position-fixed bottom-0 end-0 p-3";
        toast.style.zIndex = "5";

        // Hangi tür veri kopyalandığını belirle
        let message = "Veri panoya kopyalandı!";
        if (elementId.startsWith("token-")) {
          message = "Token panoya kopyalandı!";
        } else if (elementId.startsWith("userId-")) {
          message = "Kullanıcı ID'si panoya kopyalandı!";
        } else if (elementId.startsWith("password-")) {
          message = "Şifre panoya kopyalandı!";
        }

        toast.innerHTML = `
              <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                  <strong class="me-auto">Bildirim</strong>
                  <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                  ${message}
                </div>
              </div>
            `;
        document.body.appendChild(toast);

        // 3 saniye sonra bildirimi kaldır
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 3000);
      })
      .catch((err) => {
        console.error("Kopyalama hatası:", err);
        alert("Kopyalama işlemi başarısız oldu!");
      });
  }

  // Bildirimleri yükleme
  function loadNotifications() {
    fetch("/admin/services")
      .then((response) => response.json())
      .then((data) => {
        const notificationsTable = document.getElementById("notificationsTable");
        notificationsTable.innerHTML = "";

        // Bildirimler services içinde notifications alanında
        const notifications = data.notifications || [];

        if (!notifications || notifications.length === 0) {
          notificationsTable.innerHTML = "<tr><td colspan='4' class='text-center'>Bildirim bulunamadı</td></tr>";
          return;
        }

        notifications.forEach((notification) => {
          const row = document.createElement("tr");
          row.innerHTML = `
                <td>${notification.id}</td>
                <td>${notification.message.tr}</td>
                <td>${notification.message.en}</td>
                <td>
                  <button class="btn btn-sm btn-primary edit-notification" data-id="${notification.id}">Düzenle</button>
                  <button class="btn btn-sm btn-danger delete-notification" data-id="${notification.id}">Sil</button>
                </td>
              `;
          notificationsTable.appendChild(row);
        });

        // Düzenleme butonlarına olay dinleyicileri ekle
        document.querySelectorAll(".edit-notification").forEach((button) => {
          button.addEventListener("click", function () {
            const id = this.getAttribute("data-id");
            const notification = notifications.find((n) => n.id == id);

            document.getElementById("editNotificationId").value = notification.id;
            document.getElementById("editNotificationMessageTr").value = notification.message.tr || "";
            document.getElementById("editNotificationMessageEn").value = notification.message.en || "";
            document.getElementById("editNotificationMessageZh").value = notification.message.zh || "";

            // Modalı göster
            const editModal = new bootstrap.Modal(document.getElementById("editNotificationModal"));
            editModal.show();
          });
        });

        // Silme butonlarına olay dinleyicileri ekle
        document.querySelectorAll(".delete-notification").forEach((button) => {
          button.addEventListener("click", function () {
            if (confirm("Bu bildirimi silmek istediğinizden emin misiniz?")) {
              const id = this.getAttribute("data-id");
              deleteNotification(id);
            }
          });
        });
      })
      .catch((error) => {
        console.error("Bildirimleri yükleme hatası:", error);
        document.getElementById("notificationsTable").innerHTML = "<tr><td colspan='4' class='text-center text-danger'>Bildirimler yüklenirken bir hata oluştu</td></tr>";
      });
  }

  // Bildirim silme
  function deleteNotification(id) {
    fetch("/admin/notifications/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Bildirim başarıyla silindi.");
          loadNotifications();
        } else {
          alert("Bildirim silinirken bir hata oluştu: " + (data.error || "Bilinmeyen hata"));
        }
      })
      .catch((error) => {
        console.error("Bildirim silme hatası:", error);
        alert("Bildirim silinirken bir hata oluştu.");
      });
  }

  // Servis bilgilerini yükleme
  function loadServices() {
    fetch("/admin/services")
      .then((response) => response.json())
      .then((data) => {
        // Genel ayarları doldur
        document.getElementById("repositoryUrl").value = data.repository || "";
        document.getElementById("needsFiles").value = (data.needs || []).join(", ");
        document.getElementById("dependencies").value = (data.dependencies || []).join(", ");

        // Free Credits değerini göster
        fetch("/admin/free-credits")
          .then((response) => response.json())
          .then((creditsData) => {
            console.log("Alınan free_credits verisi:", creditsData);

            // Farklı veri yapılarını kontrol et
            let creditsValue = 0;
            if (creditsData && typeof creditsData === "object") {
              if ("value" in creditsData) {
                creditsValue = creditsData.value;
              } else {
                // Diğer muhtemel yapılar
                creditsValue = parseInt(Object.values(creditsData)[0]) || 0;
              }
            } else if (typeof creditsData === "number") {
              creditsValue = creditsData;
            }

            document.getElementById("freeCredits").value = creditsValue;
          })
          .catch((error) => {
            console.error("Free Credits bilgisi getirme hatası:", error);
            document.getElementById("freeCredits").value = 0;
          });

        // Özellikleri doldur
        const featuresContainer = document.getElementById("featuresContainer");
        featuresContainer.innerHTML = "";

        if (!data.features || data.features.length === 0) {
          featuresContainer.innerHTML = `
                  <div class='alert alert-info'>
                    <i class="bi bi-info-circle me-2"></i>
                    Henüz özellik eklenmemiş.
                  </div>`;
          return;
        }

        // Özellik sayısını göster
        featuresContainer.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="badge bg-primary rounded-pill">${data.features.length} özellik</span>
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary btn-sm" id="expandAllFeatures">
                      <i class="bi bi-arrows-expand"></i> Tümünü Genişlet
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" id="collapseAllFeatures">
                      <i class="bi bi-arrows-collapse"></i> Tümünü Daralt
                    </button>
                  </div>
                </div>
                <div class="accordion" id="featuresAccordion"></div>
              `;

        const featuresAccordion = document.getElementById("featuresAccordion");

        data.features.forEach((feature, index) => {
          // Addon bilgisi varsa badge ekle
          const addonBadge = feature.addon ? `<span class="badge bg-info ms-2">Eklenti</span>` : "";
          // Aktif/Pasif durumu için badge
          const statusBadge = feature.isActive ? `<span class="badge bg-success ms-2">Aktif</span>` : `<span class="badge bg-danger ms-2">Pasif</span>`;

          const accordionItem = document.createElement("div");
          accordionItem.className = "accordion-item feature-item border-0 mb-3 shadow-sm";
          accordionItem.setAttribute("data-feature-name", feature.name.toLowerCase());
          accordionItem.setAttribute("data-feature-key", feature.nameKey.toLowerCase());
          accordionItem.setAttribute("data-feature-index", index);
          accordionItem.setAttribute("draggable", "true");

          accordionItem.innerHTML = `
                  <h2 class="accordion-header" id="heading${index}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                      data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                      <div class="d-flex justify-content-between align-items-center w-100 me-3">
                        <div>
                          <i class="bi bi-grip-vertical me-2 text-secondary drag-handle"></i>
                          <i class="bi bi-puzzle-fill me-2 text-primary"></i>
                          <strong>${feature.name}</strong>
                          <small class="text-muted">(${feature.nameKey})</small>
                          ${statusBadge}
                          ${addonBadge}
                        </div>
                      </div>
                    </button>
                  </h2>
                  <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#featuresAccordion">
                    <div class="accordion-body">
                      <div class="d-flex justify-content-end mb-3">
                        <button class="btn btn-sm btn-primary edit-feature me-2" data-index="${index}">
                          <i class="bi bi-pencil-square me-1"></i> Düzenle
                        </button>
                        <button class="btn btn-sm btn-danger delete-feature" data-index="${index}">
                          <i class="bi bi-trash me-1"></i> Sil
                        </button>
                      </div>

                      <div class="row g-3">
                        <div class="col-md-6">
                          <div class="card h-100 bg-light">
                            <div class="card-body">
                              <h6 class="card-title border-bottom pb-2">Temel Bilgiler</h6>
                              <ul class="list-group list-group-flush">
                                <li class="list-group-item bg-transparent px-0 py-1 d-flex justify-content-between">
                                  <span>Dosya Adı:</span>
                                  <strong>${feature.fileName}</strong>
                                </li>
                                <li class="list-group-item bg-transparent px-0 py-1 d-flex justify-content-between">
                                  <span>Kredi:</span>
                                  <strong>${feature.credit}</strong>
                                </li>
                                <li class="list-group-item bg-transparent px-0 py-1 d-flex justify-content-between">
                                  <span>Havuz:</span>
                                  <strong>${feature.pool ? '<i class="bi bi-check-circle-fill text-success"></i> Evet' : '<i class="bi bi-x-circle-fill text-danger"></i> Hayır'}</strong>
                                </li>
                                <li class="list-group-item bg-transparent px-0 py-1 d-flex justify-content-between">
                                  <span>Aktif:</span>
                                  <strong>${feature.isActive ? '<i class="bi bi-check-circle-fill text-success"></i> Evet' : '<i class="bi bi-x-circle-fill text-danger"></i> Hayır'}</strong>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="card h-100 bg-light">
                            <div class="card-body">
                              <h6 class="card-title border-bottom pb-2">İpuçları</h6>
                              <div class="hint-tabs">
                                <ul class="nav nav-tabs" role="tablist">
                                  <li class="nav-item" role="presentation">
                                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#hint-tr-${index}" type="button" role="tab">TR</button>
                                  </li>
                                  <li class="nav-item" role="presentation">
                                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#hint-en-${index}" type="button" role="tab">EN</button>
                                  </li>
                                  <li class="nav-item" role="presentation">
                                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#hint-zh-${index}" type="button" role="tab">ZH</button>
                                  </li>
                                </ul>
                                <div class="tab-content p-2 border border-top-0 rounded-bottom">
                                  <div class="tab-pane fade show active" id="hint-tr-${index}" role="tabpanel">
                                    ${feature.hint?.tr || '<span class="text-muted">Türkçe ipucu tanımlanmamış</span>'}
                                  </div>
                                  <div class="tab-pane fade" id="hint-en-${index}" role="tabpanel">
                                    ${feature.hint?.en || '<span class="text-muted">İngilizce ipucu tanımlanmamış</span>'}
                                  </div>
                                  <div class="tab-pane fade" id="hint-zh-${index}" role="tabpanel">
                                    ${feature.hint?.zh || '<span class="text-muted">Çince ipucu tanımlanmamış</span>'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="mt-3">
                        <div class="card">
                          <div class="card-body">
                            <h6 class="card-title">Argümanlar</h6>
                            ${
                              feature.args && feature.args.length > 0
                                ? `<div class="d-flex flex-wrap gap-2">
                                ${feature.args.map((arg) => `<span class="badge bg-secondary">${arg}</span>`).join("")}
                              </div>`
                                : '<p class="text-muted mb-0">Argüman tanımlanmamış</p>'
                            }
                          </div>
                        </div>
                      </div>

                      ${
                        feature.addon
                          ? `
                      <div class="mt-3">
                        <h6 class="border-bottom pb-2">Eklenti Bilgileri</h6>
                        <div class="row g-3">
                          <div class="col-md-6">
                            <div class="card">
                              <div class="card-body">
                                <h6 class="card-title">Temel Bilgiler</h6>
                                <ul class="list-group list-group-flush">
                                  <li class="list-group-item px-0 py-1 d-flex justify-content-between">
                                    <span>İsim:</span>
                                    <strong>${feature.addon.name}</strong>
                                  </li>
                                  <li class="list-group-item px-0 py-1 d-flex justify-content-between">
                                    <span>Anahtar:</span>
                                    <strong>${feature.addon.nameKey}</strong>
                                  </li>
                                  <li class="list-group-item px-0 py-1 d-flex justify-content-between">
                                    <span>Dosya Adı:</span>
                                    <strong>${feature.addon.fileName}</strong>
                                  </li>
                                  <li class="list-group-item px-0 py-1 d-flex justify-content-between">
                                    <span>Kredi:</span>
                                    <strong>${feature.addon.credit}</strong>
                                  </li>
                                  <li class="list-group-item px-0 py-1 d-flex justify-content-between">
                                    <span>Aktif:</span>
                                    <strong>${feature.addon.isActive ? '<i class="bi bi-check-circle-fill text-success"></i> Evet' : '<i class="bi bi-x-circle-fill text-danger"></i> Hayır'}</strong>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="card">
                              <div class="card-body">
                                <h6 class="card-title">İpuçları</h6>
                                <div class="hint-tabs">
                                  <ul class="nav nav-tabs" role="tablist">
                                    <li class="nav-item" role="presentation">
                                      <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#addon-hint-tr-${index}" type="button" role="tab">TR</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                      <button class="nav-link" data-bs-toggle="tab" data-bs-target="#addon-hint-en-${index}" type="button" role="tab">EN</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                      <button class="nav-link" data-bs-toggle="tab" data-bs-target="#addon-hint-zh-${index}" type="button" role="tab">ZH</button>
                                    </li>
                                  </ul>
                                  <div class="tab-content p-2 border border-top-0 rounded-bottom">
                                    <div class="tab-pane fade show active" id="addon-hint-tr-${index}" role="tabpanel">
                                      ${feature.addon.hint?.tr || '<span class="text-muted">Türkçe ipucu tanımlanmamış</span>'}
                                    </div>
                                    <div class="tab-pane fade" id="addon-hint-en-${index}" role="tabpanel">
                                      ${feature.addon.hint?.en || '<span class="text-muted">İngilizce ipucu tanımlanmamış</span>'}
                                    </div>
                                    <div class="tab-pane fade" id="addon-hint-zh-${index}" role="tabpanel">
                                      ${feature.addon.hint?.zh || '<span class="text-muted">Çince ipucu tanımlanmamış</span>'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="mt-3">
                            <div class="card">
                              <div class="card-body">
                                <h6 class="card-title">Argümanlar</h6>
                                ${
                                  feature.addon.args && feature.addon.args.length > 0
                                    ? `<div class="d-flex flex-wrap gap-2">
                                    ${feature.addon.args.map((arg) => `<span class="badge bg-secondary">${arg}</span>`).join("")}
                                  </div>`
                                    : '<p class="text-muted mb-0">Argüman tanımlanmamış</p>'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      `
                          : ""
                      }
                    </div>
                  </div>
                `;

          featuresAccordion.appendChild(accordionItem);
        });

        // Özellik düzenleme butonlarına olay dinleyicileri ekle
        document.querySelectorAll(".edit-feature").forEach((button) => {
          button.addEventListener("click", function () {
            const index = this.getAttribute("data-index");
            // Özelliğe index değerini ekle
            const featureWithIndex = { ...data.features[index], index };

            // Hesap düzenleme modalında özellik listesini kontrol et ve gerekirse yükle
            const editAccountFeature = document.getElementById("editAccountFeature");
            if (editAccountFeature && editAccountFeature.options.length <= 1) {
              loadFeatures();
            }

            editFeature(featureWithIndex);
          });
        });

        // Özellik silme butonlarına olay dinleyicileri ekle
        document.querySelectorAll(".delete-feature").forEach((button) => {
          button.addEventListener("click", function () {
            const index = this.getAttribute("data-index");
            if (confirm(`"${data.features[index].name}" özelliğini silmek istediğinizden emin misiniz?`)) {
              deleteFeature(index, data);
            }
          });
        });

        // Tümünü genişlet/daralt butonları
        document.getElementById("expandAllFeatures")?.addEventListener("click", function () {
          document.querySelectorAll("#featuresAccordion .accordion-collapse").forEach((item) => {
            item.classList.add("show");
          });
          document.querySelectorAll("#featuresAccordion .accordion-button").forEach((button) => {
            button.classList.remove("collapsed");
            button.setAttribute("aria-expanded", "true");
          });
        });

        document.getElementById("collapseAllFeatures")?.addEventListener("click", function () {
          document.querySelectorAll("#featuresAccordion .accordion-collapse").forEach((item) => {
            item.classList.remove("show");
          });
          document.querySelectorAll("#featuresAccordion .accordion-button").forEach((button) => {
            button.classList.add("collapsed");
            button.setAttribute("aria-expanded", "false");
          });
        });

        // Arama işlevselliği
        document.getElementById("featureSearchInput")?.addEventListener("input", function () {
          const searchTerm = this.value.toLowerCase().trim();
          document.querySelectorAll(".feature-item").forEach((item) => {
            const featureName = item.getAttribute("data-feature-name");
            const featureKey = item.getAttribute("data-feature-key");

            if (featureName.includes(searchTerm) || featureKey.includes(searchTerm)) {
              item.style.display = "";
            } else {
              item.style.display = "none";
            }
          });
        });

        // Sürükle-bırak işlevselliği
        initDragAndDrop(data);
      })
      .catch((error) => {
        console.error("Servis bilgilerini yükleme hatası:", error);
        document.getElementById("featuresContainer").innerHTML = `
                <div class='alert alert-danger'>
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  Servis bilgileri yüklenirken bir hata oluştu
                </div>`;
      });
  }

  // Sürükle-bırak işlevselliği
  function initDragAndDrop(data) {
    const featuresAccordion = document.getElementById("featuresAccordion");
    let draggedItem = null;

    // Tüm özellik öğelerine sürükle-bırak olayları ekle
    document.querySelectorAll(".feature-item").forEach((item) => {
      // Sürükleme başladığında
      item.addEventListener("dragstart", function (e) {
        draggedItem = this;
        setTimeout(() => {
          this.classList.add("dragging");
        }, 0);
      });

      // Sürükleme bittiğinde
      item.addEventListener("dragend", function () {
        this.classList.remove("dragging");
        draggedItem = null;

        // Yeni sıralamayı kaydet
        saveNewFeatureOrder(data);
      });

      // Sürükleme üzerine geldiğinde
      item.addEventListener("dragover", function (e) {
        e.preventDefault();
        if (draggedItem === this) return;

        const afterElement = getDragAfterElement(featuresAccordion, e.clientY);
        if (afterElement == null) {
          featuresAccordion.appendChild(draggedItem);
        } else {
          featuresAccordion.insertBefore(draggedItem, afterElement);
        }
      });

      // Sürükleme alanına girdiğinde
      item.addEventListener("dragenter", function (e) {
        e.preventDefault();
        if (draggedItem === this) return;
        this.classList.add("drag-over");
      });

      // Sürükleme alanından çıktığında
      item.addEventListener("dragleave", function () {
        this.classList.remove("drag-over");
      });

      // Bırakıldığında
      item.addEventListener("drop", function (e) {
        e.preventDefault();
        this.classList.remove("drag-over");
      });
    });
  }

  // Sürükleme sonrası elemanın nereye yerleştirileceğini belirle
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".feature-item:not(.dragging)")];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  // Yeni özellik sıralamasını kaydet
  function saveNewFeatureOrder(data) {
    // Yeni sıralamayı al
    const newOrder = [];
    document.querySelectorAll(".feature-item").forEach((item) => {
      const index = parseInt(item.getAttribute("data-feature-index"));
      newOrder.push(data.features[index]);
    });

    // Veriyi güncelle
    data.features = newOrder;

    // Sunucuya gönder
    updateServices(data);
  }

  // Servis bilgilerini güncelleme
  function updateServices(services) {
    fetch("/admin/services/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(services),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Servis bilgileri başarıyla güncellendi.");
          loadServices();
        } else {
          alert("Servis bilgileri güncellenirken bir hata oluştu: " + (data.error || "Bilinmeyen hata"));
        }
      })
      .catch((error) => {
        console.error("Servis bilgileri güncelleme hatası:", error);
        alert("Servis bilgileri güncellenirken bir hata oluştu.");
      });
  }

  // Yeni bildirim ekleme butonu
  document.getElementById("saveNotificationBtn").addEventListener("click", function () {
    const messageTr = document.getElementById("notificationMessageTr").value;
    const messageEn = document.getElementById("notificationMessageEn").value;
    const messageZh = document.getElementById("notificationMessageZh").value;

    if (!messageTr || !messageEn) {
      alert("Lütfen en az Türkçe ve İngilizce mesajları doldurun!");
      return;
    }

    // Rastgele bir ID değeri oluştur (1000-9999999 arasında)
    const randomId = Math.floor(Math.random() * 9000000) + 1000;

    const message = {
      tr: messageTr,
      en: messageEn,
    };

    if (messageZh) {
      message.zh = messageZh;
    }

    fetch("/admin/notifications/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: randomId,
        message,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Bildirim başarıyla eklendi!");
          document.getElementById("addNotificationForm").reset();
          bootstrap.Modal.getInstance(document.getElementById("addNotificationModal")).hide();
          loadNotifications();
        } else {
          alert("Hata: " + data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Bir hata oluştu. Lütfen tekrar deneyin.");
      });
  });

  // Bildirim güncelleme butonu
  document.getElementById("updateNotificationBtn").addEventListener("click", function () {
    const id = document.getElementById("editNotificationId").value;
    const messageTr = document.getElementById("editNotificationMessageTr").value;
    const messageEn = document.getElementById("editNotificationMessageEn").value;
    const messageZh = document.getElementById("editNotificationMessageZh").value;

    if (!id || !messageTr || !messageEn) {
      alert("Lütfen en az Türkçe ve İngilizce mesajları doldurun!");
      return;
    }

    const message = {
      tr: messageTr,
      en: messageEn,
    };

    if (messageZh) {
      message.zh = messageZh;
    }

    fetch("/admin/notifications/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, message }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Bildirim başarıyla güncellendi!");
          bootstrap.Modal.getInstance(document.getElementById("editNotificationModal")).hide();
          loadNotifications();
        } else {
          alert("Hata: " + data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Bir hata oluştu. Lütfen tekrar deneyin.");
      });
  });

  // Bildirim silme butonu
  document.getElementById("deleteNotificationBtn").addEventListener("click", function () {
    if (confirm("Bu bildirimi silmek istediğinizden emin misiniz?")) {
      const id = document.getElementById("editNotificationId").value;

      fetch("/admin/notifications/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Bildirim başarıyla silindi!");
            bootstrap.Modal.getInstance(document.getElementById("editNotificationModal")).hide();
            loadNotifications();
          } else {
            alert("Hata: " + data.error);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        });
    }
  });

  // Yeni özellik ekleme butonu
  document.getElementById("addFeatureBtn").addEventListener("click", function () {
    const addFeatureModal = new bootstrap.Modal(document.getElementById("addFeatureModal"));
    addFeatureModal.show();
  });

  // Kredi güncelleme işlevi
  function updateCredits(uuid) {
    const credits = document.getElementById("credits").value;

    fetch("/admin/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uuid, credits }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Kredi başarıyla güncellendi!");
        } else {
          alert("Hata: " + data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Bir hata oluştu. Lütfen tekrar deneyin.");
      });
  }

  // Belirli türdeki tüm hesapları silme
  function deleteAccountsByType(featureKey) {
    fetch("/admin/accounts/delete-by-type", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ featureKey }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(`${featureKey} türündeki tüm hesaplar başarıyla silindi.`);
          loadPoolAccounts(); // Hesapları yeniden yükle
        } else {
          alert("Hesaplar silinirken bir hata oluştu: " + (data.error || "Bilinmeyen hata"));
        }
      })
      .catch((error) => {
        console.error("Hesapları toplu silme hatası:", error);
        alert("Hesaplar silinirken bir hata oluştu.");
      });
  }

  // Hesap silme
  function deleteAccount(id, featureKey) {
    fetch("/admin/accounts/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, featureKey }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Hesap başarıyla silindi.");

          // Eğer featureKey belirtilmişse o özelliğe göre listeyi yenile
          if (featureKey) {
            setTimeout(() => loadAccountsByFeature(featureKey), 500);
          }
          // Filtre uygulanmışsa filtreleri yenile
          else if (filtersApplied) {
            setTimeout(() => applyAccountFilters(), 500);
          }
          // Hiçbiri değilse tüm listeyi yenile
          else {
            setTimeout(() => loadPoolAccounts(), 500);
          }
        } else {
          alert("Hesap silinirken bir hata oluştu: " + (data.error || "Bilinmeyen hata"));
        }
      })
      .catch((error) => {
        console.error("Hesap silme hatası:", error);
        alert("Hesap silinirken bir hata oluştu.");
      });
  }

  // Toast gösterme fonksiyonunu ekle
  function showCopyToast(message) {
    const toast = document.createElement("div");
    toast.className = "position-fixed bottom-0 end-0 p-3";
    toast.style.zIndex = "5";

    toast.innerHTML = `
      <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">Bildirim</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;
    document.body.appendChild(toast);

    // 3 saniye sonra bildirimi kaldır
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }

  // Sayfa yüklendiğinde oturum kontrolü yapan fonksiyon
  function checkSessionOnLoad() {
    console.log("Sayfa yüklendiğinde oturum kontrolü yapılıyor...");

    // Cookie'den adminToken'ı kontrol et
    const adminToken = getCookie("adminToken");
    if (!adminToken) {
      console.log("Admin token bulunamadı, oturum geçersiz olabilir.");
    } else {
      console.log("Admin token bulundu, oturum aktif görünüyor.");
    }

    // Oturum durumunu kontrol et
    fetch("/admin/check-session")
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Oturum geçersiz");
        }
      })
      .then((data) => {
        console.log("Oturum kontrolü başarılı:", data);
      })
      .catch((error) => {
        console.error("Oturum kontrolü sırasında hata:", error);
        if (error.message === "Oturum geçersiz") {
          alert("Oturumunuz geçersiz. Lütfen tekrar giriş yapın.");
          window.location.href = "/admin";
        }
      });
  }

  // Cookie değerini almak için yardımcı fonksiyon
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  // Kullanıcı bilgilerini getirme ve popup gösterme
  function queryUser(userId) {
    if (!userId) {
      alert("Kullanıcı ID'si bulunamadı!");
      return;
    }

    fetch("/admin/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uuid: userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert("Hata: " + data.error);
          return;
        }

        // Sunucudan gelen veriyi doğrudan kullan
        const userData = {
          uuid: data.uuid || userId,
          email: data.email || "-",
          credits: data.credits,
          created_at: data.created_at,
          last_login: data.last_login,
          ip_address: data.ip_address,
          language: data.language,
          deviceInfo: data.deviceInfo,
          isBanned: data.isBanned,
        };

        // Kullanıcı bilgilerini popup olarak göster
        showUserInfoPopup(userData);
      })
      .catch((error) => {
        console.error("Kullanıcı sorgulama hatası:", error);
        alert("Kullanıcı sorgulanırken bir hata oluştu.");
      });
  }

  // Kullanıcı bilgilerini popup olarak gösterme
  function showUserInfoPopup(user) {
    // Kullanıcı bilgisi yoksa hata göster
    if (!user) {
      alert("Kullanıcı bilgileri bulunamadı!");
      return;
    }

    // Eğer zaten bir popup varsa kaldır
    const existingPopup = document.getElementById("userInfoPopup");
    if (existingPopup) {
      document.body.removeChild(existingPopup);
    }

    // Popup oluştur
    const popup = document.createElement("div");
    popup.id = "userInfoPopup";
    popup.className = "user-info-popup";

    // Cihaz bilgilerini hazırla
    let deviceInfoHtml = "-";
    if (user.deviceInfo) {
      deviceInfoHtml = `
        <div class="device-info-container">
          <table class="table table-sm table-bordered">
            <tr>
              <th>Cihaz ID</th>
              <td>${user.deviceInfo.deviceId || "-"}</td>
            </tr>
            <tr>
              <th>MAC Adresi</th>
              <td>${user.deviceInfo.macAddress || "-"}</td>
            </tr>
            <tr>
              <th>Bilgisayar Adı</th>
              <td>${user.deviceInfo.computerName || "-"}</td>
            </tr>
            <tr>
              <th>Kullanıcı Adı</th>
              <td>${user.deviceInfo.username || "-"}</td>
            </tr>
            <tr>
              <th>IP Adresi</th>
              <td>${user.deviceInfo.ipAddress || "-"}</td>
            </tr>
            <tr>
              <th>Yerel Ayar</th>
              <td>${user.deviceInfo.locale || "-"}</td>
            </tr>
            <tr>
              <th>İşletim Sistemi</th>
              <td>${user.deviceInfo.osName || "-"}</td>
            </tr>
            <tr>
              <th>Ürün Adı</th>
              <td>${user.deviceInfo.productName || "-"}</td>
            </tr>
            <tr>
              <th>İşlemci Çekirdek Sayısı</th>
              <td>${user.deviceInfo.numberOfCores || "-"}</td>
            </tr>
            <tr>
              <th>Sistem Belleği (MB)</th>
              <td>${user.deviceInfo.systemMemoryInMegabytes || "-"}</td>
            </tr>
            <tr>
              <th>Model</th>
              <td>${user.deviceInfo.model || "-"}</td>
            </tr>
          </table>
        </div>
      `;
    }

    // Ban durumunu hazırla
    let banInfoHtml = "-";
    if (user.isBanned && user.banInfo) {
      banInfoHtml = `
        <div class="text-danger">
          <strong>Ban Nedeni:</strong> ${user.banInfo.reason || "-"}<br>
          <strong>Ban Tarihi:</strong> ${user.banInfo.date ? new Date(user.banInfo.date).toLocaleString() : "-"}
        </div>
      `;
    } else if (user.isBanned) {
      banInfoHtml = '<div class="text-danger"><strong>Banlı</strong></div>';
    } else {
      banInfoHtml = '<div class="text-success">Banlı Değil</div>';
    }

    // Kullanıcı bilgilerini hazırla
    let userInfo = `
      <div class="popup-header">
        <h5>Kullanıcı Bilgileri</h5>
        <button class="close-popup"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="popup-body">
        <table class="table table-bordered">
          <tr>
            <th>UUID</th>
            <td>${user.uuid || "-"}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>${user.email || "-"}</td>
          </tr>
          <tr>
            <th>Kredi</th>
            <td>${user.credits !== undefined ? user.credits : "-"}</td>
          </tr>
          <tr>
            <th>Oluşturulma Tarihi</th>
            <td>${user.created_at ? new Date(user.created_at).toLocaleString() : "-"}</td>
          </tr>
          <tr>
            <th>Son Giriş</th>
            <td>${user.last_login ? new Date(user.last_login).toLocaleString() : "-"}</td>
          </tr>
          <tr>
            <th>IP Adresi</th>
            <td>${user.ip_address || "-"}</td>
          </tr>
          <tr>
            <th>Dil</th>
            <td>${user.language || "-"}</td>
          </tr>
          <tr>
            <th>Cihaz Bilgileri</th>
            <td>${deviceInfoHtml}</td>
          </tr>
          <tr>
            <th>Ban Durumu</th>
            <td>${banInfoHtml}</td>
          </tr>
        </table>
      </div>
    `;

    popup.innerHTML = userInfo;

    // Popup'ı sayfaya ekle
    document.body.appendChild(popup);

    // Kapatma butonuna olay dinleyicisi ekle
    popup.querySelector(".close-popup").addEventListener("click", function () {
      document.body.removeChild(popup);
    });

    // Popup dışına tıklandığında kapat
    document.addEventListener("click", function closePopup(e) {
      if (!popup.contains(e.target) && e.target !== popup) {
        document.body.removeChild(popup);
        document.removeEventListener("click", closePopup);
      }
    });
  }

  // CSS stil ekle - document ready içinde
  const userPopupStyle = document.createElement("style");
  userPopupStyle.textContent = `
    .user-info-popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(0,0,0,0.3);
      z-index: 1000;
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border-bottom: 1px solid #eee;
      background-color: #f8f9fa;
      border-radius: 8px 8px 0 0;
    }

    .popup-header h5 {
      margin: 0;
      font-weight: 600;
    }

    .popup-header .close-popup {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
    }

    .popup-body {
      padding: 15px;
    }

    .device-info-container {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #eee;
      border-radius: 4px;
    }

    .device-info-container table {
      margin-bottom: 0;
    }

    .device-info-container th {
      width: 40%;
      background-color: #f8f9fa;
    }
  `;
  document.head.appendChild(userPopupStyle);

  // İllegal hesapları tespit etme fonksiyonu
  function fetchDuplicateDevices(accounts) {
    return new Promise((resolve, reject) => {
      // Önce aktif hesaplardan benzersiz kullanıcı ID'lerini çıkar
      const uniqueUserIds = [...new Set(accounts.map((account) => account.userId))];

      if (uniqueUserIds.length === 0) {
        resolve();
        return;
      }

      // Mevcut uyarıyı kaldır (varsa)
      const existingWarning = document.getElementById("duplicateDeviceWarning");
      if (existingWarning) {
        existingWarning.remove();
      }

      // Her bir kullanıcı için cihaz bilgilerini sorgula
      const userPromises = uniqueUserIds.map((userId) => {
        return fetch("/admin/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ uuid: userId }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              console.error(`Kullanıcı bilgileri alınamadı: ${userId}`, data.error);
              return null;
            }
            return {
              userId: userId,
              deviceInfo: data.deviceInfo || null,
            };
          })
          .catch((error) => {
            console.error(`Kullanıcı sorgulaması sırasında hata: ${userId}`, error);
            return null;
          });
      });

      // Tüm sorgular tamamlandığında
      Promise.all(userPromises)
        .then((usersWithDeviceInfo) => {
          // Null değerleri filtrele
          const validUsers = usersWithDeviceInfo.filter((user) => user !== null && user.deviceInfo !== null);

          // İllegal hesapları tespit et
          const duplicateDevices = findDuplicateDevices(validUsers);

          // Eğer illegal hesap varsa, uyarı paneli göster
          displayDuplicateDeviceWarning(duplicateDevices);

          resolve();
        })
        .catch((error) => {
          console.error("Kullanıcı cihaz bilgileri alınırken hata oluştu:", error);
          reject(error);
        });
    });
  }

  // Aynı cihaz bilgilerine sahip kullanıcıları bulan fonksiyon
  function findDuplicateDevices(users) {
    const deviceIdMap = new Map();
    const macAddressMap = new Map();
    const computerNameMap = new Map();
    const ipAddressMap = new Map();

    const duplicates = {
      deviceId: [],
      macAddress: [],
      computerName: [],
      ipAddress: [],
    };

    // Her bir kullanıcı için kontrol yap
    users.forEach((user) => {
      // Cihaz ID kontrolü
      if (user.deviceInfo.deviceId) {
        if (deviceIdMap.has(user.deviceInfo.deviceId)) {
          duplicates.deviceId.push({
            deviceId: user.deviceInfo.deviceId,
            users: [deviceIdMap.get(user.deviceInfo.deviceId), user.userId],
          });
        } else {
          deviceIdMap.set(user.deviceInfo.deviceId, user.userId);
        }
      }

      // MAC Adresi kontrolü
      if (user.deviceInfo.macAddress) {
        if (macAddressMap.has(user.deviceInfo.macAddress)) {
          duplicates.macAddress.push({
            macAddress: user.deviceInfo.macAddress,
            users: [macAddressMap.get(user.deviceInfo.macAddress), user.userId],
          });
        } else {
          macAddressMap.set(user.deviceInfo.macAddress, user.userId);
        }
      }

      // Bilgisayar Adı kontrolü
      if (user.deviceInfo.computerName) {
        if (computerNameMap.has(user.deviceInfo.computerName)) {
          duplicates.computerName.push({
            computerName: user.deviceInfo.computerName,
            users: [computerNameMap.get(user.deviceInfo.computerName), user.userId],
          });
        } else {
          computerNameMap.set(user.deviceInfo.computerName, user.userId);
        }
      }

      // IP Adresi kontrolü
      if (user.deviceInfo.ipAddress) {
        if (ipAddressMap.has(user.deviceInfo.ipAddress)) {
          duplicates.ipAddress.push({
            ipAddress: user.deviceInfo.ipAddress,
            users: [ipAddressMap.get(user.deviceInfo.ipAddress), user.userId],
          });
        } else {
          ipAddressMap.set(user.deviceInfo.ipAddress, user.userId);
        }
      }
    });

    return duplicates;
  }

  // İllegal hesap uyarısını gösteren fonksiyon
  function displayDuplicateDeviceWarning(duplicates) {
    // Uyarı panelini eklemek için aktif hesaplar tabının üst kısmını bul
    const activeAccountsTab = document.getElementById("active-accounts");
    const warningContainer = document.createElement("div");
    warningContainer.id = "duplicateDeviceWarning";

    // Mevcut uyarıyı kaldır (varsa)
    const existingWarning = document.getElementById("duplicateDeviceWarning");
    if (existingWarning) {
      existingWarning.remove();
    }

    // Eğer hiç illegal hesap yoksa bilgi mesajı göster
    const hasDuplicates = duplicates.deviceId.length > 0 || duplicates.macAddress.length > 0 || duplicates.computerName.length > 0 || duplicates.ipAddress.length > 0;

    if (!hasDuplicates) {
      warningContainer.innerHTML = `
        <div class="alert alert-info mb-4">
          <h5 class="alert-heading d-flex align-items-center">
            <i class="bi bi-check-circle-fill me-2"></i>
            İllegal Hesap Bulunamadı
          </h5>
          <p>Aynı cihaz bilgilerini kullanan farklı kullanıcılar tespit edilmedi.</p>
          <div class="text-end">
            <button id="closeDuplicateWarning" class="btn btn-sm btn-outline-dark">
              <i class="bi bi-x-circle me-1"></i>Kapat
            </button>
          </div>
        </div>
      `;

      // Uyarı panelini ekle
      const tableContainer = activeAccountsTab.querySelector(".table-responsive");
      if (tableContainer) {
        tableContainer.parentNode.insertBefore(warningContainer, tableContainer);
      } else {
        const tableElement = activeAccountsTab.querySelector("table");
        if (tableElement) {
          tableElement.parentNode.insertBefore(warningContainer, tableElement);
        } else {
          activeAccountsTab.appendChild(warningContainer);
        }
      }

      // Kapatma butonuna tıklama olayı ekle
      document.getElementById("closeDuplicateWarning").addEventListener("click", function () {
        document.getElementById("duplicateDeviceWarning").remove();
      });

      return;
    }

    // İllegal hesaplar için uyarı paneli oluştur
    let warningHTML = `
      <div class="alert alert-danger mb-4">
        <h5 class="alert-heading d-flex align-items-center">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          İllegal Hesap Kullanımı Tespit Edildi!
        </h5>
        <p>Aşağıdaki kullanıcılar aynı cihaz bilgilerini kullanmaktadır. Bu durum, bir kişinin birden fazla hesap açtığını gösterebilir.</p>
        <hr>
        <div class="row">
    `;

    // Cihaz ID'si aynı olanlar
    if (duplicates.deviceId.length > 0) {
      warningHTML += `
        <div class="col-md-6 mb-3">
          <h6><i class="bi bi-pc-display me-1"></i>Aynı Cihaz ID'sine Sahip Kullanıcılar:</h6>
          <ul class="mb-0">
      `;

      duplicates.deviceId.forEach((dup) => {
        warningHTML += `<li>Cihaz ID: <span class="badge bg-secondary">${dup.deviceId}</span> - Kullanıcılar: ${dup.users.map((u) => `<a href="#" class="query-illegal-user" data-user-id="${u}">${u}</a>`).join(", ")}</li>`;
      });

      warningHTML += `
          </ul>
        </div>
      `;
    }

    // MAC Adresi aynı olanlar
    if (duplicates.macAddress.length > 0) {
      warningHTML += `
        <div class="col-md-6 mb-3">
          <h6><i class="bi bi-wifi me-1"></i>Aynı MAC Adresine Sahip Kullanıcılar:</h6>
          <ul class="mb-0">
      `;

      duplicates.macAddress.forEach((dup) => {
        warningHTML += `<li>MAC: <span class="badge bg-secondary">${dup.macAddress}</span> - Kullanıcılar: ${dup.users.map((u) => `<a href="#" class="query-illegal-user" data-user-id="${u}">${u}</a>`).join(", ")}</li>`;
      });

      warningHTML += `
          </ul>
        </div>
      `;
    }

    // Bilgisayar Adı aynı olanlar
    if (duplicates.computerName.length > 0) {
      warningHTML += `
        <div class="col-md-6 mb-3">
          <h6><i class="bi bi-laptop me-1"></i>Aynı Bilgisayar Adına Sahip Kullanıcılar:</h6>
          <ul class="mb-0">
      `;

      duplicates.computerName.forEach((dup) => {
        warningHTML += `<li>Bilgisayar Adı: <span class="badge bg-secondary">${dup.computerName}</span> - Kullanıcılar: ${dup.users.map((u) => `<a href="#" class="query-illegal-user" data-user-id="${u}">${u}</a>`).join(", ")}</li>`;
      });

      warningHTML += `
          </ul>
        </div>
      `;
    }

    // IP Adresi aynı olanlar
    if (duplicates.ipAddress.length > 0) {
      warningHTML += `
        <div class="col-md-6 mb-3">
          <h6><i class="bi bi-globe me-1"></i>Aynı IP Adresine Sahip Kullanıcılar:</h6>
          <ul class="mb-0">
      `;

      duplicates.ipAddress.forEach((dup) => {
        warningHTML += `<li>IP: <span class="badge bg-secondary">${dup.ipAddress}</span> - Kullanıcılar: ${dup.users.map((u) => `<a href="#" class="query-illegal-user" data-user-id="${u}">${u}</a>`).join(", ")}</li>`;
      });

      warningHTML += `
          </ul>
        </div>
      `;
    }

    warningHTML += `
        </div>
        <div class="text-end">
          <button id="closeDuplicateWarning" class="btn btn-sm btn-outline-dark">
            <i class="bi bi-x-circle me-1"></i>Kapat
          </button>
          <button id="banAllDuplicateUsers" class="btn btn-sm btn-danger ms-2">
            <i class="bi bi-ban me-1"></i>Tüm İllegal Hesapları Banla
          </button>
        </div>
      </div>
    `;

    warningContainer.innerHTML = warningHTML;

    // Uyarı panelini ekle
    const headerElement = activeAccountsTab.querySelector("h4");
    if (headerElement) {
      headerElement.parentNode.insertBefore(warningContainer, headerElement.nextSibling);
    } else {
      activeAccountsTab.prepend(warningContainer);
    }

    // Uyarı paneli olay dinleyicilerini ekle
    addDuplicateWarningEventListeners(duplicates);
  }

  // İllegal hesap uyarı paneline olay dinleyicileri ekleyen fonksiyon
  function addDuplicateWarningEventListeners(duplicates) {
    // Kullanıcı sorgulama butonları
    document.querySelectorAll(".query-illegal-user").forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const userId = this.getAttribute("data-user-id");
        queryUser(userId);
      });
    });

    // Uyarı panelini kapatma butonu
    const closeButton = document.getElementById("closeDuplicateWarning");
    if (closeButton) {
      closeButton.addEventListener("click", function () {
        document.getElementById("duplicateDeviceWarning").remove();
      });
    }

    // Tüm illegal hesapları banlama butonu
    const banAllButton = document.getElementById("banAllDuplicateUsers");
    if (banAllButton) {
      banAllButton.addEventListener("click", function () {
        if (confirm("Tespit edilen tüm illegal hesapları banlamak istediğinizden emin misiniz?")) {
          // Tüm benzersiz illegal kullanıcıları al
          const allDuplicateUsers = new Set();

          // Tüm çakışan kullanıcıları ekle
          Object.values(duplicates).forEach((category) => {
            category.forEach((item) => {
              item.users.forEach((userId) => allDuplicateUsers.add(userId));
            });
          });

          // Her bir kullanıcıyı ban işlemi için sorgula
          const banPromises = [...allDuplicateUsers].map((userId) => {
            return fetch("/admin/search", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ uuid: userId }),
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.error || !data.deviceInfo) {
                  console.error(`${userId} için kullanıcı bilgileri alınamadı`);
                  return Promise.reject(`${userId} için cihaz bilgileri bulunamadı`);
                }

                // Ban isteği gönder
                return fetch("/admin/ban-device", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                  },
                  body: JSON.stringify({
                    deviceId: data.deviceInfo.deviceId || "",
                    macAddress: data.deviceInfo.macAddress || "",
                    banReason: "İllegal çoklu hesap kullanımı",
                    ipAddress: data.deviceInfo.ipAddress || "",
                    additionalInfo: {
                      uuid: userId,
                      banDate: new Date().toISOString(),
                      computerName: data.deviceInfo.computerName || "",
                      username: data.deviceInfo.username || "",
                      locale: data.deviceInfo.locale || "",
                      osName: data.deviceInfo.osName || "",
                      productName: data.deviceInfo.productName || "",
                      numberOfCores: data.deviceInfo.numberOfCores || "",
                      systemMemoryInMegabytes: data.deviceInfo.systemMemoryInMegabytes || "",
                      model: data.deviceInfo.model || "",
                    },
                  }),
                }).then((response) => response.json());
              });
          });

          // Tüm ban isteklerini yürüt
          Promise.allSettled(banPromises).then((results) => {
            const successful = results.filter((r) => r.status === "fulfilled").length;
            const failed = results.filter((r) => r.status === "rejected").length;

            if (successful > 0) {
              alert(`${successful} kullanıcı başarıyla banlandı. ${failed > 0 ? `${failed} kullanıcı banlanamadı.` : ""}`);
              // Aktif hesapları yeniden yükle
              loadActiveAccounts();
            } else {
              alert("Hesaplar banlanırken bir hata oluştu, lütfen tekrar deneyin.");
            }
          });
        }
      });
    }
  }

  // Günlük giriş istatistiklerini yükleme fonksiyonu
  function loadDailyLoginStats() {
    fetch("/admin/stats/daily-logins")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Günlük giriş istatistikleri alınamadı");
        }
        return response.json();
      })
      .then((data) => {
        const dailyLoginCountElement = document.getElementById("dailyLoginCount");
        if (dailyLoginCountElement) {
          // Sayı değeri olmasa da 0 göster
          const count = data.count || 0;
          dailyLoginCountElement.textContent = count.toLocaleString();

          // Count 0 ise gri, değilse mavi göster
          if (count === 0) {
            dailyLoginCountElement.classList.remove("bg-primary");
            dailyLoginCountElement.classList.add("bg-secondary");
          } else {
            dailyLoginCountElement.classList.remove("bg-secondary");
            dailyLoginCountElement.classList.add("bg-primary");
          }
        }

        // İstatistik grafiği gösterme butonu olayını ekle
        const showLoginStatsBtn = document.getElementById("showLoginStatsBtn");
        if (showLoginStatsBtn) {
          showLoginStatsBtn.addEventListener("click", showLoginStatsModal);
        }
      })
      .catch((error) => {
        console.error("Günlük giriş istatistikleri yükleme hatası:", error);
        const dailyLoginCountElement = document.getElementById("dailyLoginCount");
        if (dailyLoginCountElement) {
          dailyLoginCountElement.textContent = "0";
          dailyLoginCountElement.classList.remove("bg-primary");
          dailyLoginCountElement.classList.add("bg-secondary");
        }
      });
  }

  // Son 30 günlük giriş istatistiklerini gösteren modal
  function showLoginStatsModal() {
    // Modal HTML'ini oluştur
    const modalHTML = `
      <div class="modal fade" id="loginStatsModal" tabindex="-1" aria-labelledby="loginStatsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="loginStatsModalLabel">Günlük Giriş İstatistikleri (Son 30 Gün)</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Kapat"></button>
            </div>
            <div class="modal-body">
              <div class="text-center mb-3" id="statsLoader">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Yükleniyor...</span>
                </div>
                <p class="mt-2">İstatistikler yükleniyor...</p>
              </div>
              <div id="statsContent" style="display: none;">
                <div class="table-responsive">
                  <table class="table table-sm table-striped">
                    <thead>
                      <tr>
                        <th>Tarih</th>
                        <th class="text-end">Giriş Sayısı</th>
                      </tr>
                    </thead>
                    <tbody id="statsTableBody"></tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Kapat</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Modal varsa kaldır
    const existingModal = document.getElementById("loginStatsModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Modal'ı sayfaya ekle
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Modal'ı göster
    const modal = new bootstrap.Modal(document.getElementById("loginStatsModal"));
    modal.show();

    // İstatistikleri yükle
    loadAllLoginStats();
  }

  // Son 30 günlük istatistikleri yükle
  function loadAllLoginStats() {
    fetch("/admin/stats/daily-logins?all=true")
      .then((response) => {
        if (!response.ok) {
          throw new Error("İstatistikler alınamadı");
        }
        return response.json();
      })
      .then((data) => {
        // Yükleniyor göstergesini gizle, içeriği göster
        document.getElementById("statsLoader").style.display = "none";
        document.getElementById("statsContent").style.display = "block";

        // Tabloyu doldur
        const tableBody = document.getElementById("statsTableBody");
        tableBody.innerHTML = "";

        // Toplam hesapla
        let totalLogins = 0;

        // Tüm verileri (giriş sayısı 0 olanlar dahil) tarihe göre sırala (en yeni en üstte)
        data.stats.sort((a, b) => b.date.localeCompare(a.date));

        // Eğer hiç veri yoksa bilgilendirici mesaj göster
        if (data.stats.length === 0) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="2" class="text-center py-3">
                <div class="text-muted">
                  <i class="bi bi-info-circle me-2"></i>
                  Son 30 günde hiç kullanıcı girişi olmamış.
                </div>
              </td>
            </tr>
          `;
        } else {
          data.stats.forEach((stat) => {
            const row = document.createElement("tr");

            // Bugün ise vurgula
            if (stat.date === data.today) {
              row.classList.add("table-primary", "fw-bold");
            }

            // Tarih sütunu
            const dateCell = document.createElement("td");
            const dateParts = stat.date.split("-");
            dateCell.textContent = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
            row.appendChild(dateCell);

            // Sayı sütunu
            const countCell = document.createElement("td");
            countCell.classList.add("text-end");
            countCell.textContent = stat.count.toLocaleString();
            row.appendChild(countCell);

            tableBody.appendChild(row);

            // Toplama ekle
            totalLogins += stat.count;
          });

          // Toplam satırı ekle
          const totalRow = document.createElement("tr");
          totalRow.classList.add("table-dark", "fw-bold");

          const totalLabelCell = document.createElement("td");
          totalLabelCell.textContent = "Toplam";
          totalRow.appendChild(totalLabelCell);

          const totalCountCell = document.createElement("td");
          totalCountCell.classList.add("text-end");
          totalCountCell.textContent = totalLogins.toLocaleString();
          totalRow.appendChild(totalCountCell);

          tableBody.appendChild(totalRow);
        }
      })
      .catch((error) => {
        console.error("İstatistik yükleme hatası:", error);
        document.getElementById("statsLoader").innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            İstatistikler yüklenirken bir hata oluştu.
          </div>
        `;
      });
  }
});

// JSON formatını düzenleyen yardımcı fonksiyon
function formatJSON(json) {
  try {
    const obj = JSON.parse(json);
    return formatJSONObject(obj, 0);
  } catch (e) {
    return `<span class="json-string">Error parsing JSON: ${e.message}</span>`;
  }
}

function formatJSONObject(obj, level) {
  if (obj === null) return '<span class="json-null">null</span>';

  if (typeof obj === "object") {
    const isArray = Array.isArray(obj);
    const isEmpty = Object.keys(obj).length === 0;
    if (isEmpty) {
      return isArray ? '<span class="json-mark">[]</span>' : '<span class="json-mark">{}</span>';
    }

    const indent = "  ".repeat(level);
    const nextIndent = "  ".repeat(level + 1);
    let result = isArray ? '<span class="json-mark">[</span>' : '<span class="json-mark">{</span>';

    if (level > 0) {
      result = `<span class="json-toggle"></span>${result}<div class="json-content">`;
    } else {
      result += '<div class="json-content">';
    }

    const entries = Object.entries(obj);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      const comma = i < entries.length - 1 ? '<span class="json-mark">,</span>' : "";

      result += "<div>";
      if (!isArray) {
        result += `<span class="json-key">"${key}"</span><span class="json-mark">: </span>`;
      }
      result += formatJSONValue(value, level + 1);
      result += comma + "</div>";
    }

    result += `</div>${indent}<span class="json-mark">${isArray ? "]" : "}"}</span>`;
    return result;
  }

  return formatJSONValue(obj, level);
}

function formatJSONValue(value, level) {
  if (value === null) return '<span class="json-null">null</span>';

  switch (typeof value) {
    case "string":
      return `<span class="json-string">"${value}"</span>`;
    case "number":
      return `<span class="json-number">${value}</span>`;
    case "boolean":
      return `<span class="json-boolean">${value}</span>`;
    case "object":
      return formatJSONObject(value, level);
    default:
      return `<span>${value}</span>`;
  }
}

// Döviz kuru ve kredi fiyatı verilerini yükleme fonksiyonu
function loadCurrencyData() {
  // Döviz kurunu doviz.dev API'sinden çek
  fetch("https://doviz.dev/v1/usd.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Döviz kuru alınamadı");
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.USDTRY) {
        // TRY değerini göster
        const usdToTryElement = document.getElementById("usdToTry");
        usdToTryElement.textContent = `${data.USDTRY.toFixed(2)} ₺`;

        // USD/TRY değerini global değişkene ata (hesaplamada kullanmak için)
        window.exchangeRate = data.USDTRY;
      } else {
        document.getElementById("usdToTry").textContent = "Veri bulunamadı";
      }
    })
    .catch((error) => {
      console.error("Döviz kuru getirme hatası:", error);
      document.getElementById("usdToTry").textContent = "Hata oluştu";
    });

  // Kredi fiyatını veritabanından çek
  fetch("/admin/pricing")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Fiyat bilgisi alınamadı");
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.credit_price) {
        // Kredi fiyatını göster (USD cinsinden)
        const creditPriceElement = document.getElementById("creditPriceDisplay");
        const creditPriceValue = parseFloat(data.credit_price);
        window.creditPrice = creditPriceValue; // Global değişkene ata
        creditPriceElement.textContent = `${creditPriceValue.toFixed(2)} $`;
      } else {
        document.getElementById("creditPriceDisplay").textContent = "Veri bulunamadı";
      }
    })
    .catch((error) => {
      console.error("Kredi fiyatı getirme hatası:", error);
      document.getElementById("creditPriceDisplay").textContent = "Hata oluştu";
    });
}

// Kredi hesaplama fonksiyonu
function calculateCredits() {
  // Form değerlerini al
  const amount = parseFloat(document.getElementById("amount").value);
  const currency = document.getElementById("currency").value;

  // Sonuç alanını al
  const resultElement = document.getElementById("calculationResult");

  // Değerlerin varlığını kontrol et
  if (isNaN(amount) || amount <= 0) {
    resultElement.className = "alert alert-danger";
    resultElement.textContent = "Lütfen geçerli bir tutar giriniz.";
    return;
  }

  if (!window.exchangeRate || !window.creditPrice) {
    resultElement.className = "alert alert-warning";
    resultElement.textContent = "Döviz kuru veya kredi fiyatı henüz yüklenmedi. Lütfen sayfayı yenileyip tekrar deneyin.";
    return;
  }

  // Hesaplama yap
  let usdAmount, tryAmount, creditAmount;

  if (currency === "TRY") {
    // TL'yi dolara çevir
    usdAmount = amount / window.exchangeRate;
    tryAmount = amount;
  } else {
    // USD değerini doğrudan kullan
    usdAmount = amount;
    tryAmount = amount * window.exchangeRate;
  }

  // Kredi miktarını hesapla (USD değeri / kredi fiyatı)
  creditAmount = usdAmount / window.creditPrice;

  // Sonuçları göster
  resultElement.className = "alert alert-success";
  resultElement.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <strong>Girilen Tutar:</strong> ${amount.toFixed(2)} ${currency === "TRY" ? "₺" : "$"}<br>
        <strong>USD Karşılığı:</strong> ${usdAmount.toFixed(2)} $<br>
        <strong>TRY Karşılığı:</strong> ${tryAmount.toFixed(2)} ₺
      </div>
      <div class="col-md-6">
        <strong>Kredi Değeri:</strong> ${window.creditPrice.toFixed(2)} $ / kredi<br>
        <strong>Kredi Miktarı:</strong> <span class="badge bg-primary p-2">${Math.round(creditAmount)} kredi</span>
      </div>
    </div>
  `;
}
