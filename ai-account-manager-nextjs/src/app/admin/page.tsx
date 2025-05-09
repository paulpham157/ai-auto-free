"use client";

import { useState, useEffect } from "react";
import { useSession, getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUserByEmail, supabase, User, Account, updateUserCredit, getInactiveUsers, deleteUsers, getAccountPool, AccountPool, deleteOldPoolAccounts, getOldAccountsCount, banUser, unbanUser, getDemoCreditSetting, updateDemoCreditSetting, DemoCreditSetting } from "@/utils/supabase";
import { toast } from "react-hot-toast";
import type { NextPage } from "next";
import CreditTransactions from "../components/CreditTransactions";

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminStatus, setAdminStatus] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // İnaktif kullanıcılar için state
  const [inactiveUsers, setInactiveUsers] = useState<User[]>([]);
  const [selectedInactiveUsers, setSelectedInactiveUsers] = useState<string[]>([]);
  const [inactivityDays, setInactivityDays] = useState(30);
  const [isDeletingInactive, setIsDeletingInactive] = useState(false);
  const [userDeleteResult, setUserDeleteResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoadingInactiveUsers, setIsLoadingInactiveUsers] = useState(false);

  // JSON kopya modalı için state'ler
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonCopyType, setJsonCopyType] = useState("");
  const [jsonCopyMode, setJsonCopyMode] = useState<"all" | "domain">("all");
  const [copiedJson, setCopiedJson] = useState("");
  const [isCopyingJson, setIsCopyingJson] = useState(false);

  // Pagination için state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Kullanıcı arama ve kredi düzenleme için state
  const [searchEmail, setSearchEmail] = useState("");
  const [creditAmount, setCreditAmount] = useState(0);
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [searchMessage, setSearchMessage] = useState("");
  const [searchMessageType, setSearchMessageType] = useState<"success" | "error" | "info">("info");

  // Çoklu hesap ekleme için state
  const [bulkAccountsInput, setBulkAccountsInput] = useState("");
  const [parsedAccounts, setParsedAccounts] = useState<{ token: string; email: string; password: string; addon?: string }[]>([]);
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [accountTypes, setAccountTypes] = useState<any[]>([]);
  const [bulkAddLoading, setBulkAddLoading] = useState(false);
  const [bulkAddResult, setBulkAddResult] = useState<{ success?: boolean; added?: number; errors?: any[] } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Hesap havuzu için state
  const [poolAccounts, setPoolAccounts] = useState<AccountPool[]>([]);
  const [accountAvailability, setAccountAvailability] = useState<boolean | null>(true); // true=kullanılabilir, false=kullanılmış
  const [isLoadingPoolAccounts, setIsLoadingPoolAccounts] = useState<boolean>(false);
  const [isDeletingOldAccounts, setIsDeletingOldAccounts] = useState<boolean>(false);
  const [oldAccountsCount, setOldAccountsCount] = useState<number>(0);
  const [totalPoolCount, setTotalPoolCount] = useState<number>(0);

  // Hesap havuzu pagination
  const [currentPoolPage, setCurrentPoolPage] = useState<number>(1);
  const poolAccountsPerPage = 10;

  // Filtreleme için yeni state'ler ekleyelim
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>("all");
  const [emailDomainFilter, setEmailDomainFilter] = useState<string>("");
  const [selectedPoolAccounts, setSelectedPoolAccounts] = useState<string[]>([]);
  const [isDeletingSelectedAccounts, setIsDeletingSelectedAccounts] = useState<boolean>(false);
  // Domain aramak için yeni state
  const [tempEmailDomainFilter, setTempEmailDomainFilter] = useState<string>("");

  // Demo kredi ayarları için state
  const [demoCreditSettings, setDemoCreditSettings] = useState<DemoCreditSetting | null>(null);
  const [isUpdatingCredit, setIsUpdatingCredit] = useState(false);
  const [newDemoCredit, setNewDemoCredit] = useState<number>(1);

  // Tab değişiminde yapılacak işlemler
  useEffect(() => {
    // Tab değiştiğinde kullanıcı araması ve sonuçları sıfırlayalım
    setSearchEmail("");
    setSearchResult(null);
    setSearchMessage("");
    setSearchMessageType("info");

    // İnaktif kullanıcılar sekmesi seçildiğinde kullanıcıları getir
    if (activeTab === "inactive-users") {
      fetchInactiveUsers();
    }

    // Hesap havuzu sekmesi seçildiğinde hesapları getir
    if (activeTab === "bulk-accounts") {
      fetchPoolAccounts();
    }

    // Demo kredi sekmesi seçildiğinde verileri getir
    if (activeTab === "demo-credit") {
      fetchDemoCreditSettings();
    }
  }, [activeTab]);

  // Admin yetkisi değiştiğinde demo kredi ayarlarını da getir
  useEffect(() => {
    if (adminStatus) {
      fetchDemoCreditSettings();
    }
  }, [adminStatus]);

  // İnaktif kullanıcılar sekmesinde gün değeri değiştiğinde kullanıcıları yeniden getir
  useEffect(() => {
    if (activeTab === "inactive-users") {
      fetchInactiveUsers();
    }
  }, [inactivityDays]);

  // İnaktif kullanıcıları getiren fonksiyon
  async function fetchInactiveUsers() {
    try {
      setIsLoadingInactiveUsers(true);
      setUserDeleteResult(null);

      // API'den inaktif kullanıcıları getir
      const response = await fetch(`/api/admin?action=inactive-users&days=${inactivityDays}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch inactive users: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("İnaktif kullanıcılar API'den alındı:", data);

      // API yanıtında inactiveUsers alanı kullanılıyor
      setInactiveUsers(data.inactiveUsers || []);
      setSelectedInactiveUsers([]);
    } catch (error) {
      console.error("Error fetching inactive users:", error);
      toast.error("İnaktif kullanıcılar yüklenirken bir hata oluştu");
    } finally {
      setIsLoadingInactiveUsers(false);
    }
  }

  // Tek bir inaktif kullanıcıyı seçme veya seçimini kaldırma
  function toggleInactiveUserSelection(userId: string) {
    setSelectedInactiveUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }

  // Tüm inaktif kullanıcıları seçme veya seçimi kaldırma
  function toggleAllInactiveUsers() {
    if (selectedInactiveUsers.length === inactiveUsers.length) {
      // Tüm seçimleri kaldır
      setSelectedInactiveUsers([]);
    } else {
      // Tüm kullanıcıları seç
      setSelectedInactiveUsers(inactiveUsers.map((user) => user.id));
    }
  }

  // Seçili inaktif kullanıcıları silme işlemi
  async function handleDeleteInactiveUsers() {
    if (selectedInactiveUsers.length === 0) {
      toast.error("Lütfen silinecek kullanıcıları seçin");
      return;
    }

    if (!confirm(`${selectedInactiveUsers.length} kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    setIsDeletingInactive(true);
    try {
      const response = await fetch("/api/admin?action=delete-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: selectedInactiveUsers,
          userEmail: session?.user?.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserDeleteResult({
          success: true,
          message: `${selectedInactiveUsers.length} kullanıcı başarıyla silindi.`,
        });

        // Silinen kullanıcıları listeden kaldır
        setInactiveUsers((prev) => prev.filter((user) => !selectedInactiveUsers.includes(user.id)));
        setSelectedInactiveUsers([]);

        // Dashboard verilerini yeniden yükle
        await loadDashboardData();
      } else {
        setUserDeleteResult({
          success: false,
          message: data.error || "Kullanıcılar silinirken bir hata oluştu.",
        });
      }
    } catch (error) {
      console.error("Error deleting inactive users:", error);
      setUserDeleteResult({
        success: false,
        message: "Kullanıcılar silinirken bir hata oluştu.",
      });
    } finally {
      setIsDeletingInactive(false);
    }
  }

  // Session yükleniyor mu kontrol et - sadece bir kez yapılması için dependency dizisini düzeltiyoruz
  // ve initialCheckDone değişkeni ile takip ediyoruz
  useEffect(() => {
    const checkAuthentication = async () => {
      console.log("AdminPanel ilk yükleme kontrolü başladı");
      console.log("Status:", status);

      if (status === "loading") {
        console.log("AdminPanel: Status yükleniyor, bekle");
        return;
      }

      if (!session?.user?.email) {
        console.log("AdminPanel: Kullanıcı oturumu yok, ana sayfaya yönlendiriliyor");
        router.push("/");
        return;
      }

      try {
        console.log("Admin kontrolü başlatılıyor, email:", session.user.email);

        // Admin kontrolü için API'ye istek gönder
        const adminCheckResponse = await fetch(`/api/admin?action=check`);

        if (!adminCheckResponse.ok) {
          console.error("Admin kontrol API hatası:", adminCheckResponse.status, adminCheckResponse.statusText);
          router.push("/");
          return;
        }

        const adminCheckData = await adminCheckResponse.json();

        console.log("Admin API yanıtı:", adminCheckData);

        if (adminCheckData.role === "admin") {
          setAdminStatus(true);
          setInitialCheckDone(true); // İlk kontrol tamamlandı, bir daha çalışmasını engelle
          console.log("Kullanıcı admin olarak doğrulandı, sayfa yükleniyor");

          // Verileri yüklemeye başla
          await loadDashboardData();
          await fetchAccountTypes();
          setDataLoaded(true);
          setLoading(false);
        } else {
          console.log("Kullanıcı admin değil, ana sayfaya yönlendiriliyor");
          router.push("/");
        }
      } catch (error) {
        console.error("Admin kontrol hatası:", error);
        router.push("/");
      }
    };

    if (!initialCheckDone && status !== "loading") {
      checkAuthentication();
    }
  }, [status, session, router, initialCheckDone]);

  // Sekmeler arası geçişlerde gerekli verileri yükleyin
  useEffect(() => {
    // İlk kontrol tamamlanmışsa ve admin ise verileri yükle
    if (initialCheckDone && adminStatus) {
      // Tab değiştiğinde kullanıcı araması ve sonuçları sıfırlayalım
      setSearchEmail("");
      setSearchResult(null);
      setSearchMessage("");
      setSearchMessageType("info");

      // İnaktif kullanıcılar sekmesi seçildiğinde kullanıcıları getir
      if (activeTab === "inactive-users") {
        fetchInactiveUsers();
      }

      // Hesap havuzu sekmesi seçildiğinde hesapları getir
      if (activeTab === "bulk-accounts") {
        fetchPoolAccounts();
      }

      // Demo kredi sekmesi seçildiğinde verileri getir
      if (activeTab === "demo-credit") {
        fetchDemoCreditSettings();
      }
    }
  }, [activeTab, initialCheckDone, adminStatus]);

  async function loadDashboardData() {
    try {
      console.log("Veriler API üzerinden yükleniyor...");

      // API'den kullanıcıları getir
      const userResponse = await fetch("/api/admin?action=users");
      if (!userResponse.ok) {
        throw new Error(`Failed to fetch users: ${userResponse.status} ${userResponse.statusText}`);
      }
      const userData = await userResponse.json();
      console.log("Kullanıcılar API'den alındı:", userData);
      setUsers(userData.users || []);

      // API'den hesapları getir
      const accountResponse = await fetch("/api/admin?action=accounts");
      if (!accountResponse.ok) {
        throw new Error(`Failed to fetch accounts: ${accountResponse.status} ${accountResponse.statusText}`);
      }
      const accountData = await accountResponse.json();
      console.log("Hesaplar API'den alındı:", accountData);
      setAccounts(accountData.accounts || []);

      // Toplam kredileri hesapla
      const totalCredits = userData.users?.reduce((sum: number, user: User) => sum + (user.credit || 0), 0) || 0;
      setTotalCredits(totalCredits);
      console.log("Veriler başarıyla yüklendi. Toplam kredi:", totalCredits);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }

  async function handleSearchUser() {
    if (!searchEmail.trim()) {
      setSearchMessage("Lütfen bir e-posta adresi giriniz");
      setSearchResult(null);
      return;
    }

    try {
      setSearchMessage("Aranıyor...");
      setSearchMessageType("info"); // Arama işlemi için info tipi kullanılıyor
      console.log("Kullanıcı arama başlatıldı, email:", searchEmail);

      // API üzerinden kullanıcı ara
      const response = await fetch(`/api/admin?action=user-search&email=${encodeURIComponent(searchEmail)}`);
      const data = await response.json();

      console.log("Kullanıcı arama sonucu:", data);

      if (!response.ok) {
        throw new Error(data.error || "Kullanıcı arama hatası");
      }

      if (!data.user) {
        setSearchMessage("Kullanıcı bulunamadı");
        setSearchMessageType("error"); // Bulunamadı durumu için error tipi
        setSearchResult(null);
        return;
      }

      setSearchResult(data.user);
      setSearchMessage("");
      setCreditAmount(data.user.credit || 0);
    } catch (error) {
      console.error("Kullanıcı arama hatası:", error);
      setSearchMessage("Bir hata oluştu");
      setSearchMessageType("error"); // Hata durumu için error tipi
      setSearchResult(null);
    }
  }

  async function handleUpdateCredit() {
    if (!searchResult) return;

    try {
      setSearchMessage("Kredi güncelleniyor...");
      setSearchMessageType("info"); // Güncelleme işlemi için info tipi kullanılıyor
      // Şu anki kredi ile yeni kredi arasındaki farkı hesapla
      const currentCredit = searchResult.credit || 0;
      const newCredit = creditAmount;

      console.log(`Güncellenecek kredi: ${searchResult.id}, ${currentCredit} -> ${newCredit} (Fark: ${newCredit - currentCredit})`);

      // Krediyi doğrudan ayarlamak için krediler arasındaki farkı gönder
      // Eğer newCredit > currentCredit ise pozitif değer gönderiyoruz (kredi ekleme)
      // Eğer newCredit < currentCredit ise negatif değer gönderiyoruz (kredi çıkarma)
      const creditDifference = newCredit - currentCredit;

      const response = await fetch("/api/admin?action=user-credit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: searchResult.id,
          creditAmount: creditDifference,
        }),
      });

      const result = await response.json();
      console.log("Kredi güncelleme sonucu:", result);

      if (!response.ok) {
        throw new Error(result.error || result.details || "Kredi güncellenirken bir hata oluştu");
      }

      setSearchMessage("Kredi başarıyla güncellendi");
      setSearchMessageType("success"); // Başarılı durumu için success tipi

      // searchResult objesini güncelle ki kullanıcıya yeni değeri gösterelim
      setSearchResult({
        ...searchResult,
        credit: newCredit,
      });

      // Dashboard verilerini yeniden yükle
      await loadDashboardData();
    } catch (error) {
      console.error("Kredi güncelleme hatası:", error);
      setSearchMessage(error instanceof Error ? error.message : "Kredi güncellenirken bir hata oluştu");
      setSearchMessageType("error"); // Hata durumu için error tipi
    }
  }

  async function fetchAccountTypes() {
    try {
      console.log("Hesap türleri API üzerinden yükleniyor...");
      const response = await fetch("/api/admin?action=account-types");
      if (!response.ok) {
        throw new Error(`Failed to fetch account types: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Hesap türleri API'den alındı:", data);

      // API yanıtından hesap türlerini al
      setAccountTypes(data.accountTypes || []);
      if (data.accountTypes && data.accountTypes.length > 0 && !selectedAccountType) {
        setSelectedAccountType(data.accountTypes[0].type);
      }
    } catch (err) {
      console.error("Error fetching account types:", err);
    }
  }

  // Çoklu hesap ekleme için string'i ayrıştır
  function parseAccounts() {
    if (!bulkAccountsInput.trim()) {
      setParsedAccounts([]);
      setShowPreview(false);
      return;
    }

    const accounts = [];
    const entries = bulkAccountsInput.trim().split(/\n\s*\n/);

    for (const entry of entries) {
      const lines = entry.trim().split("\n");
      if (lines.length >= 3) {
        accounts.push({
          token: lines[0].trim(),
          email: lines[1].trim(),
          password: lines[2].trim(),
          addon: lines.length >= 4 ? lines[3].trim() : undefined,
        });
      }
    }

    setParsedAccounts(accounts);
    setShowPreview(accounts.length > 0);
  }

  // Çoklu hesap ekle
  async function handleBulkAddAccounts() {
    if (parsedAccounts.length === 0 || !selectedAccountType) {
      return;
    }

    try {
      setBulkAddLoading(true);
      setBulkAddResult(null);

      const response = await fetch("/api/admin?action=bulk-add-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accounts: parsedAccounts,
          type: selectedAccountType,
          userEmail: session?.user?.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Bulk add accounts error:", data.error);
        setBulkAddResult({ success: false, errors: [{ error: data.error || "Failed to add accounts" }] });
        return;
      }

      setBulkAddResult(data);

      // Başarılı ekleme sonrası formu temizle
      if (data.success && data.added > 0) {
        setBulkAccountsInput("");
        setParsedAccounts([]);
        setShowPreview(false);

        // Dashboard verilerini yeniden yükle
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Error adding accounts:", err);
      setBulkAddResult({ success: false, errors: [{ error: "An error occurred while adding accounts" }] });
    } finally {
      setBulkAddLoading(false);
    }
  }

  // Pagination için hesaplamalar
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Sayfa değiştirme fonksiyonları
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Havuzdaki hesapları getirme fonksiyonu
  async function fetchPoolAccounts() {
    try {
      setIsLoadingPoolAccounts(true);
      console.log("Hesap havuzu API üzerinden yükleniyor...");

      // API'ye gönderilecek filtreleri hazırlayalım
      const queryParams = new URLSearchParams();

      // Hesap durumuna göre filtreleme
      if (accountAvailability !== null) {
        queryParams.append("is_available", accountAvailability.toString());
      }

      // Sayfalama
      queryParams.append("page", currentPoolPage.toString());
      queryParams.append("limit", poolAccountsPerPage.toString());

      // Hesap tipine göre filtreleme
      if (selectedAccountFilter !== "all") {
        queryParams.append("type", selectedAccountFilter);
      }

      // Email domain'ine göre filtreleme
      if (emailDomainFilter) {
        queryParams.append("email_domain", emailDomainFilter);
      }

      // API'yi çağır
      const response = await fetch(`/api/admin?action=account-pool&${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch account pool: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Hesap havuzu API'den alındı:", data);

      setPoolAccounts(data.accounts || []);
      setTotalPoolCount(data.count || 0);
      setSelectedPoolAccounts([]);

      // Eski hesap sayısını da alalım
      const oldCountResponse = await fetch("/api/admin?action=old-accounts-count&days=15");
      if (!oldCountResponse.ok) {
        throw new Error(`Failed to fetch old accounts count: ${oldCountResponse.status}`);
      }

      const oldCountData = await oldCountResponse.json();
      setOldAccountsCount(oldCountData.count || 0);
    } catch (error) {
      console.error("Hesap havuzunu getirirken hata:", error);
      toast.error("Hesap havuzu yüklenirken bir hata oluştu.");
    } finally {
      setIsLoadingPoolAccounts(false);
    }
  }

  // Hesap türüne göre filtreleme değiştiğinde hesapları yeniden getir
  useEffect(() => {
    if (activeTab === "bulk-accounts") {
      setCurrentPoolPage(1); // Sayfa 1'e reset
      fetchPoolAccounts();
    }
  }, [accountAvailability, selectedAccountFilter]);

  // Domain filtre butonu ile aramayı tetikle
  const handleDomainSearch = () => {
    const newDomainFilter = tempEmailDomainFilter;
    setEmailDomainFilter(newDomainFilter);
    setCurrentPoolPage(1); // Sayfa 1'e reset

    // Güncel domain filtresi ile fetchPoolAccounts çağrılıyor
    const queryParams = new URLSearchParams();

    // Hesap durumuna göre filtreleme
    if (accountAvailability !== null) {
      queryParams.append("is_available", accountAvailability.toString());
    }

    // Sayfalama
    queryParams.append("page", "1"); // Sayfa 1'e reset edildiği için 1 kullanıyoruz
    queryParams.append("limit", poolAccountsPerPage.toString());

    // Hesap tipine göre filtreleme
    if (selectedAccountFilter !== "all") {
      queryParams.append("type", selectedAccountFilter);
    }

    // Email domain'ine göre filtreleme - tempEmailDomainFilter kullanıyoruz
    if (newDomainFilter) {
      queryParams.append("email_domain", newDomainFilter);
    }

    // API'yi çağır
    setIsLoadingPoolAccounts(true);
    fetch(`/api/admin?action=account-pool&${queryParams.toString()}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch account pool: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Hesap havuzu API'den alındı:", data);
        setPoolAccounts(data.accounts || []);
        setTotalPoolCount(data.count || 0);
        setSelectedPoolAccounts([]);
      })
      .catch((error) => {
        console.error("Hesap havuzunu getirirken hata:", error);
        toast.error("Hesap havuzu yüklenirken bir hata oluştu.");
      })
      .finally(() => {
        setIsLoadingPoolAccounts(false);
      });
  };

  // Tüm havuz hesaplarını seçme veya seçimi kaldırma
  function toggleAllPoolAccountSelection() {
    if (selectedPoolAccounts.length === poolAccounts.length) {
      // Tüm seçimleri kaldır
      setSelectedPoolAccounts([]);
    } else {
      // Tüm hesapları seç
      setSelectedPoolAccounts(poolAccounts.map((account) => account.id));
    }
  }

  // Tek bir havuz hesabını seçme veya seçimini kaldırma
  function togglePoolAccountSelection(accountId: string) {
    setSelectedPoolAccounts((prev) => {
      if (prev.includes(accountId)) {
        return prev.filter((id) => id !== accountId);
      } else {
        return [...prev, accountId];
      }
    });
  }

  // Seçili havuz hesaplarını silme işlemi
  async function handleDeleteSelectedAccounts() {
    if (selectedPoolAccounts.length === 0) {
      toast.error("Lütfen silinecek hesapları seçin");
      return;
    }

    if (!confirm(`${selectedPoolAccounts.length} hesabı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    setIsDeletingSelectedAccounts(true);
    try {
      // Burada API'nize uygun şekilde silme işlemi için bir fonksiyon çağrılmalı
      const response = await fetch("/api/admin?action=delete-pool-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountIds: selectedPoolAccounts,
          userEmail: session?.user?.email,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(`${selectedPoolAccounts.length} hesap başarıyla silindi`);
        setSelectedPoolAccounts([]);
        fetchPoolAccounts(); // Listeyi güncelle
      } else {
        console.error("Hesapları silerken hata:", data.error);
        toast.error(`Hesaplar silinirken bir hata oluştu: ${data.error || "Bilinmeyen hata"}`);
      }
    } catch (error) {
      console.error("Hesapları silerken beklenmeyen hata:", error);
      toast.error("Hesapları silerken beklenmeyen bir hata oluştu.");
    } finally {
      setIsDeletingSelectedAccounts(false);
    }
  }

  // 15 günden eski bir hesap mu kontrolü
  const isOldAccount = (date: string) => {
    const accountDate = new Date(date);
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 15);
    return accountDate < thresholdDate;
  };

  // Eski hesapları silme fonksiyonu (eksik olan fonksiyon)
  async function handleDeleteOldAccounts() {
    if (!confirm("15 günden eski hesaplar silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?")) {
      return;
    }

    try {
      setIsDeletingOldAccounts(true);

      // API'ye istek yap (doğrudan deleteOldPoolAccounts fonksiyonunu çağırmak yerine)
      const response = await fetch("/api/admin?action=delete-old-pool-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ days: 15 }),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast.success(`${result.count || 0} eski hesap başarıyla silindi.`);
        fetchPoolAccounts(); // Listeyi güncelle
      } else {
        console.error("Eski hesapları silerken hata:", result);
        toast.error(`Eski hesaplar silinirken bir hata oluştu: ${result.message || "Bilinmeyen hata"}`);
      }
    } catch (error) {
      console.error("Eski hesapları silerken beklenmeyen hata:", error);
      toast.error("Eski hesapları silerken beklenmeyen bir hata oluştu.");
    } finally {
      setIsDeletingOldAccounts(false);
    }
  }

  async function generateAccountsJson() {
    try {
      setIsCopyingJson(true);
      setCopiedJson("");
      console.log("JSON oluşturma başlatıldı, type:", jsonCopyType);

      // API parametrelerini hazırlayalım
      const params = new URLSearchParams();

      // Hesap durumuna göre filtreleme
      params.append("action", "export-accounts");

      // Sadece kullanılabilir hesapları al
      params.append("is_available", "true");

      // Hesap tipine göre filtreleme
      if (jsonCopyType) {
        params.append("type", jsonCopyType);
      }

      // Domain filtresi varsa ekle
      if (jsonCopyMode === "domain" && tempEmailDomainFilter) {
        params.append("mode", "domain");
        params.append("domain", tempEmailDomainFilter);
      } else {
        params.append("mode", "all");
      }

      // API'yi çağır
      const response = await fetch(`/api/admin?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("JSON verisi alındı, hesap sayısı:", data.accounts?.length || 0);

      if (!data.accounts || data.accounts.length === 0) {
        toast.error("Uygun kriterlerde hesap bulunamadı");
        setIsCopyingJson(false);
        return;
      }

      // Hesapları JSON formatında hazırlayalım
      const accountsJson = data.accounts.map((acc: any) => {
        const account: {
          email: string;
          password: string;
          token?: string;
          addon?: string;
        } = {
          email: acc.email,
          password: acc.password,
        };

        // Sadece değeri olan token ve addon'ları ekle
        if (acc.token) account.token = acc.token;
        if (acc.addon) account.addon = acc.addon;

        return account;
      });

      // JSON string'e çevir
      const jsonString = JSON.stringify(accountsJson, null, 2);
      setCopiedJson(jsonString);

      // Çok uzunsa 100 hesaba kadar göster
      if (accountsJson.length > 100) {
        toast(`${accountsJson.length} hesap bulundu. İlk 100 tanesi gösteriliyor.`);
      }
    } catch (error) {
      console.error("JSON oluşturma hatası:", error);
      toast.error("Hesapları JSON formatına dönüştürürken bir hata oluştu");
    } finally {
      setIsCopyingJson(false);
    }
  }

  // Kopyalama fonksiyonu
  function copyToClipboard() {
    navigator.clipboard
      .writeText(copiedJson)
      .then(() => {
        toast.success("JSON başarıyla panoya kopyalandı!");
      })
      .catch((err) => {
        console.error("Kopyalama hatası:", err);
        toast.error("Kopyalama sırasında bir hata oluştu.");
      });
  }

  // Kullanıcıyı banla
  async function handleBanUser() {
    if (!searchResult) return;

    try {
      const success = await banUser(searchResult.id);

      if (success) {
        toast.success("Kullanıcı başarıyla banlandı");
        setSearchResult({
          ...searchResult,
          is_banned: true,
        });
      } else {
        toast.error("Kullanıcı banlanırken bir hata oluştu");
      }
    } catch (error) {
      console.error("Kullanıcı banlama hatası:", error);
      toast.error("Kullanıcı banlanırken bir hata oluştu");
    }
  }

  // Kullanıcı banını kaldır
  async function handleUnbanUser() {
    if (!searchResult) return;

    try {
      const success = await unbanUser(searchResult.id);

      if (success) {
        toast.success("Kullanıcı banı başarıyla kaldırıldı");
        setSearchResult({
          ...searchResult,
          is_banned: false,
        });
      } else {
        toast.error("Kullanıcı banı kaldırılırken bir hata oluştu");
      }
    } catch (error) {
      console.error("Kullanıcı banı kaldırma hatası:", error);
      toast.error("Kullanıcı banı kaldırılırken bir hata oluştu");
    }
  }

  // Demo kredi ayarlarını getiren fonksiyon
  async function fetchDemoCreditSettings() {
    setIsUpdatingCredit(true);
    try {
      const response = await fetch(`/api/admin?action=demo-credit`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === "success" && data.settings) {
        setDemoCreditSettings(data.settings);
        setNewDemoCredit(data.settings.value); // newDemoCredit'i mevcut ayarların değeriyle güncelle
      } else {
        console.error("Demo kredi ayarları alınamadı:", data);
        toast.error("Demo kredi ayarları alınamadı");
      }
    } catch (error) {
      console.error("Demo kredi ayarlarını getirirken hata:", error);
      toast.error("Demo kredi ayarlarını getirirken bir hata oluştu");
    } finally {
      setIsUpdatingCredit(false);
    }
  }

  // Demo kredi ayarlarını güncelleyen fonksiyon
  async function handleUpdateDemoCredit() {
    try {
      setIsUpdatingCredit(true);

      // Input değerlerini kontrol et
      if (newDemoCredit < 0) {
        toast.error("Kredi değeri negatif olamaz");
        return;
      }

      if (demoCreditSettings && demoCreditSettings.limit < 0) {
        toast.error("Kredi limiti negatif olamaz");
        return;
      }

      // Mevcut ayarları kullan, yoksa yeni oluştur
      const currentSettings = demoCreditSettings || {
        enabled: true,
        value: 1,
        limit: 10,
        used: 0,
      };

      // Değer veya limit değiştiyse used'ı sıfırla
      const shouldResetUsed = currentSettings.value !== newDemoCredit || (demoCreditSettings && currentSettings.limit !== demoCreditSettings.limit);

      // Yeni API endpoint'ini kullan - supabaseAdmin ile işlem yapar
      const response = await fetch(`/api/admin?action=demo-credit-update&enabled=${currentSettings.enabled}&value=${newDemoCredit}&limit=${demoCreditSettings ? demoCreditSettings.limit : currentSettings.limit}&used=${currentSettings.used}&resetUsed=${shouldResetUsed}`);

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast.success(result.message || "Demo kredi ayarları başarıyla güncellendi");
        setDemoCreditSettings(result.settings);
      } else {
        console.error("API error:", result);
        toast.error(result.error || "Demo kredi ayarları güncellenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error updating demo credit settings:", error);
      toast.error("Demo kredi ayarları güncellenirken bir hata oluştu");
    } finally {
      setIsUpdatingCredit(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  if (!adminStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erişim Engellendi</h2>
          <p className="text-gray-600 mb-4">Bu sayfayı görüntülemek için admin yetkileri gerekiyor.</p>
          <p className="text-gray-400 text-sm">Ana sayfaya yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white py-4 px-6 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          {/* Kullanıcı bilgisi */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                {session?.user?.image ? (
                  <img src={session.user.image} alt={session?.user?.name || ""} className="w-10 h-10 rounded-full" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">{session?.user?.name}</div>
                <div className="text-xs text-gray-500">{session?.user?.email}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Ana içerik */}
      <div className="flex-1 flex flex-col lg:flex-row bg-gray-50">
        {/* Sol taraf - Navigation */}
        <nav className="w-full lg:w-64 bg-white border-b lg:border-r lg:border-b-0 border-gray-200 p-4">
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible whitespace-nowrap lg:whitespace-normal space-x-2 lg:space-x-0 lg:space-y-2">
            {/* Dashboard */}
            <button onClick={() => setActiveTab("dashboard")} className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === "dashboard" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden md:inline">Dashboard</span>
            </button>

            {/* Çoklu Account Ekleme */}
            <button onClick={() => setActiveTab("add-accounts")} className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === "add-accounts" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden md:inline">Hesap Ekle</span>
            </button>

            {/* Çoklu Account Havuzu */}
            <button onClick={() => setActiveTab("bulk-accounts")} className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === "bulk-accounts" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="hidden md:inline">Hesap Havuzu</span>
            </button>

            {/* Kredi Yönetimi */}
            <button onClick={() => setActiveTab("credit-management")} className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === "credit-management" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden md:inline">Kredi Yönetimi</span>
            </button>

            {/* Demo Kredi */}
            <button onClick={() => setActiveTab("demo-credit")} className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === "demo-credit" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden md:inline">Demo Kredi</span>
            </button>

            {/* İnaktif Kullanıcılar */}
            <button onClick={() => setActiveTab("inactive-users")} className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === "inactive-users" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden md:inline">İnaktif Kullanıcılar</span>
            </button>

            {/* Kredi İşlemleri */}
            <button onClick={() => setActiveTab("credit-transactions")} className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === "credit-transactions" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="hidden md:inline">Kredi İşlemleri</span>
            </button>
          </div>
        </nav>

        {/* Sağ taraf - İçerik */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-4 text-xl text-gray-700">Yükleniyor...</span>
            </div>
          ) : (
            <>
              {/* Dashboard sekmesi */}
              {activeTab === "dashboard" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Sistem İstatistikleri</h2>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {/* Toplam Kullanıcı Kartı */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Toplam Kullanıcı</dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">{users.length}</dd>
                        </dl>
                      </div>
                    </div>

                    {/* Toplam Hesap Kartı */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Toplam Hesap</dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">{accounts.length}</dd>
                        </dl>
                      </div>
                    </div>

                    {/* Toplam Kredi Kartı */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Toplam Kredi</dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalCredits.toFixed(1)}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Çoklu Account Havuzu sekmesi */}
              {activeTab === "bulk-accounts" && (
                <div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Hesap Havuzu Yönetimi</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Toplam: <span className="font-medium">{totalPoolCount}</span> hesap
                        {oldAccountsCount > 0 && (
                          <span className="ml-3 text-red-600">
                            (<span className="font-medium">{oldAccountsCount}</span> eski hesap)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center">
                        <div className="flex border rounded-md overflow-hidden">
                          <button onClick={() => setAccountAvailability(true)} className={`px-4 py-2 text-sm ${accountAvailability === true ? "bg-blue-500 text-white font-medium" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                            Kullanılabilir
                          </button>
                          <button onClick={() => setAccountAvailability(false)} className={`px-4 py-2 text-sm ${accountAvailability === false ? "bg-blue-500 text-white font-medium" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                            Kullanılmış
                          </button>
                        </div>
                      </div>

                      <button onClick={() => setShowJsonModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        JSON Olarak Kopyala
                      </button>

                      <button
                        onClick={handleDeleteOldAccounts}
                        disabled={isDeletingOldAccounts || oldAccountsCount === 0}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {isDeletingOldAccounts ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Siliniyor...
                          </>
                        ) : (
                          <>Eski Hesapları Sil ({oldAccountsCount})</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Yeni Filtreleme Arayüzü */}
                  <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="account-type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                          Hesap Türüne Göre Filtrele
                        </label>
                        <select id="account-type-filter" value={selectedAccountFilter} onChange={(e) => setSelectedAccountFilter(e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 font-medium">
                          <option value="all">Tüm Hesaplar</option>
                          {accountTypes.map((type) => (
                            <option key={type.id} value={type.type}>
                              {type.type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="email-domain-filter" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Domain'ine Göre Filtrele
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">@</span>
                          <input
                            type="text"
                            id="email-domain-filter"
                            value={tempEmailDomainFilter}
                            onChange={(e) => setTempEmailDomainFilter(e.target.value)}
                            placeholder="gmail.com"
                            className="block w-full min-w-0 flex-1 border border-l-0 border-r-0 border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 text-gray-900 font-medium"
                          />
                          <button onClick={handleDomainSearch} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={handleDeleteSelectedAccounts}
                          disabled={isDeletingSelectedAccounts || selectedPoolAccounts.length === 0}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeletingSelectedAccounts ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Siliniyor...
                            </>
                          ) : (
                            <>Seçili Hesapları Sil ({selectedPoolAccounts.length})</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Hesap Havuzu Tablosu */}
                  {isLoadingPoolAccounts ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                      <span className="ml-4 text-lg text-gray-700">Hesaplar yükleniyor...</span>
                    </div>
                  ) : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center">
                                  <input id="select-all-pool-accounts" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={poolAccounts.length > 0 && selectedPoolAccounts.length === poolAccounts.length} onChange={toggleAllPoolAccountSelection} />
                                </div>
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hesap Tipi
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Şifre
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Durum
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Oluşturulma Tarihi
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {poolAccounts.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                  {accountAvailability === true ? "Kullanılabilir hesap bulunamadı." : accountAvailability === false ? "Kullanılmış hesap bulunamadı." : "Hesap bulunamadı."}
                                </td>
                              </tr>
                            ) : (
                              poolAccounts.map((account) => {
                                const isOld = isOldAccount(account.created_at);
                                return (
                                  <tr key={account.id} className={`${isOld ? "bg-red-50" : "bg-white"} hover:bg-gray-50 transition-colors`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={selectedPoolAccounts.includes(account.id)} onChange={() => togglePoolAccountSelection(account.id)} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">{account.type}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{account.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{account.password}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${account.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{account.is_available ? "Kullanılabilir" : "Kullanılmış"}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      <div className="flex items-center">
                                        <span className={isOld ? "text-red-600 font-medium" : ""}>{new Date(account.created_at).toLocaleDateString()}</span>
                                        {isOld && <span className="ml-2 text-xs text-red-600">(15 günden eski)</span>}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Pagination Eklenmiş Bölüm */}
                  {totalPoolCount > poolAccountsPerPage && (
                    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{(currentPoolPage - 1) * poolAccountsPerPage + 1}</span>
                            {" - "}
                            <span className="font-medium">{Math.min(currentPoolPage * poolAccountsPerPage, totalPoolCount)}</span>
                            {" / "}
                            <span className="font-medium">{totalPoolCount}</span>
                            {" hesap"}
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Sayfalama">
                            <button
                              onClick={() => setCurrentPoolPage((prev) => Math.max(prev - 1, 1))}
                              disabled={currentPoolPage === 1}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="sr-only">Önceki</span>
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L7.382 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>

                            {/* Sayfa numaraları */}
                            {Array.from({ length: Math.min(5, Math.ceil(totalPoolCount / poolAccountsPerPage)) }, (_, i) => {
                              // Merkezi sayfalama mantığı - mevcut sayfayı ortada tut
                              let pageNum;

                              if (Math.ceil(totalPoolCount / poolAccountsPerPage) <= 5) {
                                // 5 veya daha az sayfa varsa, doğrudan sayfa numarasını göster
                                pageNum = i + 1;
                              } else {
                                // 5'ten fazla sayfa varsa, merkezi sayfalama uygula
                                if (currentPoolPage <= 3) {
                                  // İlk sayfalarda ise 1,2,3,4,5 göster
                                  pageNum = i + 1;
                                } else if (currentPoolPage >= Math.ceil(totalPoolCount / poolAccountsPerPage) - 2) {
                                  // Son sayfalarda ise son 5 sayfayı göster
                                  pageNum = Math.ceil(totalPoolCount / poolAccountsPerPage) - 4 + i;
                                } else {
                                  // Ortadaki sayfalarda ise mevcut sayfayı ortada tut
                                  pageNum = currentPoolPage - 2 + i;
                                }
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPoolPage(pageNum)}
                                  className={`relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium ${currentPoolPage === pageNum ? "z-10 bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}

                            <button
                              onClick={() => setCurrentPoolPage((prev) => Math.min(prev + 1, Math.ceil(totalPoolCount / poolAccountsPerPage)))}
                              disabled={currentPoolPage >= Math.ceil(totalPoolCount / poolAccountsPerPage)}
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="sr-only">Sonraki</span>
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </nav>
                        </div>
                      </div>

                      {/* Mobil Pagination */}
                      <div className="flex items-center justify-between w-full sm:hidden">
                        <div className="w-0 flex-1">
                          <button
                            onClick={() => setCurrentPoolPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPoolPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Önceki
                          </button>
                        </div>
                        <div className="w-auto">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{currentPoolPage}</span>
                            {" / "}
                            <span className="font-medium">{Math.ceil(totalPoolCount / poolAccountsPerPage)}</span>
                          </p>
                        </div>
                        <div className="w-0 flex-1 flex justify-end">
                          <button
                            onClick={() => setCurrentPoolPage((prev) => Math.min(prev + 1, Math.ceil(totalPoolCount / poolAccountsPerPage)))}
                            disabled={currentPoolPage >= Math.ceil(totalPoolCount / poolAccountsPerPage)}
                            className="relative inline-flex items-center px-4 py-2 ml-3 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Sonraki
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Çoklu Hesap Ekleme Sayfası */}
              {activeTab === "add-accounts" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Çoklu Hesap Ekle</h2>
                    <p className="text-sm text-gray-600 mt-1">Havuza toplu hesap eklemek için bu formu kullanın.</p>
                  </div>

                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="mb-4">
                        <label htmlFor="account-type" className="block text-sm font-medium text-gray-700 mb-1">
                          Hesap Tipi
                        </label>
                        <select id="account-type" value={selectedAccountType} onChange={(e) => setSelectedAccountType(e.target.value)} className="block w-full max-w-md border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 font-medium">
                          {accountTypes.map((type) => (
                            <option key={type.id} value={type.type}>
                              {type.type} ({type.credit_cost} kredi)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="bulk-accounts" className="block text-sm font-medium text-gray-700 mb-1">
                          Hesap Bilgileri (Token, Email, Şifre ve isteğe bağlı Addon formatında, her hesap arasında boş satır bırakın)
                        </label>
                        <textarea
                          id="bulk-accounts"
                          value={bulkAccountsInput}
                          onChange={(e) => setBulkAccountsInput(e.target.value)}
                          onBlur={parseAccounts}
                          rows={10}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-gray-900 p-3"
                          placeholder="token&#10;email&#10;şifre&#10;addon (opsiyonel)&#10;&#10;token&#10;email&#10;şifre&#10;addon (opsiyonel)"
                        ></textarea>
                        <p className="mt-1 text-xs text-gray-500">Her hesap için token, email, şifre ve isteğe bağlı addon bilgilerini ayrı satırlarda girin. Farklı hesapları boş bir satırla ayırın.</p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button onClick={parseAccounts} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Önizle
                        </button>

                        <button
                          onClick={handleBulkAddAccounts}
                          disabled={!showPreview || bulkAddLoading || parsedAccounts.length === 0}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {bulkAddLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Ekleniyor...
                            </>
                          ) : (
                            "Hesapları Ekle"
                          )}
                        </button>
                      </div>

                      {/* Önizleme Tablosu */}
                      {showPreview && parsedAccounts.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Önizleme: {parsedAccounts.length} hesap</h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Token
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Şifre
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Addon
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {parsedAccounts.slice(0, 5).map((account, idx) => (
                                  <tr key={idx}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 font-medium truncate max-w-xs">{account.token}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{account.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{account.password}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{account.addon || "-"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {parsedAccounts.length > 5 && <p className="mt-2 text-xs text-gray-600 text-right">{parsedAccounts.length - 5} daha fazla hesap...</p>}
                          </div>
                        </div>
                      )}

                      {/* Sonuç Mesajı */}
                      {bulkAddResult && (
                        <div className={`mt-4 p-4 rounded-md ${bulkAddResult.success ? "bg-green-50" : "bg-red-50"}`}>
                          {bulkAddResult.success ? (
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H3v-2h4V7h2v2h4v2H9v2h2v-2zm0-4H3v-2h4V3h2v2h4v2H9V7h2V5z" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">{bulkAddResult.added} hesap başarıyla eklendi</h3>
                                {bulkAddResult.errors && bulkAddResult.errors.length > 0 && <p className="mt-2 text-sm text-red-700">Bazı hesaplar eklenirken hata oluştu ({bulkAddResult.errors.length} hata)</p>}
                              </div>
                            </div>
                          ) : (
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Hesaplar eklenirken hata oluştu</h3>
                                {bulkAddResult.errors && bulkAddResult.errors.length > 0 && (
                                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                                    {bulkAddResult.errors.slice(0, 3).map((error, idx) => (
                                      <li key={idx}>{error.email ? `${error.email}: ${error.error}` : error.error}</li>
                                    ))}
                                    {bulkAddResult.errors.length > 3 && <li>... ve {bulkAddResult.errors.length - 3} hata daha</li>}
                                  </ul>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Kredi Yönetimi sekmesi */}
              {activeTab === "credit-management" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Kredi Yönetimi</h2>
                    <p className="text-sm text-gray-600 mt-1">Kullanıcılara kredi ekleyebilir veya çıkarabilirsiniz.</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">
                            Kullanıcı E-posta Adresi
                          </label>
                          <input
                            type="email"
                            id="user-email"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 text-gray-900 font-medium"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            placeholder="ornek@mail.com"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={handleSearchUser}
                          >
                            Kullanıcı Ara
                          </button>
                        </div>
                      </div>

                      {searchMessage && (
                        <div className={`mt-4 p-4 rounded-md ${searchMessageType === "success" ? "bg-green-50" : searchMessageType === "info" ? "bg-blue-50" : "bg-red-50"}`}>
                          <div className="flex">
                            <div className="flex-shrink-0">
                              {searchMessageType === "success" ? (
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H3v-2h4V7h2v2h4v2H9v2h2v-2zm0-4H3v-2h4V3h2v2h4v2H9V7h2V5z" />
                                </svg>
                              ) : searchMessageType === "info" ? (
                                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="ml-3">
                              <h3 className={`text-sm font-medium ${searchMessageType === "success" ? "text-green-800" : searchMessageType === "info" ? "text-blue-800" : "text-red-800"}`}>{searchMessage}</h3>
                            </div>
                          </div>
                        </div>
                      )}

                      {searchResult && (
                        <div className="border-t border-gray-200 pt-6 mt-6">
                          <h3 className="text-base font-medium text-gray-900 mb-4">Kullanıcı Bilgileri</h3>

                          <div className="flex flex-col md:flex-row md:items-center">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {searchResult.avatar_url ? (
                                  <img className="h-10 w-10 rounded-full object-cover" src={searchResult.avatar_url} alt="" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">{(searchResult.name || searchResult.email || "").charAt(0).toUpperCase()}</div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{searchResult.name || "İsimsiz"}</div>
                                <div className="text-sm text-gray-900">{searchResult.email}</div>
                              </div>
                            </div>
                            <div className="mt-4 md:mt-0 md:ml-auto">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-800 font-semibold">Mevcut Kredi:</span>
                                <span className="font-bold text-blue-600">{searchResult.credit.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 border-t border-gray-200 pt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Hesap Durumu</h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-700 mr-2">
                                {searchResult.is_banned ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Banlı</span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktif</span>
                                )}
                              </span>

                              {searchResult.is_banned ? (
                                <button
                                  type="button"
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                  onClick={handleUnbanUser}
                                >
                                  Ban Kaldır
                                </button>
                              ) : (
                                <button type="button" className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" onClick={handleBanUser}>
                                  Kullanıcıyı Banla
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                              <div className="md:col-span-3">
                                <label htmlFor="credit-amount" className="block text-sm font-medium text-gray-700 mb-1">
                                  Kredi Miktarı
                                </label>
                                <input
                                  type="number"
                                  id="credit-amount"
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 text-gray-900 font-medium"
                                  value={creditAmount}
                                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                                  placeholder="10"
                                  min="0"
                                  step="0.1"
                                />
                              </div>
                              <div className="flex items-end">
                                <button
                                  type="button"
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                  onClick={handleUpdateCredit}
                                >
                                  Kredi Güncelle
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* İnaktif Kullanıcılar Sekmesi */}
              {activeTab === "inactive-users" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900">İnaktif Kullanıcılar</h2>
                    <p className="text-sm text-gray-600 mt-1">Uzun süredir giriş yapmayan kullanıcıları görüntüleyin ve yönetin.</p>
                  </div>

                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4 mb-6">
                        <div>
                          <label htmlFor="inactivity-days" className="block text-sm font-medium text-gray-700 mb-1">
                            İnaktif Gün Sayısı
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <input type="number" id="inactivity-days" value={inactivityDays} onChange={(e) => setInactivityDays(Number(e.target.value))} min="1" className="block w-full border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 font-medium" />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Bu gün sayısından daha uzun süredir giriş yapmayan kullanıcılar listelenir.</p>
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={fetchInactiveUsers}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {isLoadingInactiveUsers ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Yükleniyor...
                              </>
                            ) : (
                              "Kullanıcıları Getir"
                            )}
                          </button>
                        </div>

                        {selectedInactiveUsers.length > 0 && (
                          <div className="flex items-end ml-auto">
                            <button
                              type="button"
                              onClick={handleDeleteInactiveUsers}
                              disabled={isDeletingInactive}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isDeletingInactive ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Siliniyor...
                                </>
                              ) : (
                                <>Seçili Kullanıcıları Sil ({selectedInactiveUsers.length})</>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Silme Sonucu Mesajı */}
                      {userDeleteResult && (
                        <div className={`mb-6 p-4 rounded-md ${userDeleteResult.success ? "bg-green-50" : "bg-red-50"}`}>
                          <div className="flex">
                            <div className="flex-shrink-0">
                              {userDeleteResult.success ? (
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H3v-2h4V7h2v2h4v2H9v2h2v-2zm0-4H3v-2h4V3h2v2h4v2H9V7h2V5z" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="ml-3">
                              <h3 className={`text-sm font-medium ${userDeleteResult.success ? "text-green-800" : "text-red-800"}`}>{userDeleteResult.message}</h3>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Kullanıcılar Tablosu */}
                      {isLoadingInactiveUsers ? (
                        <div className="text-center py-8 text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p>Yükleniyor...</p>
                        </div>
                      ) : inactiveUsers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p>İnaktif kullanıcı bulunamadı.</p>
                          <p className="text-sm mt-2">Seçilen gün sayısına göre inaktif kullanıcı yok veya henüz sorgulanmadı.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <div className="flex items-center">
                                    <input id="select-all-inactive" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={inactiveUsers.length > 0 && selectedInactiveUsers.length === inactiveUsers.length} onChange={toggleAllInactiveUsers} />
                                  </div>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Kullanıcı
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Son Giriş
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Kredi
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Durum
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {inactiveUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={selectedInactiveUsers.includes(user.id)} onChange={() => toggleInactiveUserSelection(user.id)} />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-10 w-10">
                                        {user.avatar_url ? (
                                          <img className="h-10 w-10 rounded-full object-cover" src={user.avatar_url} alt="" />
                                        ) : (
                                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">{(user.name || user.email || "").charAt(0).toUpperCase()}</div>
                                        )}
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{user.name || "İsimsiz"}</div>
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Hiç giriş yapmadı"}</div>
                                    <div className="text-xs text-gray-500">{user.last_login ? `${Math.floor((Date.now() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24))} gün önce` : ""}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.credit?.toFixed(1) || "0.0"}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_banned ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>{user.is_banned ? "Banlı" : "Aktif"}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Demo Kredi Sekmesi */}
              {activeTab === "demo-credit" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Demo Kredi Ayarları</h2>
                    <p className="text-sm text-gray-600 mt-1">Yeni kayıt olan kullanıcılara verilen demo kredileri yönetin.</p>
                  </div>

                  <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                    <div className="p-6">
                      {isUpdatingCredit ? (
                        <div className="text-center py-8 text-gray-700">
                          <div className="animate-spin h-12 w-12 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full mb-4"></div>
                          <p>Ayarlar yükleniyor...</p>
                        </div>
                      ) : (
                        <>
                          {demoCreditSettings ? (
                            <div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                  <div className="mb-4">
                                    <label htmlFor="credit-value" className="block text-sm font-semibold text-gray-800 mb-2">
                                      Kredi Değeri
                                    </label>
                                    <div className="flex items-center">
                                      <input
                                        type="number"
                                        id="credit-value"
                                        value={newDemoCredit}
                                        onChange={(e) => setNewDemoCredit(Number(e.target.value))}
                                        className="block w-full border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 font-medium h-10 px-3"
                                        min="0"
                                        step="0.1"
                                      />
                                      <span className="inline-flex items-center px-3 h-10 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-700 font-medium">kredi</span>
                                    </div>
                                    {newDemoCredit !== demoCreditSettings.value && (
                                      <p className="mt-2 text-xs font-medium text-blue-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Değişiklik yaptınız. Güncellemeyi kaydetmek için "Ayarları Güncelle" butonuna tıklayın.
                                      </p>
                                    )}
                                  </div>
                                  <div className="mb-4">
                                    <label htmlFor="credit-limit" className="block text-sm font-semibold text-gray-800 mb-2">
                                      Kredi Limiti
                                    </label>
                                    <div className="flex items-center">
                                      <input
                                        type="number"
                                        id="credit-limit"
                                        value={demoCreditSettings.limit}
                                        onChange={(e) => {
                                          if (demoCreditSettings) {
                                            setDemoCreditSettings({
                                              ...demoCreditSettings,
                                              limit: Number(e.target.value),
                                            });
                                          }
                                        }}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 font-medium h-10 px-3"
                                        min="0"
                                        step="1"
                                      />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-600">Limit, sistem tarafından kaç kez demo kredi verilebileceğini belirler.</p>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <div className="flex items-center">
                                    <label className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={demoCreditSettings?.enabled || false}
                                        onChange={(e) => {
                                          if (demoCreditSettings) {
                                            setDemoCreditSettings({
                                              ...demoCreditSettings,
                                              enabled: e.target.checked,
                                            });
                                          }
                                        }}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                      />
                                      <span className="ml-2 text-sm text-gray-700">Demo Kredi Aktif</span>
                                    </label>
                                  </div>
                                  <div className="mt-4">
                                    <div className="bg-gray-100 p-4 rounded-lg">
                                      <h3 className="text-sm font-medium text-gray-700 mb-2">Mevcut Durum</h3>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <p className="text-xs text-gray-500">Değer:</p>
                                          <p className="text-sm font-medium text-gray-900">{demoCreditSettings.value}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Limit:</p>
                                          <p className="text-sm font-medium text-gray-900">{demoCreditSettings.limit}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Kullanılan:</p>
                                          <p className="text-sm font-medium text-gray-900">{demoCreditSettings.used}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Durum:</p>
                                          <p className={`text-sm font-medium ${demoCreditSettings.enabled ? "text-green-600" : "text-red-600"}`}>{demoCreditSettings.enabled ? "Aktif" : "Pasif"}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={handleUpdateDemoCredit}
                                  disabled={isUpdatingCredit}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isUpdatingCredit ? "Güncelleniyor..." : "Ayarları Güncelle"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <p>Demo kredi ayarları bulunamadı.</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Kredi İşlemleri Sekmesi */}
              {activeTab === "credit-transactions" && <CreditTransactions />}
            </>
          )}
        </div>
      </div>

      {/* JSON Kopyalama Modalı */}
      {showJsonModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Hesapları JSON Olarak Kopyala
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Sadece kullanılabilir durumdaki hesaplar gösterilecektir.</p>
                    <div className="mt-4">
                      <label htmlFor="json-type" className="block text-sm font-medium text-gray-700 mb-2">
                        Hesap Türü
                      </label>
                      <select id="json-type" value={jsonCopyType} onChange={(e) => setJsonCopyType(e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 font-medium">
                        <option value="">Tüm Türler</option>
                        {accountTypes.map((type) => (
                          <option key={type.id} value={type.type}>
                            {type.type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kapsam</label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="radio" value="all" checked={jsonCopyMode === "all"} onChange={() => setJsonCopyMode("all")} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                            <span className="ml-2 text-sm text-gray-700">Tüm kullanılabilir hesaplar</span>
                          </label>
                          <label className="flex items-center">
                            <input type="radio" value="domain" checked={jsonCopyMode === "domain"} onChange={() => setJsonCopyMode("domain")} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                            <span className="ml-2 text-sm text-gray-700">Belirli domain (kullanılabilir hesaplar)</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {jsonCopyMode === "domain" && (
                      <div className="mb-4">
                        <label htmlFor="json-domain" className="block text-sm font-medium text-gray-700 mb-2">
                          Domain
                        </label>
                        <input
                          id="json-domain"
                          type="text"
                          value={tempEmailDomainFilter}
                          onChange={(e) => setTempEmailDomainFilter(e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 py-2 px-3"
                          placeholder="gmail.com"
                        />
                      </div>
                    )}

                    <div className="mb-4">
                      <label htmlFor="json-result" className="block text-sm font-medium text-gray-700 mb-2">
                        JSON Çıktısı
                      </label>
                      <div className="relative">
                        <textarea id="json-result" value={copiedJson} readOnly rows={10} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-gray-900 p-3"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={generateAccountsJson}
                  disabled={isCopyingJson || (jsonCopyMode === "domain" && !tempEmailDomainFilter)}
                >
                  {isCopyingJson ? "Yükleniyor..." : "JSON Oluştur"}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={copyToClipboard}
                  disabled={!copiedJson}
                >
                  Panoya Kopyala
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowJsonModal(false)}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
