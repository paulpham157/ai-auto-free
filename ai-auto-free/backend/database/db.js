const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs, query, where, limit, runTransaction, startAfter } = require("firebase/firestore");
const { getDatabase, ref, set, get, update, remove, child } = require("firebase/database");
const crypto = require("crypto");

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyA4AMZjnWDp0BYKQSRTXxIwuun3Jnz9wy0",
  authDomain: "ai-auto-free.firebaseapp.com",
  databaseURL: "https://ai-auto-free-default-rtdb.firebaseio.com",
  projectId: "ai-auto-free",
  storageBucket: "ai-auto-free.firebasestorage.app",
  messagingSenderId: "752171831108",
  appId: "1:752171831108:web:f331271904290799861111",
};

class Database {
  constructor() {
    // Firebase uygulamasını başlat
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
    this.rtdb = getDatabase(app);
    console.log("Firebase Firestore ve Realtime Database'e bağlandı");
  }

  // Kullanıcı işlemleri - Realtime Database
  async getUserByUuid(uuid) {
    try {
      const userRef = ref(this.rtdb, `users/${uuid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error("Kullanıcı getirme hatası:", error);
      throw error;
    }
  }

  async createUser(uuid, credits = 0) {
    try {
      // free_credits değerini kontrol et
      const freeCreditsRef = ref(this.rtdb, "free_credits");
      const freeCreditsSnapshot = await get(freeCreditsRef);

      let userCredits = credits;

      // Eğer free_credits varsa ve 0'dan büyükse krediyi 1 yap ve free_credits'i azalt
      if (freeCreditsSnapshot.exists()) {
        // Free credits değerini doğru şekilde al, farklı yapıları kontrol et
        let freeCredits = 0;
        const freeCreditsValue = freeCreditsSnapshot.val();

        if (typeof freeCreditsValue === "object" && freeCreditsValue !== null) {
          // {value: X} formatı
          if ("value" in freeCreditsValue) {
            freeCredits = freeCreditsValue.value;
          }
        } else if (typeof freeCreditsValue === "number") {
          // Doğrudan sayı
          freeCredits = freeCreditsValue;
        } else {
          // Diğer formatlar
          freeCredits = parseInt(freeCreditsValue) || 0;
        }

        if (freeCredits > 0) {
          userCredits = 1;
          // free_credits değerini bir azalt
          await set(freeCreditsRef, { value: freeCredits - 1 });
        }
      } else {
        // free_credits nesnesi yoksa oluştur
        await set(freeCreditsRef, { value: 0 });
      }

      const userRef = ref(this.rtdb, `users/${uuid}`);
      await set(userRef, {
        uuid,
        credits: userCredits,
      });
    } catch (error) {
      console.error("Kullanıcı oluşturma hatası:", error);
      throw error;
    }
  }

  async updateUserCredits(uuid, credits) {
    try {
      // NaN veya geçersiz değer kontrolü
      if (isNaN(credits) || typeof credits !== "number") {
        throw new Error(`Invalid credit value: ${credits}`);
      }

      // Kredinin tam sayı olduğundan emin olalım
      const safeCredits = Math.floor(credits);

      const userRef = ref(this.rtdb, `users/${uuid}`);
      await update(userRef, { credits: safeCredits });
    } catch (error) {
      console.error("Kullanıcı kredisi güncelleme hatası:", error);
      throw error;
    }
  }

  // Kullanıcı cihaz bilgilerini günceller
  async updateUserDeviceInfo(uuid, deviceInfo) {
    try {
      const userRef = ref(this.rtdb, `users/${uuid}`);

      // Kullanıcı verilerini al
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();

        // Cihaz bilgilerini güncelle, mevcut devices dizisi yoksa oluştur
        let devices = userData.devices || [];

        // Cihaz ID'sine göre eşleşen bir cihaz var mı kontrol et
        const existingDeviceIndex = devices.findIndex((d) => d.deviceId === deviceInfo.deviceId);

        if (existingDeviceIndex >= 0) {
          // Mevcut cihazı güncelle
          devices[existingDeviceIndex] = {
            ...devices[existingDeviceIndex],
            ...deviceInfo,
            lastSeen: new Date().toISOString(),
          };
        } else {
          // Yeni cihaz ekle
          devices.push({
            ...deviceInfo,
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
          });
        }

        // Kullanıcı verisini güncelle
        await update(userRef, {
          devices,
          lastDeviceInfo: deviceInfo,
          lastActive: new Date().toISOString(),
        });

        return devices;
      }
      return null;
    } catch (error) {
      console.error("Kullanıcı cihaz bilgisi güncelleme hatası:", error);
      throw error;
    }
  }

  // Bildirim işlemleri - Realtime Database
  async getNotifications() {
    try {
      const notificationsRef = ref(this.rtdb, "notifications");
      const snapshot = await get(notificationsRef);

      if (snapshot.exists()) {
        return snapshot.val();
      }
      return [];
    } catch (error) {
      console.error("Bildirimleri getirme hatası:", error);
      throw error;
    }
  }

  async addNotification(notification) {
    try {
      const notificationsRef = ref(this.rtdb, "notifications");
      const snapshot = await get(notificationsRef);

      let notifications = [];
      if (snapshot.exists()) {
        notifications = snapshot.val();
      }

      // Yeni bildirim ID'si oluştur
      const newId = Math.floor(Math.random() * 1000000) + 1; // Rastgele bir ID oluştur (1 ile 1000000 arasında)
      notification.id = newId;

      notifications.push(notification);
      await set(notificationsRef, notifications);

      return notification;
    } catch (error) {
      console.error("Bildirim ekleme hatası:", error);
      throw error;
    }
  }

  async updateNotification(id, updatedNotification) {
    try {
      const notificationsRef = ref(this.rtdb, "notifications");
      const snapshot = await get(notificationsRef);

      if (!snapshot.exists()) {
        throw new Error("Bildirimler bulunamadı");
      }

      let notifications = snapshot.val();
      const index = notifications.findIndex((n) => n.id === id);

      if (index === -1) {
        throw new Error("Bildirim bulunamadı");
      }

      notifications[index] = { ...notifications[index], ...updatedNotification, id };
      await set(notificationsRef, notifications);

      return notifications[index];
    } catch (error) {
      console.error("Bildirim güncelleme hatası:", error);
      throw error;
    }
  }

  async deleteNotification(id) {
    try {
      const notificationsRef = ref(this.rtdb, "notifications");
      const snapshot = await get(notificationsRef);

      if (!snapshot.exists()) {
        throw new Error("Bildirimler bulunamadı");
      }

      let notifications = snapshot.val();
      const filteredNotifications = notifications.filter((n) => n.id !== id);

      if (filteredNotifications.length === notifications.length) {
        throw new Error("Bildirim bulunamadı");
      }

      await set(notificationsRef, filteredNotifications);
    } catch (error) {
      console.error("Bildirim silme hatası:", error);
      throw error;
    }
  }

  // Servis bilgilerini getir - Realtime Database
  async getServices() {
    try {
      const servicesRef = ref(this.rtdb, "services");
      const snapshot = await get(servicesRef);

      if (snapshot.exists()) {
        return snapshot.val();
      }
    } catch (error) {
      console.error("Servis bilgilerini getirme hatası:", error);
      throw error;
    }
  }

  async updateServices(services) {
    try {
      const servicesRef = ref(this.rtdb, "services");
      await set(servicesRef, services);
      return services;
    } catch (error) {
      console.error("Servis bilgilerini güncelleme hatası:", error);
      throw error;
    }
  }

  // Fiyatlandırma bilgilerini getir - Realtime Database
  async getPricing() {
    try {
      const pricingRef = ref(this.rtdb, "pricing");
      const snapshot = await get(pricingRef);

      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error("Fiyatlandırma bilgilerini getirme hatası:", error);
      throw error;
    }
  }

  async updatePricing(pricing) {
    try {
      const pricingRef = ref(this.rtdb, "pricing");
      await set(pricingRef, pricing);
      return pricing;
    } catch (error) {
      console.error("Fiyatlandırma bilgilerini güncelleme hatası:", error);
      throw error;
    }
  }

  // Güncelleme bilgilerini getir - Realtime Database
  async getCheckUpdate() {
    try {
      const checkUpdateRef = ref(this.rtdb, "check_update");
      const snapshot = await get(checkUpdateRef);

      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error("Güncelleme bilgilerini getirme hatası:", error);
      throw error;
    }
  }

  async updateCheckUpdate(checkUpdate) {
    try {
      const checkUpdateRef = ref(this.rtdb, "check_update");
      await set(checkUpdateRef, checkUpdate);
      return checkUpdate;
    } catch (error) {
      console.error("Güncelleme bilgilerini güncelleme hatası:", error);
      throw error;
    }
  }

  // Hesap işlemleri - Firestore
  async addAccount(uuid, featureName, data = null) {
    try {
      if (featureName == "patch_cursor") return;

      const accountData = {
        uuid,
        featureName,
        data: data ? JSON.stringify(data) : null,
        created_at: new Date().toISOString(),
      };

      // Kullanıcının hesaplar koleksiyonuna ekle
      const userAccountsRef = doc(this.db, "userAccounts", uuid);
      const userAccountsDoc = await getDoc(userAccountsRef);

      if (userAccountsDoc.exists()) {
        // Mevcut hesaplar listesine ekle
        await updateDoc(userAccountsRef, {
          accounts: arrayUnion(accountData),
        });
      } else {
        // Yeni hesaplar listesi oluştur
        await setDoc(userAccountsRef, {
          accounts: [accountData],
        });
      }
    } catch (error) {
      console.error("Hesap ekleme hatası:", error);
      throw error;
    }
  }

  async getAccount(uuid) {
    try {
      const userAccountsRef = doc(this.db, "userAccounts", uuid);

      // Doğrudan belgeyi al, varsa ilk hesabı döndür
      const userAccountsDoc = await getDoc(userAccountsRef);

      if (!userAccountsDoc.exists()) {
        return null;
      }

      const accounts = userAccountsDoc.data().accounts || [];
      if (accounts.length === 0) {
        return null;
      }

      // İlk hesabı al ve data alanını parse et
      const account = accounts[0];
      if (account.data && typeof account.data === "string") {
        try {
          account.data = JSON.parse(account.data);
        } catch (e) {
          console.error("Hesap verisi JSON olarak parse edilemedi:", e);
        }
      }

      return account;
    } catch (error) {
      console.error("Hesap getirme hatası:", error);
      throw error;
    }
  }

  async getAccountsByFeature(featureName) {
    try {
      const accountsCollection = collection(this.db, "userAccounts");
      const accounts = [];

      // Batch işlemi ile daha az okuma yaparak verileri çekelim
      const batchSize = 100; // Firebase'in batch limit sınırı
      let lastDoc = null;
      let moreDocsExist = true;

      while (moreDocsExist) {
        let q;
        if (lastDoc) {
          q = query(accountsCollection, limit(batchSize), startAfter(lastDoc));
        } else {
          q = query(accountsCollection, limit(batchSize));
        }

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          moreDocsExist = false;
          continue;
        }

        lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

        querySnapshot.forEach((doc) => {
          const userAccounts = doc.data().accounts || [];
          const filteredAccounts = userAccounts.filter((account) => account.featureName === featureName);

          filteredAccounts.forEach((account) => {
            if (account.data) {
              account.data = JSON.parse(account.data);
            }
            accounts.push(account);
          });
        });

        // Eğer dönen belge sayısı batch size'dan azsa, daha fazla belge yoktur
        if (querySnapshot.docs.length < batchSize) {
          moreDocsExist = false;
        }
      }

      return accounts;
    } catch (error) {
      console.error("Feature hesaplarını getirme hatası:", error);
      throw error;
    }
  }

  // Havuz hesapları işlemleri - Firestore
  async getPoolAccounts() {
    try {
      const poolAccountsRef = doc(this.db, "accounts", "pool");
      const poolAccountsDoc = await getDoc(poolAccountsRef);

      if (poolAccountsDoc.exists()) {
        return poolAccountsDoc.data().accounts || [];
      }
      return [];
    } catch (error) {
      console.error("Havuz hesaplarını getirme hatası:", error);
      throw error;
    }
  }

  async addPoolAccount(id, token, email, password, featureKey, apiKey = null, refreshToken = null) {
    try {
      const poolAccountsRef = doc(this.db, "accounts", "pool");

      // Önce mevcut hesapları al
      const poolAccountsDoc = await getDoc(poolAccountsRef);
      let accounts = [];

      if (poolAccountsDoc.exists()) {
        accounts = poolAccountsDoc.data().accounts || [];

        // Aynı email ve featureKey kombinasyonunu kontrol et
        const existingAccount = accounts.find((acc) => acc.email === email && acc.featureKey === featureKey);
        if (existingAccount) {
          throw new Error(`${email} email adresi ${featureKey} özelliği için zaten mevcut.`);
        }
      }

      const newAccount = {
        token,
        email,
        password,
        featureKey,
        created_at: new Date().toISOString(),
      };

      // apiKey ve refreshToken varsa ekle
      if (apiKey) newAccount.apiKey = apiKey;
      if (refreshToken) newAccount.refreshToken = refreshToken;

      // Doğrudan arrayUnion kullanarak hesabı ekle
      // Koleksiyon yoksa otomatik olarak oluşturulacak
      await updateDoc(poolAccountsRef, {
        accounts: arrayUnion(newAccount),
      }).catch(async (error) => {
        // Koleksiyon yoksa oluştur
        if (error.code === "not-found") {
          await setDoc(poolAccountsRef, {
            accounts: [newAccount],
          });
        } else {
          throw error;
        }
      });
    } catch (error) {
      console.error("Havuz hesabı ekleme hatası:", error);
      throw error;
    }
  }

  // Toplu hesap ekleme fonksiyonu - Tek işlemde birden fazla hesabı ekler
  async addMultiplePoolAccounts(newAccounts) {
    try {
      const poolAccountsRef = doc(this.db, "accounts", "pool");

      // Mevcut havuz hesaplarını al
      const poolAccountsDoc = await getDoc(poolAccountsRef);
      let accounts = [];

      if (poolAccountsDoc.exists()) {
        accounts = poolAccountsDoc.data().accounts || [];
      }

      // Yeni hesaplar için çakışma kontrolü yap
      const timestamp = new Date().toISOString();
      const formattedNewAccounts = [];
      const duplicateAccounts = [];

      for (const account of newAccounts) {
        // Aynı email ve featureKey kombinasyonunu kontrol et
        const existingAccount = accounts.find((acc) => acc.email === account.email && acc.featureKey === account.featureKey);

        if (existingAccount) {
          duplicateAccounts.push(account.email);
          continue;
        }

        formattedNewAccounts.push({
          token: account.token || "",
          email: account.email,
          password: account.password,
          featureKey: account.featureKey,
          ...(account.apiKey && { apiKey: account.apiKey }),
          ...(account.refreshToken && { refreshToken: account.refreshToken }),
          created_at: timestamp,
        });
      }

      // Çakışma var mı kontrol et
      if (duplicateAccounts.length > 0) {
        throw new Error(`Aşağıdaki hesaplar belirtilen özellikler için zaten mevcut: ${duplicateAccounts.join(", ")}`);
      }

      // Mevcut ve yeni hesapları birleştir
      const updatedAccounts = [...accounts, ...formattedNewAccounts];

      // Tek seferde tüm listeyi güncelle
      if (poolAccountsDoc.exists()) {
        await updateDoc(poolAccountsRef, { accounts: updatedAccounts });
      } else {
        await setDoc(poolAccountsRef, { accounts: updatedAccounts });
      }

      return formattedNewAccounts.length; // Eklenen hesap sayısını döndür
    } catch (error) {
      console.error("Toplu havuz hesabı ekleme hatası:", error);
      throw error;
    }
  }

  async updatePoolAccount(id, token, email, password, featureKey, apiKey = null, refreshToken = null) {
    try {
      const poolAccountsRef = doc(this.db, "accounts", "pool");

      // Transaction kullanarak atomik bir güncelleme yap
      await runTransaction(this.db, async (transaction) => {
        const poolAccountsDoc = await transaction.get(poolAccountsRef);

        if (!poolAccountsDoc.exists()) {
          throw new Error("Havuz hesapları bulunamadı");
        }

        const accounts = poolAccountsDoc.data().accounts || [];

        // Güncellenecek hesabı bul
        const accountToUpdate = accounts.find((acc) => acc.email === id && acc.featureKey === featureKey);

        if (!accountToUpdate) {
          throw new Error(`${id} email adresi ve ${featureKey} özelliğine sahip hesap bulunamadı`);
        }

        // İsim değişikliği yapılıyorsa, aynı email-featureKey kombinasyonu var mı kontrol et
        if (email !== id) {
          const existingAccount = accounts.find((acc) => acc.email === email && acc.featureKey === featureKey);
          if (existingAccount) {
            throw new Error(`${email} email adresi ${featureKey} özelliği için zaten mevcut.`);
          }
        }

        // Güncellenmiş hesap bilgileri
        const updatedAccount = {
          token,
          email,
          password,
          featureKey: featureKey,
          created_at: accountToUpdate.created_at, // Orijinal oluşturma tarihini koru
          updated_at: new Date().toISOString(), // Güncelleme tarihini ekle
        };

        // apiKey ve refreshToken varsa ekle
        if (apiKey) updatedAccount.apiKey = apiKey;
        if (refreshToken) updatedAccount.refreshToken = refreshToken;

        // Güncellenecek hesabı çıkar, diğerlerini tut
        const updatedAccounts = accounts.filter((acc) => !(acc.email === id && acc.featureKey === featureKey));
        updatedAccounts.push(updatedAccount);

        // Tüm listeyi güncelle
        transaction.update(poolAccountsRef, { accounts: updatedAccounts });
      });
    } catch (error) {
      console.error("Havuz hesabı güncelleme hatası:", error);
      throw error;
    }
  }

  async deletePoolAccount(id, featureName = null) {
    try {
      const poolAccountsRef = doc(this.db, "accounts", "pool");

      // Transaction kullanarak atomik bir silme işlemi yap
      await runTransaction(this.db, async (transaction) => {
        const poolAccountsDoc = await transaction.get(poolAccountsRef);

        if (!poolAccountsDoc.exists()) {
          throw new Error("Havuz hesapları bulunamadı");
        }

        const accounts = poolAccountsDoc.data().accounts || [];

        // id parametresi email adresini temsil eder
        // Artık her zaman hem email hem featureKey kullanarak hesap buluyoruz
        // featureName zorunlu olmak zorunda
        if (!featureName) {
          throw new Error("FeatureKey/FeatureName belirtilmek zorundadır");
        }

        // Hesabı bul - hem email hem featureName'e göre
        const accountToDelete = accounts.find((acc) => acc.email === id && acc.featureKey === featureName);

        if (!accountToDelete) {
          throw new Error(`${id} email adresi ve ${featureName} özelliğine sahip hesap bulunamadı`);
        }

        // Hesabı filtrele - hem email hem featureName'e göre
        const updatedAccounts = accounts.filter((acc) => !(acc.email === id && acc.featureKey === featureName));

        // Tüm listeyi güncelle
        transaction.update(poolAccountsRef, { accounts: updatedAccounts });
      });
    } catch (error) {
      console.error("Havuz hesabı silme hatası:", error);
      throw error;
    }
  }

  async getPoolAccountsByFeature(featureKey) {
    try {
      const poolAccountsRef = doc(this.db, "accounts", "pool");
      const poolAccountsDoc = await getDoc(poolAccountsRef);

      if (poolAccountsDoc.exists()) {
        const accounts = poolAccountsDoc.data().accounts || [];
        return accounts.filter((account) => account.featureKey === featureKey);
      }
      return [];
    } catch (error) {
      console.error("Feature hesaplarını getirme hatası:", error);
      throw error;
    }
  }

  // Belirli bir feature için tek bir hesap getir
  async getSinglePoolAccountByFeature(featureKey) {
    try {
      const poolAccountsRef = doc(this.db, "accounts", "pool");
      const poolAccountsDoc = await getDoc(poolAccountsRef);

      if (!poolAccountsDoc.exists()) {
        return null;
      }

      const accounts = poolAccountsDoc.data().accounts || [];

      // Hesapları featureKey'e göre filtrele - TAM EŞLEŞME aranıyor
      const filteredAccounts = accounts.filter((account) => account.featureKey === featureKey);

      // Hiç hesap yoksa null döndür
      if (filteredAccounts.length === 0) {
        return null;
      }

      // İlk eklenen hesabı döndür
      return filteredAccounts[0];
    } catch (error) {
      console.error("Feature hesabı getirme hatası:", error);
      throw error;
    }
  }

  // Havuzdaki her feature için hesap sayısını getir
  async getPoolAccountsCountByFeature() {
    try {
      const poolAccountsRef = doc(this.db, "accounts", "pool");
      const poolAccountsDoc = await getDoc(poolAccountsRef);

      if (!poolAccountsDoc.exists()) {
        return {};
      }

      const accounts = poolAccountsDoc.data().accounts || [];
      const featureCounts = {};

      // Her hesabın feature'ını kontrol et ve sayıları topla
      accounts.forEach((account) => {
        const featureKey = account.featureKey;
        if (!featureCounts[featureKey]) {
          featureCounts[featureKey] = 0;
        }
        featureCounts[featureKey]++;
      });

      return featureCounts;
    } catch (error) {
      console.error("Feature hesap sayılarını getirme hatası:", error);
      throw error;
    }
  }

  // Belirli bir özelliğe sahip tüm hesapları toplu olarak sil
  async deletePoolAccountsByFeature(featureKey) {
    try {
      const poolAccountsRef = doc(this.db, "accounts", "pool");

      // Transaction kullanarak atomik bir silme işlemi yap
      await runTransaction(this.db, async (transaction) => {
        const poolAccountsDoc = await transaction.get(poolAccountsRef);

        if (!poolAccountsDoc.exists()) {
          throw new Error("Havuz hesapları bulunamadı");
        }

        const accounts = poolAccountsDoc.data().accounts || [];

        // Belirtilen özelliğe sahip olmayan hesapları filtrele (yani belirtilen özelliğe sahip olanları çıkar)
        const updatedAccounts = accounts.filter((acc) => acc.featureKey !== featureKey);

        // Silinen hesap sayısını hesapla
        const deletedCount = accounts.length - updatedAccounts.length;

        if (deletedCount === 0) {
          throw new Error(`${featureKey} özelliğine sahip hesap bulunamadı`);
        }

        // Tüm listeyi güncelle
        transaction.update(poolAccountsRef, { accounts: updatedAccounts });

        return deletedCount;
      });
    } catch (error) {
      console.error(`${featureKey} özelliğine sahip hesapları toplu silme hatası:`, error);
      throw error;
    }
  }

  async getActiveAccounts() {
    try {
      const activeAccountsRef = doc(this.db, "accounts", "active");
      const activeAccountsDoc = await getDoc(activeAccountsRef);

      if (activeAccountsDoc.exists()) {
        return activeAccountsDoc.data().accounts || [];
      }
      return [];
    } catch (error) {
      console.error("Aktif hesapları getirme hatası:", error);
      throw error;
    }
  }

  async assignAccountToUser(userId, accountOrId, expectedFeatureKey = null) {
    try {
      // Havuz hesaplarını al
      const poolAccountsRef = doc(this.db, "accounts", "pool");
      const poolAccountsDoc = await getDoc(poolAccountsRef);

      if (!poolAccountsDoc.exists()) {
        throw new Error("No pool accounts found");
      }

      const poolAccounts = poolAccountsDoc.data().accounts || [];

      let accountToAssign;

      // Eğer doğrudan hesap nesnesi verilmişse, onu kullan
      if (typeof accountOrId === "object" && accountOrId !== null) {
        accountToAssign = accountOrId;
      } else {
        // String bir ID verilmişse, hesabı bul (geriye dönük uyumluluk için)
        const accountId = accountOrId;
        accountToAssign = poolAccounts.find((acc) => (acc.email === accountId || acc.token === accountId) && (!expectedFeatureKey || acc.featureKey === expectedFeatureKey));
      }

      if (!accountToAssign) {
        throw new Error("No account found");
      }

      // Aktif hesaplara eklenecek hesap
      const activeAccount = {
        ...accountToAssign,
        userId,
        assigned_at: new Date().toISOString(),
      };

      // Havuzdan hesabı çıkar - aynı email VE aynı featureKey'e sahip olan hesabı çıkar
      const updatedPoolAccounts = poolAccounts.filter((acc) => !(acc.email === accountToAssign.email && acc.featureKey === accountToAssign.featureKey));
      await updateDoc(poolAccountsRef, { accounts: updatedPoolAccounts });

      // Aktif hesapları al ve güncelle
      const activeAccountsRef = doc(this.db, "accounts", "active");
      const activeAccountsDoc = await getDoc(activeAccountsRef);

      if (activeAccountsDoc.exists()) {
        const activeAccounts = activeAccountsDoc.data().accounts || [];
        activeAccounts.push(activeAccount);
        await updateDoc(activeAccountsRef, { accounts: activeAccounts });
      } else {
        await setDoc(activeAccountsRef, { accounts: [activeAccount] });
      }

      return activeAccount; // Şifre dahil tüm hesap bilgilerini döndür
    } catch (error) {
      console.error("Hesap atama hatası:", error);
      throw error;
    }
  }

  async releaseAccount(accountId) {
    try {
      // Aktif hesapları al
      const activeAccountsRef = doc(this.db, "accounts", "active");
      const activeAccountsDoc = await getDoc(activeAccountsRef);

      if (!activeAccountsDoc.exists()) {
        throw new Error("Aktif hesaplar bulunamadı");
      }

      const activeAccounts = activeAccountsDoc.data().accounts || [];
      // Email veya token ile hesabı bul
      const accountToRelease = activeAccounts.find((acc) => acc.email === accountId || acc.token === accountId);

      if (!accountToRelease) {
        throw new Error("Aktif hesap bulunamadı");
      }

      // Hesabı aktif hesaplardan kaldır
      await updateDoc(activeAccountsRef, {
        accounts: arrayRemove(accountToRelease),
      });

      // Havuza geri eklemeden önce aynı email ve featureKey kombinasyonuyla hesap var mı kontrol et
      const poolAccountsRef = doc(this.db, "accounts", "pool");
      const poolAccountsDoc = await getDoc(poolAccountsRef);

      let existingAccount = null;
      if (poolAccountsDoc.exists()) {
        const poolAccounts = poolAccountsDoc.data().accounts || [];
        existingAccount = poolAccounts.find((acc) => acc.email === accountToRelease.email && acc.featureKey === accountToRelease.featureKey);
      }

      // Eğer aynı email ve featureKey kombinasyonuyla hesap varsa, işlemi iptal et
      if (existingAccount) {
        throw new Error(`Havuzda zaten ${accountToRelease.email} email adresi ve ${accountToRelease.featureKey} özelliği için bir hesap mevcut.`);
      }

      // Havuza geri ekle
      const poolAccount = {
        token: accountToRelease.token,
        email: accountToRelease.email,
        password: accountToRelease.password,
        featureKey: accountToRelease.featureKey,
        created_at: accountToRelease.created_at,
      };

      // Windsurf hesapları için apiKey ve refreshToken bilgilerini de ekle
      if (accountToRelease.apiKey) {
        poolAccount.apiKey = accountToRelease.apiKey;
      }

      if (accountToRelease.refreshToken) {
        poolAccount.refreshToken = accountToRelease.refreshToken;
      }

      if (poolAccountsDoc.exists()) {
        await updateDoc(poolAccountsRef, {
          accounts: arrayUnion(poolAccount),
        });
      } else {
        await setDoc(poolAccountsRef, {
          accounts: [poolAccount],
        });
      }
    } catch (error) {
      console.error("Hesap serbest bırakma hatası:", error);
      throw error;
    }
  }

  async getPoolAccountsByFeature(featureKey) {
    try {
      const poolAccountsRef = doc(this.db, "accounts", "pool");
      const poolAccountsDoc = await getDoc(poolAccountsRef);

      if (poolAccountsDoc.exists()) {
        const accounts = poolAccountsDoc.data().accounts || [];
        return accounts.filter((account) => account.featureKey === featureKey);
      }
      return [];
    } catch (error) {
      console.error("Feature hesaplarını getirme hatası:", error);
      throw error;
    }
  }

  // Belirli bir feature için tek bir hesap getir
  async getSinglePoolAccountByFeature(featureKey) {
    try {
      const poolAccountsRef = doc(this.db, "accounts", "pool");
      const poolAccountsDoc = await getDoc(poolAccountsRef);

      if (!poolAccountsDoc.exists()) {
        return null;
      }

      const accounts = poolAccountsDoc.data().accounts || [];

      // Hesapları featureKey'e göre filtrele
      const filteredAccounts = accounts.filter((account) => account.featureKey === featureKey);

      // Hiç hesap yoksa null döndür
      if (filteredAccounts.length === 0) {
        return null;
      }

      // Hesapları created_at tarihine göre sırala (en eski tarih ilk sırada olacak)
      filteredAccounts.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateA - dateB; // Küçükten büyüğe sıralama (en eski tarih ilk sırada)
      });

      // En eski tarihe sahip hesabı döndür
      return filteredAccounts[0];
    } catch (error) {
      console.error("Feature hesabı getirme hatası:", error);
      throw error;
    }
  }

  // Havuzdaki her feature için hesap sayısını getir
  async getPoolAccountsCountByFeature() {
    try {
      const poolAccountsRef = doc(this.db, "accounts", "pool");
      const poolAccountsDoc = await getDoc(poolAccountsRef);

      if (!poolAccountsDoc.exists()) {
        return {};
      }

      const accounts = poolAccountsDoc.data().accounts || [];
      const featureCounts = {};

      // Her hesabın feature'ını kontrol et ve sayıları topla
      accounts.forEach((account) => {
        const featureKey = account.featureKey;
        if (!featureCounts[featureKey]) {
          featureCounts[featureKey] = 0;
        }
        featureCounts[featureKey]++;
      });

      return featureCounts;
    } catch (error) {
      console.error("Feature hesap sayılarını getirme hatası:", error);
      throw error;
    }
  }

  // Banlı cihaz işlemleri - Firestore
  async getBannedDevice(deviceId, ipAddress) {
    try {
      // DeviceId veya ipAddress ile eşleşen banlı cihazları ara
      const bannedCollection = collection(this.db, "bannedDevices");

      // Sorgu oluştur: deviceId veya ipAddress eşleşen VE isActive true olan kayıtlar
      const q = query(bannedCollection, where("isActive", "==", true), where(deviceId ? "deviceId" : "ipAddress", "==", deviceId || macAddress));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // İlk eşleşen kaydı döndür
        return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
      }

      // deviceId ve ipAddress'i ayrı sorgularda da kontrol et
      if (deviceId && ipAddress) {
        const q2 = query(bannedCollection, where("isActive", "==", true), where("ipAddress", "==", ipAddress));

        const querySnapshot2 = await getDocs(q2);

        if (!querySnapshot2.empty) {
          return { id: querySnapshot2.docs[0].id, ...querySnapshot2.docs[0].data() };
        }
      }

      return null;
    } catch (error) {
      console.error("Banlı cihaz sorgulama hatası:", error);
      throw error;
    }
  }

  async addBannedDevice(deviceInfo, banReason) {
    try {
      const bannedCollection = collection(this.db, "bannedDevices");

      const bannedDevice = {
        deviceId: deviceInfo.deviceId,
        macAddress: deviceInfo.macAddress,
        hardwareFingerprint: `${deviceInfo.deviceId}_${deviceInfo.macAddress}`,
        ipAddress: deviceInfo.ipAddress,
        banReason,
        banDate: new Date().toISOString(),
        isActive: true,
        additionalInfo: deviceInfo.additionalInfo || {},
      };

      // Yeni bir ID oluştur
      const newDocRef = doc(bannedCollection);
      await setDoc(newDocRef, bannedDevice);

      return { id: newDocRef.id, ...bannedDevice };
    } catch (error) {
      console.error("Banlı cihaz ekleme hatası:", error);
      throw error;
    }
  }

  async updateBannedDevice(id, updates) {
    try {
      const deviceRef = doc(this.db, "bannedDevices", id);
      await updateDoc(deviceRef, updates);
      return true;
    } catch (error) {
      console.error("Banlı cihaz güncelleme hatası:", error);
      throw error;
    }
  }

  async removeBannedDevice(id) {
    try {
      const deviceRef = doc(this.db, "bannedDevices", id);
      // Tam silmek yerine isActive'i false yapıyoruz (soft delete)
      await updateDoc(deviceRef, { isActive: false });
      return true;
    } catch (error) {
      console.error("Banlı cihaz kaldırma hatası:", error);
      throw error;
    }
  }

  async getAllBannedDevices() {
    try {
      const bannedCollection = collection(this.db, "bannedDevices");
      const q = query(bannedCollection, where("isActive", "==", true));

      const querySnapshot = await getDocs(q);

      const devices = [];
      querySnapshot.forEach((doc) => {
        devices.push({ id: doc.id, ...doc.data() });
      });

      return devices;
    } catch (error) {
      console.error("Banlı cihaz listeleme hatası:", error);
      throw error;
    }
  }

  // Günlük kullanıcı giriş istatistiklerini kaydet - Realtime Database
  async incrementDailyLoginCount() {
    try {
      // Bugünün tarihini YYYY-MM-DD formatında al
      const today = new Date().toISOString().split("T")[0];

      // stats/daily_logins/YYYY-MM-DD yolunda veriyi güncelle
      const dailyLoginRef = ref(this.rtdb, `stats/daily_logins/${today}`);

      // Mevcut değeri oku
      const snapshot = await get(dailyLoginRef);

      if (snapshot.exists()) {
        // Eğer bugün için bir değer varsa, 1 artır
        const currentCount = snapshot.val();
        await set(dailyLoginRef, currentCount + 1);
        return currentCount + 1;
      } else {
        // Eğer bugün için bir değer yoksa, 1 olarak ayarla
        await set(dailyLoginRef, 1);
        return 1;
      }
    } catch (error) {
      console.error("Günlük giriş istatistiği kaydetme hatası:", error);
      // Hata olsa bile uygulamayı durdurmamak için hatayı yakalıyoruz
      return null;
    }
  }

  // Bugünün giriş sayısını getir - Realtime Database
  async getDailyLoginCount() {
    try {
      // Bugünün tarihini YYYY-MM-DD formatında al
      const today = new Date().toISOString().split("T")[0];

      // stats/daily_logins/YYYY-MM-DD yolundaki veriyi oku
      const dailyLoginRef = ref(this.rtdb, `stats/daily_logins/${today}`);
      const snapshot = await get(dailyLoginRef);

      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return 0;
      }
    } catch (error) {
      console.error("Günlük giriş sayısı getirme hatası:", error);
      return 0;
    }
  }

  // Gift Code İşlemleri - Realtime Database
  async createGiftCode(userId, credits) {
    try {
      // Kredinin geçerli bir sayı olduğunu kontrol et
      if (isNaN(credits) || typeof credits !== "number" || credits <= 0) {
        throw new Error(`Invalid credit value: ${credits}`);
      }

      // Tam sayı olarak kredi değerini al
      const safeCredits = Math.floor(credits);

      // XXXX-XXXX formatında rastgele bir kod oluştur
      const generateCode = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Karışıklık yaratacak karakterleri çıkardık
        let code = "";

        // İlk grup (XXXX)
        for (let i = 0; i < 4; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        code += "-";

        // İkinci grup (XXXX)
        for (let i = 0; i < 4; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return code;
      };

      // Benzersiz bir kod oluştur
      let giftCode = generateCode();

      // Kodu veritabanına kaydet
      const giftCodeRef = ref(this.rtdb, `giftCodes/${giftCode}`);
      await set(giftCodeRef, {
        credits: safeCredits,
        createdBy: userId, // Oluşturan kullanıcı ID'si
        createdAt: new Date().toISOString(),
      });

      return giftCode;
    } catch (error) {
      console.error("Gift code creation error:", error);
      throw error;
    }
  }

  async redeemGiftCode(code) {
    try {
      console.log("redeemGiftCode", code);
      // Kodu doğrula
      const giftCodeRef = ref(this.rtdb, `giftCodes/${code}`);
      const snapshot = await get(giftCodeRef);

      if (!snapshot.exists()) {
        throw new Error("Invalid gift code");
      }

      // Kod bilgilerini al
      const codeData = snapshot.val();

      // Kodu sil
      await remove(giftCodeRef);

      // Bir obje olarak döndür - credits ve createdBy bilgisini içerir
      return {
        credits: codeData.credits,
        createdBy: codeData.createdBy,
      };
    } catch (error) {
      console.error("Gift code redemption error:", error);
      throw error;
    }
  }
}

module.exports = new Database();
