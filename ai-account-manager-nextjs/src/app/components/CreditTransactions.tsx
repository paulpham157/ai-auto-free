"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  price: number;
  payment_id: string | null;
  package_id: string | null;
  status: string;
  transaction_type: string;
  description: string;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    name: string;
    email: string;
  };
}

interface TransactionFilters {
  userEmail: string;
  startDate: string;
  endDate: string;
}

export default function CreditTransactions() {
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false);
  const [currentTransactionPage, setCurrentTransactionPage] = useState<number>(1);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [totalTransactionPages, setTotalTransactionPages] = useState<number>(1);
  const [transactionFilters, setTransactionFilters] = useState<TransactionFilters>({
    userEmail: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchCreditTransactions();
  }, []);

  // Kredi işlemlerini getiren fonksiyon
  const fetchCreditTransactions = async (page = 1, filters = transactionFilters) => {
    setIsLoadingTransactions(true);
    try {
      // URL parametrelerini oluştur
      let url = `/api/admin?action=credit-transactions&page=${page}&limit=10`;

      if (filters.userEmail) {
        url += `&userEmail=${encodeURIComponent(filters.userEmail)}`;
      }

      if (filters.startDate) {
        url += `&startDate=${encodeURIComponent(filters.startDate)}`;
      }

      if (filters.endDate) {
        url += `&endDate=${encodeURIComponent(filters.endDate)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === "success") {
        setCreditTransactions(data.data || []);
        setTotalTransactions(data.pagination.total || 0);
        setTotalTransactionPages(data.pagination.totalPages || 1);
        setCurrentTransactionPage(page);
      } else {
        console.error("Kredi işlemleri alınamadı:", data);
        toast.error("Kredi işlemleri alınamadı");
      }
    } catch (error) {
      console.error("Kredi işlemlerini getirirken hata:", error);
      toast.error("Kredi işlemlerini getirirken bir hata oluştu");
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Sayfalama için fonksiyonlar
  const goToNextPage = () => {
    if (currentTransactionPage < totalTransactionPages) {
      fetchCreditTransactions(currentTransactionPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentTransactionPage > 1) {
      fetchCreditTransactions(currentTransactionPage - 1);
    }
  };

  // Filtreleri uygula
  const applyFilters = () => {
    fetchCreditTransactions(1, transactionFilters);
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setTransactionFilters({
      userEmail: "",
      startDate: "",
      endDate: "",
    });
    fetchCreditTransactions(1, {
      userEmail: "",
      startDate: "",
      endDate: "",
    });
  };

  // Tarih formatını düzenle
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Kredi İşlemleri</h2>
        <p className="text-sm text-gray-600 mt-1">Kullanıcıların kredi işlemlerini görüntüleyin.</p>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 border border-gray-100">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtreler</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="userEmail" className="block text-sm font-semibold text-gray-800 mb-2">
                Kullanıcı E-posta
              </label>
              <input
                type="text"
                id="userEmail"
                value={transactionFilters.userEmail}
                onChange={(e) => setTransactionFilters({ ...transactionFilters, userEmail: e.target.value })}
                className="shadow-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md py-2 px-3 text-gray-900 transition-all duration-200 hover:border-blue-300 bg-white"
                placeholder="Kullanıcı e-posta adresi"
              />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-semibold text-gray-800 mb-2">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                id="startDate"
                value={transactionFilters.startDate}
                onChange={(e) => setTransactionFilters({ ...transactionFilters, startDate: e.target.value })}
                className="shadow-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md py-2 px-3 text-gray-900 transition-all duration-200 hover:border-blue-300 bg-white"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-semibold text-gray-800 mb-2">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                id="endDate"
                value={transactionFilters.endDate}
                onChange={(e) => setTransactionFilters({ ...transactionFilters, endDate: e.target.value })}
                className="shadow-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md py-2 px-3 text-gray-900 transition-all duration-200 hover:border-blue-300 bg-white"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-md text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              Filtreleri Temizle
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Filtrele
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
        <div className="p-6">
          {/* İşlemler Tablosu */}
          {isLoadingTransactions ? (
            <div className="text-center py-8 text-gray-500">
              <div className="flex justify-center">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="mt-2">Yükleniyor...</p>
            </div>
          ) : creditTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>Kayıt bulunamadı</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlem ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Miktar
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat (₺)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paket
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.users?.email || "Bilinmiyor"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.price || "0"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === "completed" ? "bg-green-100 text-green-800" : transaction.status === "pending" ? "bg-yellow-100 text-yellow-800" : transaction.status === "failed" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {transaction.status || "Belirsiz"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.package_id || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(transaction.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Sayfalama */}
          {totalTransactionPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={goToPrevPage}
                  disabled={currentTransactionPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentTransactionPage === totalTransactionPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{totalTransactions}</span> işlemden <span className="font-medium">{(currentTransactionPage - 1) * 10 + 1}</span> - <span className="font-medium">{Math.min(currentTransactionPage * 10, totalTransactions)}</span> arası gösteriliyor
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentTransactionPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Önceki</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Sayfa numaraları */}
                    {Array.from({ length: Math.min(5, totalTransactionPages) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => fetchCreditTransactions(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border ${currentTransactionPage === pageNumber ? "z-10 bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"} text-sm font-medium transition-colors duration-200`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={goToNextPage}
                      disabled={currentTransactionPage === totalTransactionPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Sonraki</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
