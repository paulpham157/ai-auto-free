"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import { useSession } from "next-auth/react";
import { getUserByEmail, getAccountsByUserId, Account, AccountSetting, updateUserLastLogin, getUserPurchasesInLastHour } from "@/utils/supabase";
import ThemeToggle from "./components/ThemeToggle";
import UserMenu from "./components/UserMenu";
import { useTranslations } from "./utils/i18n";
import CreditCard from "./components/CreditCard";
import StripePaymentElement from "./components/StripePaymentElement";
import { compressToBase64 } from "./utils/compression";
import { decryptResponse } from "./utils/crypto";

/**
 * GZIP sıkıştırılmış yanıtları otomatik olarak işleyen hook
 * @param url API URL'i
 * @param options Fetch options
 * @returns {data, error, loading} durumu
 */
const useFetchCompressed = (url: string, options: RequestInit = {}) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    if (!url) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          "Accept-Encoding": "gzip", // GZIP yanıtları kabul edelim
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // API yanıtını alalım (fetch API GZIP yanıtlarını otomatik çözer)
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching compressed data:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  return { data, error, loading, fetchData };
};

export default function Home() {
  const [userCredit, setUserCredit] = useState<number>(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  const [accountTypes, setAccountTypes] = useState<AccountSetting[]>([]);
  const [purchaseLoading, setPurchaseLoading] = useState<boolean>(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [accountCounts, setAccountCounts] = useState<{ [key: string]: number }>({});
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isBanned, setIsBanned] = useState<boolean>(false); // Kullanıcının banlı olup olmadığını tutan state
  const { signout } = useAuth();
  const { data: session } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Kullanıcı resmi için state ekliyorum
  const [cachedUserImage, setCachedUserImage] = useState<string | null>(null);

  // Sayfalama için state'ler ekliyorum
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalAccounts, setTotalAccounts] = useState<number>(0);
  const [pageSize] = useState<number>(10); // Bir sayfada gösterilen hesap sayısı

  const [lastStatsUpdate, setLastStatsUpdate] = useState<number>(0);
  const STATS_REFRESH_INTERVAL = 60 * 1000; // 1 dakika (milisaniye cinsinden)
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const resetModalRef = useRef<HTMLDivElement>(null);
  const [showAddCreditsModal, setShowAddCreditsModal] = useState<boolean>(false);
  const addCreditsModalRef = useRef<HTMLDivElement>(null);

  // Eklenti diyaloğu için state ekleyelim
  const [showExtensionModal, setShowExtensionModal] = useState<boolean>(false);
  const extensionModalRef = useRef<HTMLDivElement>(null);

  const [selectedCreditPack, setSelectedCreditPack] = useState<number | null>(null);
  const [addingCredits, setAddingCredits] = useState<boolean>(false);
  const [addCreditsError, setAddCreditsError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Hediye kodu için state
  const [showGiftCodeModal, setShowGiftCodeModal] = useState<boolean>(false);
  const giftCodeModalRef = useRef<HTMLDivElement>(null);
  const [giftCode, setGiftCode] = useState<string>("");
  const [redeemingCode, setRedeemingCode] = useState<boolean>(false);
  const [giftCodeError, setGiftCodeError] = useState<string | null>(null);
  const [giftCodeSuccess, setGiftCodeSuccess] = useState<string | null>(null);

  const [copySuccess, setCopySuccess] = useState<{ id: string; message: string } | null>(null);

  // Saatlik satın alma limiti için state'ler
  const [hourlyPurchaseCount, setHourlyPurchaseCount] = useState<number>(0);
  const [lastPurchaseTime, setLastPurchaseTime] = useState<Date | null>(null);
  const HOURLY_PURCHASE_LIMIT = 5;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentCredits, setPaymentCredits] = useState<number>(0);
  const [paymentStep, setPaymentStep] = useState<"select" | "payment">("select");

  // Add translations
  const t = useTranslations();

  // Kullanıcı resmi için önbelleği yönet
  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan kullanıcı resmini al
    const savedImage = localStorage.getItem("userProfileImage");
    if (savedImage) {
      setCachedUserImage(savedImage);
    }

    // Session'dan gelen resim varsa ve cachedUserImage'dan farklıysa güncelle
    if (session?.user?.image && session.user.image !== cachedUserImage) {
      // Kullanıcı resmini önceden yükleyip kontrol edelim
      const img = new Image();
      img.onload = () => {
        // Resim başarıyla yüklendiyse cache'e kaydedelim
        if (session?.user?.image) {
          setCachedUserImage(session.user.image);
          localStorage.setItem("userProfileImage", session.user.image);
        }
      };
      img.onerror = () => {
        // Resim yüklenemezse varsayılan avatarı kullanalım
        console.warn("User profile image could not be loaded, using default avatar");
        setCachedUserImage("/avatar.png");
        localStorage.setItem("userProfileImage", "/avatar.png");
      };
      img.src = session.user.image;
    }
  }, [session?.user?.image, cachedUserImage]);

  const fetchUserData = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      setLoading(true);

      // Timestamp ve nonce oluştur (güvenlik için)
      const timestamp = Date.now().toString();
      const nonce = Math.random().toString(36).substring(2, 15);

      // Sıkıştırılacak parametreler
      const params = {
        page: currentPage,
        pageSize,
        t: timestamp, // timestamp'ı da parametrelere ekledik
      };

      // Parametreleri sıkıştır ve base64 kodla
      const compressedParams = await compressToBase64(JSON.stringify(params));

      // Tek bir API isteği ile tüm verileri al, URL parametreleri gizlenmiş olarak
      const response = await fetch(`/api/user-dashboard-data?data=${compressedParams}`, {
        headers: {
          "x-request-timestamp": timestamp,
          "x-request-nonce": nonce,
          "Accept-Encoding": "gzip", // GZIP yanıtları kabul edelim
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      // Şifrelenmiş yanıtı al
      const encryptedData = await response.json();

      // Yanıtı çöz
      const data = decryptResponse(encryptedData);

      // Kullanıcı bilgilerini güncelle
      setUserCredit(data.user.credit);
      setIsBanned(data.user.isBanned);

      // Hesapları güncelle
      setAccounts(data.accounts);
      setTotalAccounts(data.totalAccounts);

      // Saatlik alım sayısını güncelle
      setHourlyPurchaseCount(data.hourlyPurchaseCount);

      // Hesap tiplerini güncelle
      setAccountTypes(data.accountTypes);

      // Hesap sayılarını güncelle
      setAccountCounts(data.accountStats);

      // Admin durumunu güncelle
      setIsAdmin(data.isAdmin);

      setDataFetched(true);
    } catch (err) {
      setError("An error occurred while fetching user data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, currentPage, pageSize]);

  // Sayfa değiştiğinde verileri yeniden yükle
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    // Yeni sayfa için veri yüklemeyi tetikle
    setDataFetched(false);
  }, []);

  // Tek bir useEffect ile veri yüklemeyi yönet ve referans kararlılığı sorununu çöz
  useEffect(() => {
    // Veri henüz yüklenmemişse, yükle
    if (!dataFetched && session?.user?.email) {
      console.log("Fetching data with page:", currentPage); // Debug için
      fetchUserData();
    }
  }, [dataFetched, fetchUserData, session?.user?.email, currentPage]);

  // Sadece ihtiyaç duyulduğunda (dropdown açıldığında) hesap istatistiklerini güncellemek için bu useEffect'i koruyoruz
  useEffect(() => {
    if (isDropdownOpen && accountTypes.length > 0 && Date.now() - lastStatsUpdate > STATS_REFRESH_INTERVAL) {
      console.log("Updating account stats for dropdown");
      // Yeni ve basitleştirilmiş API çağrısı - doğrudan URL parametresi kullanarak
      fetch(`/api/user-dashboard-data?statsOnly=true`)
        .then((response) => response.json())
        .then((encryptedData) => {
          // Şifrelenmiş yanıtı çöz
          const data = decryptResponse(encryptedData);
          console.log("Received stats data:", data);
          if (data && data.accountStats) {
            setAccountCounts(data.accountStats);
            setLastStatsUpdate(Date.now());
          } else {
            console.error("Invalid statistics data received:", data);
          }
        })
        .catch((err) => {
          console.error("Error updating account stats:", err);
        });
    }
  }, [isDropdownOpen, accountTypes, lastStatsUpdate]);

  // Güvenli hesap sayısı getiren yardımcı fonksiyon
  const getAccountCount = useCallback(
    (accountType: string) => {
      if (!accountCounts || typeof accountCounts !== "object") {
        return 0;
      }
      return accountCounts[accountType] || 0;
    },
    [accountCounts]
  );

  // Hesap istatistiklerini acil yüklemek için ek fonksiyon
  const fetchAccountStatsImmediately = useCallback(async () => {
    try {
      console.log("Fetching account stats immediately");
      const response = await fetch(`/api/user-dashboard-data?statsOnly=true`);
      if (!response.ok) {
        throw new Error(`Stats fetch failed: ${response.status}`);
      }

      const encryptedData = await response.json();
      const data = decryptResponse(encryptedData);

      console.log("Immediate stats data:", data);
      if (data && data.accountStats) {
        setAccountCounts(data.accountStats);
        setLastStatsUpdate(Date.now());
        return data.accountStats;
      }
      return {};
    } catch (error) {
      console.error("Error fetching stats immediately:", error);
      return {};
    }
  }, []);

  // Hesap türü dropdown'ı açıldığında istatistikleri hemen yükle
  useEffect(() => {
    if (isDropdownOpen && (!accountCounts || Object.keys(accountCounts).length === 0)) {
      fetchAccountStatsImmediately();
    }
  }, [isDropdownOpen, accountCounts, fetchAccountStatsImmediately]);

  const handleAccountSelect = useCallback((account: Account) => {
    setSelectedAccount(account);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedAccount(null);
    setDeleteError(null);
  }, []);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(!isDropdownOpen);
  }, [isDropdownOpen]);

  const handleResetCursorTrial = useCallback(() => {
    setShowResetModal(true);
  }, []);

  const handleCloseResetModal = () => {
    setShowResetModal(false);
  };

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (resetModalRef.current && !resetModalRef.current.contains(event.target as Node)) {
        setShowResetModal(false);
      }
    };

    if (showResetModal) {
      document.addEventListener("mousedown", handleClickAway);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickAway);
    };
  }, [showResetModal]);

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (addCreditsModalRef.current && !addCreditsModalRef.current.contains(event.target as Node)) {
        setShowAddCreditsModal(false);
      }
    };

    if (showAddCreditsModal) {
      document.addEventListener("mousedown", handleClickAway);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickAway);
    };
  }, [showAddCreditsModal]);

  // Hediye kodu modalı için dışarı tıklama efekti
  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (giftCodeModalRef.current && !giftCodeModalRef.current.contains(event.target as Node)) {
        setShowGiftCodeModal(false);
      }
    };

    if (showGiftCodeModal) {
      document.addEventListener("mousedown", handleClickAway);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickAway);
    };
  }, [showGiftCodeModal]);

  // Eklenti modalı için dışarı tıklama efekti
  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (extensionModalRef.current && !extensionModalRef.current.contains(event.target as Node)) {
        setShowExtensionModal(false);
      }
    };

    if (showExtensionModal) {
      document.addEventListener("mousedown", handleClickAway);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickAway);
    };
  }, [showExtensionModal]);

  useEffect(() => {
    // Dropdown dışına tıklama olduğunda kapatma
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    // Event listener'ı ekle
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handlePurchaseAccount = useCallback(
    async (accountType: string) => {
      if (!session?.user?.email) {
        setPurchaseError("Please login to purchase an account");
        return;
      }

      try {
        setPurchaseLoading(true);
        setPurchaseError(null);

        // İstek öncesi en güncel hesap sayılarını alalım
        try {
          console.log("Checking latest account counts before purchase");
          await fetchAccountStatsImmediately();

          // Hesap tipini kontrol edip stok durumunu denetle
          const stockCount = getAccountCount(accountType);
          if (stockCount <= 0) {
            setPurchaseError(`Sorry, ${accountType} accounts are currently out of stock. Please try again later.`);
            return;
          }
        } catch (statsError) {
          console.error("Failed to refresh account stats before purchase:", statsError);
          // Hata olsa bile devam edelim, API kendi kontrollerini yapacak
        }

        // Saatlik limiti kontrol et
        if (hourlyPurchaseCount >= HOURLY_PURCHASE_LIMIT) {
          setPurchaseError(`You've reached the hourly purchase limit (${HOURLY_PURCHASE_LIMIT} accounts per hour). Please try again later.`);
          return;
        }

        // E-posta adresini debug için konsolda göster
        console.log("User email for purchase:", session.user.email);

        // E-posta adresini küçük harfe çevirerek ve boşlukları temizleyerek gönderelim
        const cleanEmail = session.user.email.toLowerCase().trim();

        const response = await fetch("/api/purchase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountType,
            userEmail: cleanEmail,
          }),
          credentials: "include", // Önemli: Cookie'lerin gönderilmesini sağlar
        });

        // 401 hatası alırsak, oturumun yenilenmesi için sayfayı yenile
        if (response.status === 401) {
          console.log("Session expired, refreshing...");
          setPurchaseError("Session expired. Please refresh the page and try again.");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          console.error("Purchase error:", data.error);
          setPurchaseError(data.error || "Failed to purchase account");

          // Hesap sayılarını yeniden güncelleyelim
          await fetchAccountStatsImmediately();
          return;
        }

        // Yeni hesabı ekleyelim ve krediyi güncelleyelim
        setAccounts((prevAccounts) => [data.account, ...prevAccounts]);

        // Hesap sayılarını yeniden kontrol et ve uygun olandan bir azalt
        setAccountCounts((prev) => {
          const newCounts = { ...prev };
          if (accountType in newCounts && newCounts[accountType] > 0) {
            newCounts[accountType]--;
          }
          return newCounts;
        });

        // Kullanıcı kredisini güncelleyelim
        if (data.account && accountTypes.length > 0) {
          const accountSetting = accountTypes.find((type) => type.type === accountType);
          if (accountSetting) {
            setUserCredit((prev) => prev - accountSetting.credit_cost);
          }
        }

        // Saatlik satın alma sayısını arttır ve son satın alma zamanını güncelle
        setHourlyPurchaseCount((prev) => prev + 1);
        setLastPurchaseTime(new Date());

        // Güncel verileri alma girişiminde bulun, hata olursa yukarıdaki hesaplamalar geçerli kalır
        try {
          // Kullanıcı kredisini güncellemek için kullanıcı verilerini tekrar çekelim
          const response = await fetch(`/api/user-dashboard-data?statsOnly=true`);
          if (response.ok) {
            const encryptedData = await response.json();
            const data = decryptResponse(encryptedData);

            if (data && data.accountStats) {
              setAccountCounts(data.accountStats);
            }
          }
        } catch (refreshError) {
          console.error("Error refreshing data after purchase:", refreshError);
          // Hata olsa bile işlem başarılı oldu, kullanıcıya gösterme
        }

        // Dropdown'ı kapatalım
        setIsDropdownOpen(false);
      } catch (err) {
        console.error("Error purchasing account:", err);
        setPurchaseError("An error occurred while purchasing the account");

        // Hesap sayılarını yeniden güncelleyelim
        await fetchAccountStatsImmediately();
      } finally {
        setPurchaseLoading(false);
      }
    },
    [session, hourlyPurchaseCount, HOURLY_PURCHASE_LIMIT, accountTypes, fetchAccountStatsImmediately, getAccountCount]
  );

  // Credit pack calculation
  const creditPacks = [
    { id: 1, credits: 5, price: 1.0 },
    { id: 2, credits: 10, price: 2.0 },
    { id: 3, credits: 25, price: 5.0 },
    { id: 4, credits: 35, price: 7.0 },
  ];

  // Add credits function
  const handleAddCredits = async () => {
    if (!selectedCreditPack || !session?.user?.email) return;

    try {
      setAddingCredits(true);
      setAddCreditsError(null);

      // Seçilen kredi paketini bul
      const selectedPack = creditPacks.find((pack) => pack.id === selectedCreditPack);

      if (!selectedPack) {
        setAddCreditsError("Selected credit pack not found");
        return;
      }

      // Timestamp ve nonce oluştur (güvenlik için)
      const timestamp = Date.now().toString();
      const nonce = Math.random().toString(36).substring(2, 15);

      // Şifrelenecek parametreler
      const params = {
        creditPackId: selectedPack.id,
        userEmail: session.user.email,
        t: timestamp,
      };

      // Parametreleri sıkıştır ve şifrele
      const compressedParams = await compressToBase64(JSON.stringify(params));

      // Stripe ödeme niyeti oluştur
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-request-timestamp": timestamp,
          "x-request-nonce": nonce,
          "x-encrypted-data": compressedParams,
          "Accept-Encoding": "gzip",
        },
      });

      if (!response.ok) {
        console.error("Create payment intent error:", response.statusText);
        setAddCreditsError("Failed to create payment");
        return;
      }

      // Şifrelenmiş yanıtı al ve çöz
      const encryptedData = await response.json();
      const data = decryptResponse(encryptedData);

      // Ödeme için client secret ve diğer bilgileri kaydet
      setClientSecret(data.clientSecret);
      setPaymentAmount(data.amount);
      setPaymentCredits(data.credits);

      // Ödeme adımına geç
      setPaymentStep("payment");
    } catch (err) {
      console.error("Error creating payment intent:", err);
      setAddCreditsError("An error occurred while initiating payment");
    } finally {
      setAddingCredits(false);
    }
  };

  // Ödeme başarılı olduğunda
  const handlePaymentSuccess = async (paymentIntentId?: string) => {
    try {
      // Timestamp ve nonce oluştur (güvenlik için)
      const timestamp = Date.now().toString();
      const nonce = Math.random().toString(36).substring(2, 15);

      // Şifrelenecek parametreler
      const params = {
        credits: paymentCredits,
        userEmail: session?.user?.email,
        payment_intent_id: paymentIntentId || `stripe-manual-success-${Date.now()}`,
        t: timestamp,
      };

      // Parametreleri sıkıştır ve şifrele
      const compressedParams = await compressToBase64(JSON.stringify(params));

      // Kredi eklemek için API'yi çağır
      const response = await fetch("/api/add-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-request-timestamp": timestamp,
          "x-request-nonce": nonce,
          "x-encrypted-data": compressedParams,
          "Accept-Encoding": "gzip",
        },
      });

      // Şifrelenmiş yanıtı al ve çöz
      const encryptedData = await response.json();
      const data = decryptResponse(encryptedData);

      if (!response.ok) {
        console.error("Add credits error after payment:", data.error);
        // Hata olsa bile kullanıcıya başarılı gösterelim, admin daha sonra kontrol edecek
      } else {
        console.log("Credits added successfully after payment", data);
        // Kullanıcı kredisini güncelle
        if (data.newBalance) {
          setUserCredit(data.newBalance);
        }
      }

      // Ödeme tamamlandı göster
      setPaymentComplete(true);

      // 3 saniye sonra modalı kapat
      setTimeout(() => {
        setShowAddCreditsModal(false);
        setSelectedCreditPack(null);
        setClientSecret(null);
        setPaymentStep("select");
        setPaymentComplete(false);

        // Kullanıcı verilerini yenile
        setDataFetched(false);
      }, 3000);
    } catch (error) {
      console.error("Error adding credits after payment:", error);
      // Hata olsa bile kullanıcıya başarılı gösterelim, admin daha sonra kontrol edecek
      setPaymentComplete(true);

      setTimeout(() => {
        setShowAddCreditsModal(false);
        setSelectedCreditPack(null);
        setClientSecret(null);
        setPaymentStep("select");
        setPaymentComplete(false);

        // Veri yenileme
        setDataFetched(false);
      }, 3000);
    }
  };

  // Ödeme iptal edildiğinde
  const handlePaymentCancel = () => {
    setClientSecret(null);
    setPaymentStep("select");
  };

  // Hesap sahipliğini kontrol eden fonksiyon
  const checkAccountOwnership = async (accountId: string) => {
    if (!session?.user?.email) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);

      console.log("Hesap sahipliği kontrolü yapılıyor:", { accountId, userEmail: session.user.email });

      // API'ye kontrol isteği gönder
      const response = await fetch("/api/accounts/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          userEmail: session.user.email,
        }),
      });

      const data = await response.json();
      console.log("Hesap sahipliği kontrolü yanıtı:", data);

      if (!response.ok) {
        console.error("Hesap kontrolü hatası:", data.error);
        setDeleteError(data.error || "Hesap kontrolü sırasında bir hata oluştu");
        return false;
      }

      if (!data.success) {
        setDeleteError(data.error || "Hesap size ait değil");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Hesap kontrolü işleminde hata:", err);
      setDeleteError("Hesap kontrolü sırasında bir hata oluştu");
      return false;
    } finally {
      setDeleteLoading(false);
    }
  };

  // Hesap silme fonksiyonu
  const handleDeleteAccount = async (accountId: string) => {
    if (!session?.user?.email) return;

    if (!confirm("Bu hesabı silmek istediğinizden emin misiniz?")) {
      return;
    }

    // Önce hesap sahipliğini kontrol et
    const isOwner = await checkAccountOwnership(accountId);
    if (!isOwner) {
      console.log("Hesap silme işlemi durduruldu: Hesap sahipliği doğrulanamadı");
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError(null);

      console.log("Hesap silme isteği gönderiliyor:", { accountId, userEmail: session.user.email });

      // API'ye silme isteği gönder
      const response = await fetch("/api/accounts/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          userEmail: session.user.email,
        }),
      });

      const data = await response.json();
      console.log("Hesap silme yanıtı:", data);

      if (!response.ok) {
        console.error("Hesap silme hatası:", data.error);
        setDeleteError(data.error || "Hesap silinirken bir hata oluştu");
        return;
      }

      // Hesabı listeden kaldır
      setAccounts((prevAccounts) => prevAccounts.filter((acc) => acc.id !== accountId));

      // Modalı kapat
      setSelectedAccount(null);
    } catch (err) {
      console.error("Hesap silme işleminde hata:", err);
      setDeleteError("Hesap silinirken bir hata oluştu");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Hediye kodu kullanma işlemi
  const handleRedeemGiftCode = async () => {
    if (!giftCode || !session?.user?.email) return;

    try {
      setRedeemingCode(true);
      setGiftCodeError(null);
      setGiftCodeSuccess(null);

      // Kod formatını kontrol et
      const codePattern = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;
      if (!codePattern.test(giftCode)) {
        setGiftCodeError("Please enter a valid code in XXXX-XXXX format");
        return;
      }

      const response = await fetch("/api/redeem-gift-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: giftCode,
          userEmail: session.user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Redeem gift code error:", data.error);
        setGiftCodeError(data.error || "Failed to redeem gift code");
        return;
      }

      // Kredi bakiyesini güncelle
      setUserCredit(data.newBalance);
      setGiftCodeSuccess(data.message);

      // İşlem başarılı olduğunda inputu temizle
      setTimeout(() => {
        setGiftCode("");
        setShowGiftCodeModal(false);
        setGiftCodeSuccess(null);
      }, 2000);
    } catch (err) {
      console.error("Error redeeming gift code:", err);
      setGiftCodeError("An error occurred while redeeming the gift code");
    } finally {
      setRedeemingCode(false);
    }
  };

  // Kopyalama fonksiyonu
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess({ id: field, message: "Copied!" });

    // 2 saniye sonra mesajı temizle
    setTimeout(() => {
      setCopySuccess(null);
    }, 2000);
  };

  // Hesaplar tablosuna sayfalama UI ekliyorum
  // Sayfalama bileşeni
  const Pagination = () => {
    const totalPages = Math.ceil(totalAccounts / pageSize);
    if (totalPages <= 1) return null;

    return (
      <div className="px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {t.home.accounts.pagination.showing} <span className="font-medium">{Math.min((currentPage - 1) * pageSize + 1, totalAccounts)}</span> {t.home.accounts.pagination.to} <span className="font-medium">{Math.min(currentPage * pageSize, totalAccounts)}</span> {t.home.accounts.pagination.of}{" "}
          <span className="font-medium">{totalAccounts}</span> {t.home.accounts.pagination.accounts}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
              disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t.home.accounts.pagination.previous}
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
              disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t.home.accounts.pagination.next}
          </button>
        </div>
      </div>
    );
  };

  // Tarayıcıda aç butonu için fonksiyon
  const handleOpenInBrowser = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!selectedAccount) return;

    // Her durumda varsayılan davranışı engelle
    event.preventDefault();

    // Eğer butonda preventClick özniteliği varsa diyaloğu açma
    if (event.currentTarget.hasAttribute("preventClick")) {
      return;
    }

    setShowExtensionModal(true);
  };

  // Kullanıcı kimlik bilgilerini kopyalama fonksiyonu
  const handleCopyCredentials = () => {
    if (!selectedAccount) return;

    const credentials = `E-mail: ${selectedAccount.email}\nPassword: ${selectedAccount.password}`;
    navigator.clipboard.writeText(credentials);

    setCopySuccess({ id: "credentials", message: "Copied!" });
    setTimeout(() => {
      setCopySuccess(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full z-30 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img src="/logo.svg" alt="AI Accounts Logo" className="h-8 w-8 mr-2" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Accounts</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex space-x-4 items-center">
                  <UserMenu userEmail={session?.user?.email || ""} userImage={cachedUserImage || session?.user?.image || "/avatar.png"} isAdmin={isAdmin} signout={signout} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Service Notice Alert */}
          <div className="mt-6 mb-6">
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-5">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300">{t.home.serviceNotice.title}</h3>
                    <div className="mt-2 text-amber-700 dark:text-amber-200">
                      <p className="text-sm">{t.home.serviceNotice.message}</p>
                    </div>
                    <div className="mt-4">
                      <a
                        href="https://cursor.com/students"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-800/40 hover:bg-amber-200 dark:hover:bg-amber-800/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800"
                      >
                        Cursor Students
                        <svg className="ml-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content wrapper */}
          <div className="py-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Credit Card */}
              <div className="md:col-span-1">
                <CreditCard
                  credits={userCredit}
                  hasActiveSubscription={true}
                  isBanned={isBanned}
                  onAddCredits={() => {
                    /* Hizmet durduruldu */
                  }}
                  onUseGiftCode={() => setShowGiftCodeModal(true)}
                  onPurchaseAccount={toggleDropdown}
                  onResetCursorTrial={handleResetCursorTrial}
                />
              </div>

              {/* Accounts Table */}
              <div className="md:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{t.home.accounts.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.home.accounts.subtitle}</p>
                  </div>

                  {loading ? (
                    <div className="p-10 flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t.home.accounts.loading}</p>
                    </div>
                  ) : error ? (
                    <div className="p-6 text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-800">
                        <svg className="h-6 w-6 text-red-600 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p>
                    </div>
                  ) : accounts.length === 0 ? (
                    <div className="p-10 text-center">
                      <svg className="mx-auto h-14 w-14 text-gray-300 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002 2v-1M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{t.home.accounts.noAccounts.title}</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.home.accounts.noAccounts.message}</p>
                      <div className="mt-6">
                        <button onClick={toggleDropdown} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          {t.home.actions.purchaseAccount}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              {t.home.accounts.tableHeaders.account}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              {t.home.accounts.tableHeaders.email}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              {t.home.accounts.tableHeaders.created}
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">{t.home.accounts.tableHeaders.actions}</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {accounts.map((account) => (
                            <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" data-token={account.token || ""} data-addon={account.addon || ""} data-type={(account.type || "").toLowerCase()}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div
                                      className={`h-10 w-10 ${
                                        account.type.toLowerCase().includes("cursor") ? "bg-blue-100 dark:bg-blue-800" : account.type.toLowerCase().includes("windsurf") ? "bg-indigo-100 dark:bg-indigo-800" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                      } rounded-md flex items-center justify-center`}
                                    >
                                      {account.type.toLowerCase().includes("cursor") ? (
                                        <img src="/cursor.png" alt="Cursor" className="h-6 w-6" />
                                      ) : account.type.toLowerCase().includes("windsurf") ? (
                                        <img src="/windsurf.png" alt="Windsurf" className="h-6 w-6" />
                                      ) : (
                                        <span className="text-xl font-bold">{account.type.charAt(0).toUpperCase()}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{account.type}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{account.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(account.created_at).toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleAccountSelect(account)} id="view-details" className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:underline">
                                  {t.home.accounts.viewDetails}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <Pagination />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Account Details Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-auto overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.home.accountDetails.title}</h3>
              <button onClick={handleCloseDetails} className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-full p-1">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-5">
              {/* Account Logo & Title */}
              <div className="flex items-center mb-6">
                <div
                  className={`h-14 w-14 rounded-lg flex items-center justify-center ${
                    selectedAccount.type.toLowerCase().includes("cursor") ? "bg-blue-100 dark:bg-blue-800/40" : selectedAccount.type.toLowerCase().includes("windsurf") ? "bg-indigo-100 dark:bg-indigo-800/40" : "bg-gray-100 dark:bg-gray-700/50"
                  }`}
                >
                  {selectedAccount.type.toLowerCase().includes("cursor") ? (
                    <img src="/cursor.png" alt="Cursor" className="h-8 w-8" />
                  ) : selectedAccount.type.toLowerCase().includes("windsurf") ? (
                    <img src="/windsurf.png" alt="Windsurf" className="h-8 w-8" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">{selectedAccount.type.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedAccount.type}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(selectedAccount.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.home.accountDetails.email}</label>
                  <div className="flex items-center w-full">
                    <div className="bg-gray-50 dark:bg-gray-700/60 rounded-lg py-2 px-3 font-mono text-sm text-gray-800 dark:text-gray-100 flex-grow overflow-x-auto">{selectedAccount.email}</div>
                    <button
                      onClick={() => handleCopy(selectedAccount.email, "email")}
                      className="ml-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      aria-label="Copy email to clipboard"
                    >
                      {copySuccess?.id === "email" ? <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">Copied!</span> : null}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.home.accountDetails.password}</label>
                  <div className="flex items-center w-full">
                    <div className="bg-gray-50 dark:bg-gray-700/60 rounded-lg py-2 px-3 font-mono text-sm text-gray-800 dark:text-gray-100 flex-grow overflow-x-auto">{selectedAccount.password}</div>
                    <button
                      onClick={() => handleCopy(selectedAccount.password, "password")}
                      className="ml-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      aria-label="Copy password to clipboard"
                    >
                      {copySuccess?.id === "password" ? <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">Copied!</span> : null}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Remaining Limit - Only for Cursor accounts */}
                {selectedAccount.type.toLowerCase().includes("cursor") && (
                  <div className="space-y-2 hidden" id="remaining-limit">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.home.accountDetails.remainingLimit}</label>
                    <div className="flex items-center w-full">
                      <div className="bg-gray-50 dark:bg-gray-700/60 rounded-lg py-2 px-3 font-mono text-sm text-gray-800 dark:text-gray-100 flex-grow overflow-x-auto" id="remaining-limit-value">
                        1000 tokens
                      </div>
                    </div>
                  </div>
                )}
                {/* Token Kopyala Butonu */}
                <div id="token-copy-button" className="hidden pt-2 pb-2">
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-lg text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors relative focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    {t.home.copyToken}
                  </button>
                </div>

                {/* Error Message */}
                {deleteError && <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{deleteError}</div>}
              </div>
            </div>

            {/* Modal Footer - New button layout */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Open in Browser Button */}
                <button
                  onClick={(e) => handleOpenInBrowser(e)}
                  id="open-in-browser"
                  className="flex items-center justify-center px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {t.home.accountDetails.openInBrowser}
                </button>

                {/* Copy Credentials Button */}
                <button
                  onClick={handleCopyCredentials}
                  className="flex items-center justify-center px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 relative"
                >
                  {copySuccess?.id === "credentials" ? <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">Copied!</span> : null}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {t.home.accountDetails.copyCredentials}
                </button>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteAccount(selectedAccount.id)}
                disabled={deleteLoading}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                {deleteLoading ? t.home.accountDetails.deleting : t.home.accountDetails.deleteAccount}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extension Installation Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div ref={extensionModalRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.home.accountDetails.extensionDialog.title}</h3>
              <button onClick={() => setShowExtensionModal(false)} className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none focus:text-gray-500 dark:focus:text-gray-200">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
              <p className="text-gray-700 dark:text-gray-300 mb-6">{t.home.accountDetails.extensionDialog.description}</p>

              {/* Yeni sürüm bildirimi */}
              <div id="new-version-alert" className="hidden mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{t.home.accountDetails.extensionDialog.newVersion}</p>
              </div>

              {/* Installation Steps */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.home.accountDetails.extensionDialog.installTitle}</h4>

                <ol className="space-y-6">
                  {/* Step 1 */}
                  <li className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold mr-3">1</div>
                    <div className="flex-grow">
                      <h5 className="text-base font-medium text-gray-900 dark:text-white mb-2">{t.home.accountDetails.extensionDialog.steps.step1}</h5>
                      <div className="flex space-x-3 mb-3">
                        <a
                          href="https://github.com/ruwiss/ai-manager-extension/archive/refs/heads/main.zip"
                          download
                          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {t.home.accountDetails.extensionDialog.downloadExtension}
                        </a>
                        <a
                          href="https://github.com/ruwiss/ai-manager-extension"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          {t.home.accountDetails.extensionDialog.viewSourceCode}
                        </a>
                      </div>
                    </div>
                  </li>

                  {/* Step 2-3 */}
                  <li className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold mr-3">2</div>
                    <div className="flex-grow">
                      <h5 className="text-base font-medium text-gray-900 dark:text-white mb-2">{t.home.accountDetails.extensionDialog.steps.step2}</h5>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{t.home.accountDetails.extensionDialog.steps.step3}</p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <img src="/extension/enable-developer-mode.png" alt="Enable Developer Mode" className="w-full rounded-md shadow-sm" />
                      </div>
                    </div>
                  </li>

                  {/* Step 4-5 */}
                  <li className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold mr-3">3</div>
                    <div className="flex-grow">
                      <h5 className="text-base font-medium text-gray-900 dark:text-white mb-2">{t.home.accountDetails.extensionDialog.steps.step4}</h5>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{t.home.accountDetails.extensionDialog.steps.step5}</p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <img src="/extension/load-the-unpacked-extension.png" alt="Load Unpacked Extension" className="w-full rounded-md shadow-sm" />
                      </div>
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowExtensionModal(false)}
                className="px-5 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                {t.home.accountDetails.extensionDialog.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Cursor Trial Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div ref={resetModalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.home.resetCursorTrial.title}</h3>
              <button onClick={handleCloseResetModal} className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none focus:text-gray-500 dark:focus:text-gray-200">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto">
              <div className="space-y-6">
                <p className="text-sm text-gray-700 dark:text-gray-300">{t.home.resetCursorTrial.description}</p>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">{t.home.resetCursorTrial.linuxMacos}</h4>
                  <div className="bg-gray-800 dark:bg-gray-900 rounded-md p-3 overflow-x-auto">
                    <pre className="text-xs text-green-400 whitespace-pre-wrap">
                      <code>curl -fsSL https://raw.githubusercontent.com/ruwiss/ai-auto-free/refs/heads/master/utils/patch_cursor.sh | bash</code>
                    </pre>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("curl -fsSL https://raw.githubusercontent.com/ruwiss/ai-auto-free/refs/heads/master/utils/patch_cursor.sh | bash");
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
                  >
                    {t.home.resetCursorTrial.copyToClipboard}
                  </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">{t.home.resetCursorTrial.windows}</h4>
                  <div className="bg-gray-800 dark:bg-gray-900 rounded-md p-3 overflow-x-auto">
                    <pre className="text-xs text-green-400 whitespace-pre-wrap">
                      <code>Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; irm https://raw.githubusercontent.com/ruwiss/ai-auto-free/refs/heads/master/utils/patch_cursor.ps1 | iex</code>
                    </pre>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; irm https://raw.githubusercontent.com/ruwiss/ai-auto-free/refs/heads/master/utils/patch_cursor.ps1 | iex");
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
                  >
                    {t.home.resetCursorTrial.copyToClipboard}
                  </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  {t.home.resetCursorTrial.note}{" "}
                  <a href="https://github.com/ruwiss/ai-auto-free" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    {t.home.resetCursorTrial.project}
                  </a>{" "}
                  project.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end">
              <button onClick={handleCloseResetModal} className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {t.home.resetCursorTrial.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Credits Modal */}
      {showAddCreditsModal && (
        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div ref={addCreditsModalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{paymentStep === "select" ? t.home.creditPacks.title : t.home.creditPacks.payment}</h3>
              <button
                onClick={() => {
                  setShowAddCreditsModal(false);
                  setSelectedCreditPack(null);
                  setClientSecret(null);
                  setPaymentStep("select");
                }}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none focus:text-gray-500 dark:focus:text-gray-200"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 overflow-y-auto">
              {paymentStep === "select" ? (
                <div className="space-y-6">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t.home.creditPacks.description} <span className="font-medium text-blue-600 dark:text-blue-400">$0.20</span>.
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {creditPacks.map((pack) => (
                      <div
                        key={pack.id}
                        className={`relative overflow-hidden ${
                          selectedCreditPack === pack.id ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700"
                        } rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-gray-800`}
                        onClick={() => setSelectedCreditPack(pack.id)}
                      >
                        {selectedCreditPack === pack.id && (
                          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}

                        <div className="p-3 sm:p-5">
                          <div className="flex justify-center mb-2 sm:mb-4">
                            <div className="text-center">
                              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400">{pack.credits}</h3>
                              <p className="text-xs uppercase tracking-wide mt-0.5 sm:mt-1 text-gray-500 dark:text-gray-400">{t.home.creditPacks.credits}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/80 px-3 sm:px-5 py-2 sm:py-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-center">
                            <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">PRICE</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">${pack.price.toFixed(2)}</p>
                          </div>
                        </div>

                        {selectedCreditPack === pack.id && <div className="absolute bottom-0 left-0 w-full h-1 sm:h-1.5 bg-blue-500"></div>}
                      </div>
                    ))}
                  </div>

                  {addCreditsError && (
                    <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                      <p className="text-sm text-red-600 dark:text-red-400">{addCreditsError}</p>
                    </div>
                  )}

                  {/* Message to contact via chat support */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{t.home.creditPacks.title}</h3>
                        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">{t.home.creditPacks.useChat}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">{t.home.creditPacks.howCreditsWork.title}</h3>
                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">{t.home.creditPacks.howCreditsWork.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Ödeme adımı - yorum satırına alındı */
                <div className="space-y-6">
                  {paymentComplete ? (
                    <div className="p-6 flex flex-col items-center justify-center">
                      <div className="h-16 w-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-4">
                        <svg className="h-10 w-10 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{t.home.creditPacks.paymentSuccess}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-center mb-4">{t.home.creditPacks.paymentSuccessDesc}</p>
                      <div className="text-sm text-gray-500 dark:text-gray-500">{t.home.creditPacks.redirecting}</div>
                    </div>
                  ) : (
                    /* Stripe ödeme elementi yerine mesaj gösterilecek */
                    <div className="p-6 flex flex-col items-center justify-center">
                      <div className="h-16 w-16 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center mb-4">
                        <svg className="h-10 w-10 text-yellow-600 dark:text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{t.home.creditPacks.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">{t.home.creditPacks.useChat}</p>
                      <button onClick={handlePaymentCancel} className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        {t.home.creditPacks.close}
                      </button>
                    </div>
                    /*
                    // Stripe ödeme elementi yorum satırına alındı
                    <StripePaymentElement clientSecret={clientSecret} onSuccess={handlePaymentSuccess} onCancel={handlePaymentCancel} amount={paymentAmount} credits={paymentCredits} />
                    */
                  )}
                </div>
              )}
            </div>

            {paymentStep === "select" && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <button
                  onClick={() => setShowAddCreditsModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  {t.home.creditPacks.cancel}
                </button>

                <button
                  onClick={() => window.open("https://t.me/omergundgr", "_blank")}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                >
                  <svg className="mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0-.202 0-.38-.072-.52-.189l.684-3.324 6.104-5.506c.266-.241-.06-.372-.41-.137l-7.568 4.76-3.264-1.022c-.71-.225-.723-.71.15-1.052l12.79-4.924c.59-.222 1.109.146.933 1.127z" />
                  </svg>
                  Telegram
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gift Code Modal */}
      {showGiftCodeModal && (
        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div ref={giftCodeModalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.home.giftCode.title}</h3>
              <button onClick={() => setShowGiftCodeModal(false)} className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none focus:text-gray-500 dark:focus:text-gray-200">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">{t.home.giftCode.description}</p>

                <div className="mt-4">
                  <label htmlFor="gift-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.home.giftCode.label}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="gift-code"
                      value={giftCode}
                      onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                      placeholder={t.home.giftCode.placeholder}
                      className="text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 block w-full p-3 sm:text-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md uppercase font-mono"
                      maxLength={9}
                      pattern="[A-Za-z0-9]{4}-[A-Za-z0-9]{4}"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t.home.giftCode.example}</p>
                </div>

                {giftCodeError && (
                  <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">{giftCodeError}</p>
                  </div>
                )}

                {giftCodeSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-md">
                    <p className="text-sm text-green-600 dark:text-green-400">{giftCodeSuccess}</p>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">{t.home.giftCode.howGiftCodesWork.title}</h3>
                      <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">{t.home.giftCode.howGiftCodesWork.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <button
                disabled={redeemingCode || !giftCode || giftCode.length < 9}
                onClick={handleRedeemGiftCode}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {redeemingCode ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {redeemingCode ? t.home.giftCode.redeeming : t.home.giftCode.redeemCode}
              </button>
              <button
                onClick={() => setShowGiftCodeModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {t.home.giftCode.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Menu for Account Purchase */}
      {isDropdownOpen && (
        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsDropdownOpen(false)}>
          <div ref={dropdownRef} className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t.home.purchaseAccount.title}</h3>
              <button onClick={() => setIsDropdownOpen(false)} className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none focus:text-gray-500 dark:focus:text-gray-200">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="py-1 max-h-80 overflow-y-auto">
              <div className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                <div className="font-medium text-gray-900 dark:text-white">{t.home.purchaseAccount.subtitle}</div>
                {purchaseError && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-xs text-red-600 dark:text-red-400">{purchaseError}</p>
                  </div>
                )}
              </div>

              {purchaseLoading ? (
                <div className="px-4 py-3 text-center">
                  <div className="inline-block animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t.home.purchaseAccount.processing}</p>
                </div>
              ) : (
                <>
                  {accountTypes.length > 0 ? (
                    accountTypes
                      .filter((type) => type.type.toLowerCase() !== "other")
                      .map((type) => (
                        <div key={type.id}>
                          <button
                            onClick={() => handlePurchaseAccount(type.type)}
                            disabled={userCredit < type.credit_cost || getAccountCount(type.type) === 0}
                            className="flex items-center w-full px-4 py-3 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-75 disabled:cursor-not-allowed"
                          >
                            <div className="flex-shrink-0 mr-3">
                              <div
                                className={`h-10 w-10 ${
                                  type.type.toLowerCase().includes("cursor") ? "bg-blue-100 dark:bg-blue-800" : type.type.toLowerCase().includes("windsurf") ? "bg-indigo-100 dark:bg-indigo-800" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                } rounded-md flex items-center justify-center`}
                              >
                                {type.type.toLowerCase().includes("cursor") ? (
                                  <img src="/cursor.png" alt="Cursor" className="h-6 w-6" />
                                ) : type.type.toLowerCase().includes("windsurf") ? (
                                  <img src="/windsurf.png" alt="Windsurf" className="h-6 w-6" />
                                ) : (
                                  <span className="text-xl font-bold">{type.type.charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium dark:text-white">
                                {type.type} {t.home.purchaseAccount.accountType}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{type.description}</div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                {type.credit_cost} <span className="ml-1">{t.home.purchaseAccount.credit}</span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {getAccountCount(type.type) > 0 ? (
                                  <span className="text-green-500 dark:text-green-400">
                                    {getAccountCount(type.type)} {t.home.purchaseAccount.available}
                                  </span>
                                ) : (
                                  <span className="text-red-500 dark:text-red-400">{t.home.purchaseAccount.outOfStock}</span>
                                )}
                              </div>
                            </div>
                          </button>
                        </div>
                      ))
                  ) : (
                    <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">{t.home.purchaseAccount.noAccountTypes}</div>
                  )}
                </>
              )}
            </div>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end">
              <button onClick={() => setIsDropdownOpen(false)} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {t.home.purchaseAccount.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
