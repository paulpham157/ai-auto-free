import { createClient } from '@supabase/supabase-js';

// Supabase API URL ve anahtarını .env.local dosyasından alıyoruz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Servis anahtarını kontrol et
console.log('Supabase Service Key exists:', !!supabaseServiceKey);
console.log('Supabase URL exists:', !!supabaseUrl);

// Supabase istemcisini oluşturuyoruz
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service Role kullanarak admin yetkilerine sahip istemci oluşturuyoruz
// Bu istemci sadece server-side'da çalışır ve RLS kısıtlamalarını atlar
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

// Servis rolü bağlantısını kontrol et
(async function checkAdminConnection() {
  try {
    console.log("Checking admin connection to Supabase...");

    if (!supabaseServiceKey) {
      console.error("CRITICAL ERROR: Service role key is missing, admin functions won't work");
      return;
    }

    // Basit bir test sorgusu yapalım
    const { count, error } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("CRITICAL ERROR: Admin connection test failed:", error);
    } else {
      console.log("Admin connection OK. Found " + count + " users in database.");
    }
  } catch (e) {
    console.error("Admin connection check exception:", e);
  }
})();

// Kullanıcı tipi tanımlaması
export type User = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  credit: number;
  created_at: string;
  updated_at: string;
  role: string;
  last_login?: string | null; // Optional last_login field
  banned?: boolean; // Kullanıcının banlı olup olmadığını belirten alan
  is_banned?: boolean; // Veritabanındaki alan adı
};

// Hesap tipi tanımlaması
export type Account = {
  id: string;
  user_id: string;
  type: string;
  email: string;
  password: string;
  created_at: string;
  token?: string | null; // Opsiyonel token alanı ekledim
  addon?: string | null; // Opsiyonel token alanı ekledim
  remaining_limit?: number | null; // Opsiyonel kalan limit alanı
};

// Hesap havuzu için tip tanımlaması
export type AccountPool = {
  id: string;
  type: string;
  token: string | null;
  email: string;
  password: string;
  is_available: boolean;
  created_at: string;
  addon: string | null;
};

// Hesap ayarları için tip tanımlaması
export type AccountSetting = {
  id: string;
  type: string;
  credit_cost: number;
  description: string | null;
  created_at: string;
  updated_at: string;
};

// Admin settings tipi
export type AdminSetting = {
  id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
};

// Demo kredi ayarları tipi
export type DemoCreditSetting = {
  enabled: boolean;
  value: number;
  limit: number;
  used: number;
};

// Önbellek süresi (30 saniye)
const CACHE_DURATION = 30 * 1000;

// Önbellek nesnesi
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache: {
  accountPoolStats?: CacheItem<{type: string, available: number, total: number}[]>;
  availableCounts?: { [key: string]: CacheItem<number> };
} = {
  availableCounts: {}
};

// Kullanıcı kaydetme fonksiyonu
export async function saveUser(user: {
  email: string;
  name?: string | null;
  avatar_url?: string | null;
}): Promise<User | null> {
  try {
    console.log('saveUser called with:', JSON.stringify(user, null, 2));

    if (!user.email) {
      console.error('saveUser called with empty email');
      return null;
    }

    // Supabase bağlantılarını kontrol et
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('saveUser: Supabase config error, URL or key missing');
      console.log('URL exists:', !!supabaseUrl, ', Anon key exists:', !!supabaseAnonKey);
      return null;
    }

    // ADMIN ROLE ile kullanıcıyı kontrol et
    const adminCheckedUser = await getUserByEmail(user.email);
    console.log('Admin role user check result:', adminCheckedUser ? 'User found' : 'User not found');

    // Kullanıcı varsa güncelle, yoksa oluştur
    if (adminCheckedUser) {
      console.log('Updating existing user with admin role:', adminCheckedUser.id);
      // Kullanıcı bilgilerini güncelliyoruz
      try {
        const updateResult = await supabaseAdmin
          .from('users')
          .update({
            name: user.name || adminCheckedUser.name,
            avatar_url: user.avatar_url || adminCheckedUser.avatar_url,
            updated_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          })
          .eq('email', user.email)
          .select()
          .single();

        if (updateResult.error) {
          console.error('Error updating user with admin role:', updateResult.error);
          throw updateResult.error;
        }

        console.log('User updated successfully with admin role');
        return updateResult.data as User;
      } catch (updateError) {
        console.error('Critical error during admin user update:', updateError);
        throw updateError;
      }
    } else {
      console.log('Creating new user with admin role. Email:', user.email);
      // Yeni kullanıcı için başlangıç kredisini belirle
      let initialCredit = 0.0;

      try {
        // Demo kredi özelliğini kontrol et
        const demoCreditAvailable = await isDemoCreditAvailable();
        console.log('Demo credit available:', demoCreditAvailable);

        if (demoCreditAvailable) {
          const demoCredit = await getDemoCreditSetting();
          console.log('Demo credit settings:', demoCredit);

          if (demoCredit && demoCredit.enabled) {
            initialCredit = demoCredit.value;
            console.log('Setting initial credit to:', initialCredit);

            // Demo kredi kullanımını artır
            const incremented = await incrementDemoCreditUsed();
            console.log('Demo credit usage incremented:', incremented);
          }
        }
      } catch (demoError) {
        console.error('Error checking demo credits:', demoError);
        // Demo kredi özelliği çalışmasa bile kullanıcıyı kaydetmeye devam et
      }

      // Kullanıcı yoksa, yeni bir kullanıcı oluşturuyoruz
      const newUserData = {
        email: user.email,
        name: user.name || null,
        avatar_url: user.avatar_url || null,
        credit: initialCredit,
        last_login: new Date().toISOString(),
        role: 'user', // Varsayılan rol ekleniyor
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Inserting new user with admin role. Data:', JSON.stringify(newUserData, null, 2));

      try {
        // Service role kullanarak RLS kısıtlamalarını atlayarak ekleyelim
        const insertResult = await supabaseAdmin
          .from('users')
          .insert(newUserData)
          .select()
          .single();

        if (insertResult.error) {
          console.error('Error inserting new user with admin role:', insertResult.error);
          throw insertResult.error;
        }

        console.log('New user created successfully with admin role. User ID:', insertResult.data?.id);
        return insertResult.data as User;
      } catch (insertError) {
        console.error('Critical error during user creation with admin role:', insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Error saving user to Supabase:', error);
    // Hata durumunda kullanıcı ekranında görülebilmesi için console.log ekliyoruz
    console.log('CRITICAL ERROR in saveUser:', error);
    return null;
  }
}

// Kullanıcı getirme fonksiyonu
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    console.log("getUserByEmail called with:", email);

    if (!email) {
      console.error("Invalid email provided:", email);
      return null;
    }

    // E-posta adresini temizle ve küçük harfe çevir
    const cleanEmail = email.toLowerCase().trim();
    console.log("Cleaned email:", cleanEmail);

    // Admin istemcisini kullanarak RLS politikalarını atla
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .single();

    if (error) {
      console.error("Error in getUserByEmail:", error);
      throw error;
    }

    console.log("User data retrieved:", data ? "Success" : "No user found");
    return data as User;
  } catch (error) {
    console.error('Error fetching user from Supabase:', error);
    return null;
  }
}

// Hesapları getirme fonksiyonu - optimize edilmiş
export async function getAccountsByUserId(
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{accounts: Account[], count: number}> {
  try {
    // Kullanıcı bilgilerini al - service role ile
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return { accounts: [], count: 0 };
    }

    // Kullanıcı banlı ise boş hesap listesi döndür
    if (user.is_banned) {
      console.log('Banned user attempted to fetch accounts:', userId);
      return { accounts: [], count: 0 };
    }

    // Sayfalanmış hesapları getir - service role ile
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Hesap sayısını ayrı bir sorgu ile getir - service role ile
    const { count, error: countError } = await supabaseAdmin
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting accounts:', countError);
      throw countError;
    }

    // Her hesap için token bilgisini getir
    const accountsWithTokens = await Promise.all(data.map(async (account) => {
      try {
        // Aynı email ve type'a sahip pool hesaplarını bul - service role ile
        const { data: poolAccounts, error: poolError } = await supabaseAdmin
          .from('account_pool')
          .select('token')
          .eq('email', account.email)
          .eq('type', account.type)
          .eq('is_available', false);

        if (poolError) {
          console.error('Error fetching token for account:', poolError);
          return account;
        }

        // Birden fazla token bulunduğunda ilkini kullan
        const token = poolAccounts && poolAccounts.length > 0 ? poolAccounts[0]?.token : null;

        if (poolAccounts && poolAccounts.length > 1) {
          console.log(`Found ${poolAccounts.length} tokens for account ${account.email} of type ${account.type}, using the first one.`);
        }

        // Token varsa hesaba ekle
        return {
          ...account,
          token: token || null
        };
      } catch (err) {
        console.error('Error processing account token:', err);
        return account;
      }
    }));

    return { accounts: accountsWithTokens as Account[], count: count || 0 };
  } catch (error) {
    console.error('Error fetching accounts by user ID:', error);
    return { accounts: [], count: 0 };
  }
}

// Hesap detayını getirme fonksiyonu
export async function getAccountById(accountId: string): Promise<Account | null> {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) throw error;
    return data as Account;
  } catch (error) {
    console.error('Error fetching account from Supabase:', error);
    return null;
  }
}

// Tüm hesap türlerini ve maliyetlerini getirme fonksiyonu
export async function getAccountSettings(): Promise<AccountSetting[]> {
  try {
    const { data, error } = await supabase
      .from('account_settings')
      .select('*')
      .order('type');

    if (error) throw error;
    return data as AccountSetting[];
  } catch (error) {
    console.error('Error fetching account settings from Supabase:', error);
    return [];
  }
}

// Belirli bir hesap türünün ayarlarını getirme fonksiyonu
export async function getAccountSettingByType(type: string): Promise<AccountSetting | null> {
  try {
    const { data, error } = await supabase
      .from('account_settings')
      .select('*')
      .eq('type', type)
      .single();

    if (error) throw error;
    return data as AccountSetting;
  } catch (error) {
    console.error('Error fetching account setting from Supabase:', error);
    return null;
  }
}

// Hesap havuzundan uygun hesap alma fonksiyonu
export async function getAvailableAccountFromPool(type: string): Promise<AccountPool | null> {
  try {
    // Transaction başlatıyoruz
    const { data, error } = await supabase
      .from('account_pool')
      .select('*')
      .eq('type', type)
      .eq('is_available', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error) throw error;

    if (data) {
      // Hesabı kullanılabilir olarak işaretliyoruz
      const { error: updateError } = await supabase
        .from('account_pool')
        .update({ is_available: false })
        .eq('id', data.id);

      if (updateError) throw updateError;
    }

    return data as AccountPool;
  } catch (error) {
    console.error('Error fetching account from pool:', error);
    return null;
  }
}

// Kullanıcı kredisini güncelleme fonksiyonu
export async function updateUserCredit(userId: string, creditChange: number): Promise<number> {
  try {
    // Service role ile direkt olarak güncelleme yapalım
    console.log(`Updating credit for user ${userId} by ${creditChange}`);

    // 1. Önce kullanıcıyı alalım ve kontrol edelim
    console.log(`Checking user with ID: ${userId}`);
    const { data: userData, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id, credit')
      .eq('id', userId)
      .maybeSingle();

    // Hata kontrolü
    if (userCheckError) {
      console.error('Database error checking user:', userCheckError);
      throw new Error(`Database error: ${userCheckError.message}`);
    }

    // Kullanıcı bulunamadı kontrolü
    if (!userData) {
      console.error(`User ID ${userId} not found in database`);
      throw new Error(`User with ID ${userId} not found`);
    }

    console.log(`Found user with current credit: ${userData.credit}`);

    // 2. Yeni kredi miktarını hesaplayalım
    const currentCredit = Number(userData.credit) || 0;
    const newCredit = currentCredit + Number(creditChange);
    console.log(`Calculated new credit: ${currentCredit} + ${creditChange} = ${newCredit}`);

    // 3. Doğrudan update işlemi yapalım
    console.log(`Directly updating user ${userId} credit to ${newCredit}`);
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        credit: newCredit,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('credit')
      .maybeSingle();

    // Güncelleme hatası kontrolü
    if (updateError) {
      console.error('Error updating user credit:', updateError);
      throw new Error(`Credit update failed: ${updateError.message}`);
    }

    if (!updateData) {
      console.warn('No data returned from update, but no error occurred');
      // Veri döndürülmemiş ama işlem başarılı olmuş olabilir

      // Güncellemeleri kontrol edelim
      const { data: checkData, error: checkError } = await supabaseAdmin
        .from('users')
        .select('id, credit')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error verifying credit update:', checkError);
      } else if (checkData) {
        console.log(`Verification check: user credit is now ${checkData.credit}`);
        if (Number(checkData.credit) === newCredit) {
          console.log('Credit was updated successfully despite no return data');
        } else {
          console.error(`Credit verification failed: expected ${newCredit}, got ${checkData.credit}`);
        }
      } else {
        console.error('Verification check: user no longer exists!');
      }
    } else {
      console.log(`Credit updated successfully: ${updateData.credit}`);
    }

    // Sadece kredi EKLEME (positive) işlemlerini credit_transactions tablosuna kaydedelim
    if (creditChange > 0) {
      try {
        const { error: transError } = await supabaseAdmin
          .from('credit_transactions')
          .insert({
            user_id: userId,
            amount: creditChange,
            price: 0, // Bu basit güncelleme için fiyat bilgisi yok
            status: 'completed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (transError) {
          console.error('Error creating credit transaction record:', transError);
          // Sadece log, işlemi durdurmuyoruz
        } else {
          console.log(`Added credit transaction record for +${creditChange} credits`);
        }
      } catch (transactionError) {
        // İşlem kaydı oluşturmada hata olsa bile kredi güncellendiği için devam edilebilir
        console.error('Exception creating credit transaction record:', transactionError);
      }
    } else {
      console.log(`Skipping transaction record for credit usage: ${creditChange} (negative values are not logged)`);
    }

    // Her durumda hesaplanan yeni kredi değerini döndür
    return newCredit;
  } catch (error) {
    console.error('Error in updateUserCredit function:', error);
    throw error;
  }
}

// Kullanıcı kredisini güncelleyen ve işlem kaydı oluşturan fonksiyon
export async function updateUserCreditWithTransaction(
  userId: string,
  creditChange: number,
  paymentId: string,
  price: number
): Promise<number> {
  try {
    // 1. Önce kullanıcı kredisini güncelle
    const newBalance = await updateUserCredit(userId, creditChange);
    console.log(`Credits updated successfully: ${creditChange} added to user ${userId}. New balance: ${newBalance}`);

    // 2. Ardından işlem kaydını basit SQL ile oluştur
    try {
      // Manuel SQL komutu ile işlemi ekle
      const { data, error } = await supabase.rpc(
        'insert_credit_transaction',
        {
          p_user_id: userId,
          p_amount: creditChange,
          p_price: price,
          p_payment_id: paymentId
        }
      );

      if (error) {
        console.error('Error creating transaction record (RPC):', error);

        // RPC fonksiyonu yoksa direkt insert dene
        try {
          const { data: insertData, error: insertError } = await supabase
            .from('credit_transactions')
            .insert({
              user_id: userId,
              amount: creditChange,
              price: price,
              payment_id: paymentId,
              status: 'completed',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error creating transaction record (Direct insert):', insertError);
          } else {
            console.log('Transaction record created successfully (Direct insert)');
          }
        } catch (directInsertError) {
          console.error('Exception during direct insert:', directInsertError);
        }
      } else {
        console.log('Transaction record created successfully (RPC)');
      }
    } catch (transactionError) {
      console.error('Error creating transaction record, but credit was updated:', transactionError);
      // Kredi güncellendiği için işlemi durdurmuyoruz
    }

    return newBalance;
  } catch (error) {
    console.error('Error in updateUserCreditWithTransaction:', error);
    throw error;
  }
}

// İşlem kaydını veritabanına ekler
async function saveTransactionRecord(
  userId: string,
  amount: number,
  paymentId: string,
  price: number
): Promise<any> {
  try {
    console.log('Saving transaction record to credit_transactions:', {
      userId,
      amount,
      paymentId,
      price
    });

    console.log('Supabase config used in saveTransactionRecord:',{
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKeyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    // Direkt olarak tablo adını manuel belirterek deneyelim
    const TABLE_NAME = 'credit_transactions';
    console.log(`Using hardcoded table name: ${TABLE_NAME}`);

    // Satırı görüp göremediğimizi kontrol edelim önce
    try {
      const { count } = await supabase
        .from(TABLE_NAME)
        .select('*', { count: 'exact', head: true });
      console.log(`Table ${TABLE_NAME} exists and has ${count} records`);
    } catch (checkError) {
      console.error(`Error checking table ${TABLE_NAME}:`, checkError);
    }

    // Transaction kaydını oluştur
    const transactionData = {
      user_id: userId,
      amount,
      price,
      payment_id: paymentId,
      package_id: null,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Transaction data to be inserted:', transactionData);

    // Satın alma kaydını direkt SQL ile deneyelim
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      console.error('Error saving transaction record:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });

      // RLS politikalarını kontrol etmek için basit bir sorgu deneme
      console.log('Checking if table exists and accessible...');
      const { count, error: checkError } = await supabase
        .from(TABLE_NAME)
        .select('*', { count: 'exact', head: true });

      if (checkError) {
        console.error('Table access check failed:', checkError);
      } else {
        console.log('Table access check success, found count:', count);
      }

      // Kullanıcı kontrolü
      try {
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        console.log('User check for transaction:', user ? 'Found' : 'Not found');

        if (!user) {
          console.error('User ID is invalid, this may be causing the foreign key violation');
          // Varsayılan bir kullanıcı ID'si ile deneme yapabilirdik,
          // ama bu güvenli değil. Bunun yerine hatayı logluyoruz.
        }
      } catch (userError) {
        console.error('Error checking user for transaction:', userError);
      }

      throw error;
    }

    console.log('Transaction record saved successfully with ID:', data?.id);
    return data;
  } catch (error) {
    console.error('Detailed error saving transaction record:', error);
    throw error;
  }
}

// Hesap satın alma işlemi
export async function purchaseAccount(userId: string, accountType: string): Promise<{success: boolean, account?: Account, message?: string}> {
  try {
    console.log("purchaseAccount called with userId:", userId, "accountType:", accountType);

    // Hesap ayarlarını al - service role ile
    const { data: accountSetting, error: settingError } = await supabaseAdmin
      .from('account_settings')
      .select('*')
      .eq('type', accountType)
      .single();

    if (settingError || !accountSetting) {
      console.error("Error fetching account settings:", settingError);
      return { success: false, message: 'Account type not found' };
    }

    // Kullanıcıyı al ve kredi kontrolü yap - service role ile
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user by ID:", error);
      return { success: false, message: 'User not found' };
    }

    if (!user) {
      console.error("No user found with ID:", userId);
      return { success: false, message: 'User not found' };
    }

    console.log("User found for purchase:", user.id, user.email);

    // Kullanıcı banlı ise satın alma işlemini engelle
    if (user.is_banned) {
      return { success: false, message: 'Your account has been banned. Please contact support.' };
    }

    if (user.credit < accountSetting.credit_cost) {
      return { success: false, message: 'Insufficient credit' };
    }

    // Saatlik limit kontrolü - kullanıcı saatte en fazla 5 hesap alabilir
    const hourlyPurchases = await getUserPurchasesInLastHour(userId);
    const HOURLY_PURCHASE_LIMIT = 5;

    if (hourlyPurchases >= HOURLY_PURCHASE_LIMIT) {
      return {
        success: false,
        message: `You've reached the hourly purchase limit (${HOURLY_PURCHASE_LIMIT} accounts per hour). Please try again later.`
      };
    }

    // Havuzdan kullanılabilir hesap al - service role ile
    const { data: poolAccount, error: poolError } = await supabaseAdmin
      .from('account_pool')
      .select('*')
      .eq('type', accountType)
      .eq('is_available', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (poolError || !poolAccount) {
      console.error("Error fetching available account from pool:", poolError);
      return { success: false, message: 'No available accounts of this type' };
    }

    // Havuzdaki hesabı kullanılabilir değil olarak işaretle - service role ile
    const { error: updatePoolError } = await supabaseAdmin
      .from('account_pool')
      .update({ is_available: false })
      .eq('id', poolAccount.id);

    if (updatePoolError) {
      console.error("Error updating pool account availability:", updatePoolError);
      return { success: false, message: 'Error processing your request' };
    }

    // Kullanıcı kredisini düşür - service role ile
    try {
      await updateUserCredit(user.id, -accountSetting.credit_cost);
    } catch (creditError) {
      console.error("Error updating user credit:", creditError);

      // Hata durumunda havuzdaki hesabı tekrar kullanılabilir yap
      await supabaseAdmin
        .from('account_pool')
        .update({ is_available: true })
        .eq('id', poolAccount.id);

      return { success: false, message: 'Error processing payment' };
    }

    // Kullanıcıya hesabı ata - service role ile
    const { data: newAccount, error: accountError } = await supabaseAdmin
      .from('accounts')
      .insert({
        user_id: user.id,
        type: accountType,
        email: poolAccount.email,
        password: poolAccount.password,
        addon: poolAccount.addon, // Havuzdaki hesabın addon bilgisini ekliyoruz
        token: poolAccount.token // Havuzdaki hesabın token bilgisini ekliyoruz
      })
      .select()
      .single();

    if (accountError || !newAccount) {
      console.error("Error adding account to user:", accountError);

      // Hata durumunda havuzdaki hesabı tekrar kullanılabilir yap ve krediyi iade et
      await supabaseAdmin
        .from('account_pool')
        .update({ is_available: true })
        .eq('id', poolAccount.id);

      await updateUserCredit(user.id, accountSetting.credit_cost);

      return { success: false, message: 'Failed to add account to user' };
    }

    return { success: true, account: newAccount as Account };
  } catch (error) {
    console.error('Error during account purchase:', error);
    return { success: false, message: 'An error occurred during purchase' };
  }
}

// Hesap ekleme fonksiyonu
export async function addAccount(account: {
  user_id: string;
  type: string;
  email: string;
  password: string;
}): Promise<Account | null> {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .insert(account)
      .select()
      .single();

    if (error) throw error;
    return data as Account;
  } catch (error) {
    console.error('Error adding account to Supabase:', error);
    return null;
  }
}

// Hesap havuzuna yeni hesap ekleme (admin işlevi)
export async function addAccountToPool(account: {
  type: string;
  email: string;
  password: string;
  token?: string | null;
  addon?: string | null;
}): Promise<AccountPool | null> {
  try {
    const { data, error } = await supabase
      .from('account_pool')
      .insert({
        type: account.type,
        email: account.email,
        password: account.password,
        token: account.token || null,
        addon: account.addon || null,
        is_available: true
      })
      .select()
      .single();

    if (error) throw error;
    return data as AccountPool;
  } catch (error) {
    console.error('Error adding account to pool:', error);
    return null;
  }
}

// Hesap türüne göre havuzda bulunan müsait hesap sayısını gösterme (önbellekli)
export async function getAvailableAccountCountByType(type: string): Promise<number> {
  // Önbellekte değer varsa ve süresi dolmamışsa onu döndür
  const cacheKey = type;
  const cachedItem = cache.availableCounts?.[cacheKey];
  const now = Date.now();

  if (cachedItem && now - cachedItem.timestamp < CACHE_DURATION) {
    return cachedItem.data;
  }

  try {
    // Mevcut hesap sayısını getir - service role ile
    const { count, error } = await supabaseAdmin
      .from('account_pool')
      .select('*', { count: 'exact', head: true })
      .eq('type', type)
      .eq('is_available', true);

    if (error) {
      console.error('Error fetching available account count:', error);
      return 0;
    }

    // Sonucu önbelleğe al
    if (!cache.availableCounts) {
      cache.availableCounts = {};
    }

    cache.availableCounts[cacheKey] = {
      data: count || 0,
      timestamp: now
    };

    return count || 0;
  } catch (error) {
    console.error('Error fetching available account count:', error);
    return 0;
  }
}

// Tüm havuzdaki hesapların durumunu görüntüleme (Admin fonksiyonu, önbellekli)
export async function getAccountPoolStats(): Promise<{type: string, available: number, total: number}[]> {
  try {
    const now = Date.now();

    // Önbellekte varsa ve süresi geçmediyse, önbellekten döndür
    if (
      cache.accountPoolStats &&
      now - cache.accountPoolStats.timestamp < CACHE_DURATION
    ) {
      return cache.accountPoolStats.data;
    }

    // Önce tüm hesap türlerini alalım
    const { data: types, error: typeError } = await supabase
      .from('account_settings')
      .select('type');

    if (typeError) throw typeError;

    if (!types || types.length === 0) return [];

    // Tüm sorgular için tek bir istek gönderelim
    const statPromises = types.map(async (typeObj) => {
      const type = typeObj.type;

      // RPC fonksiyonunu kullanarak tek bir istek ile hem toplam hem de kullanılabilir sayıları alıyoruz
      // NOT: Bu RPC fonksiyonunu sunucunuzda oluşturmanız gerekir
      const { data, error } = await supabase.rpc('get_account_pool_stats_for_type', { type_name: type });

      if (error) {
        console.error(`Error getting stats for type ${type}:`, error);

        // RPC yoksa yedek sorgu
        // Toplam hesap sayısı
        const { count: total, error: totalError } = await supabase
          .from('account_pool')
          .select('*', { count: 'exact', head: true })
          .eq('type', type);

        if (totalError) throw totalError;

        // Kullanılabilir hesap sayısı
        const { count: available, error: availableError } = await supabase
          .from('account_pool')
          .select('*', { count: 'exact', head: true })
          .eq('type', type)
          .eq('is_available', true);

        if (availableError) throw availableError;

        return {
          type,
          available: available || 0,
          total: total || 0
        };
      }

      return data;
    });

    const stats = await Promise.all(statPromises);

    // Önbelleğe kaydet
    cache.accountPoolStats = {
      data: stats,
      timestamp: now
    };

    return stats;
  } catch (error) {
    console.error('Error fetching account pool statistics:', error);
    return [];
  }
}

// Önbelleği temizleme fonksiyonu (gerekirse)
export function clearCache() {
  cache.accountPoolStats = undefined;
  cache.availableCounts = {};
}

// Hesap silme fonksiyonu
export async function deleteAccount(accountId: string, userId: string): Promise<boolean> {
  try {
    console.log('deleteAccount function called with:', { accountId, userId });

    // Önce hesabın gerçekten bu kullanıcıya ait olduğunu kontrol et
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    console.log('Account verification result:', { account, error: accountError?.message });

    if (accountError || !account) {
      console.error('Error verifying account ownership:', accountError);

      // Hesabın var olup olmadığını kontrol et (kullanıcıdan bağımsız olarak)
      const { data: accountExists, error: existsError } = await supabaseAdmin
        .from('accounts')
        .select('id, user_id')
        .eq('id', accountId)
        .single();

      console.log('Account existence check:', { exists: !!accountExists, actualUserId: accountExists?.user_id, requestedUserId: userId });

      if (accountExists) {
        throw new Error(`Account found but belongs to user ${accountExists.user_id}, not ${userId}`);
      } else {
        throw new Error('Account not found or does not belong to this user');
      }
    }

    // Hesabı sil
    const { error: deleteError } = await supabaseAdmin
      .from('accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting account:', deleteError);
      throw deleteError;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAccount function:', error);
    throw error;
  }
}

// İnaktif kullanıcıları getiren fonksiyon (1 aydan fazla giriş yapmayan)
export async function getInactiveUsers(days: number = 30): Promise<User[]> {
  try {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    console.log(`Searching for users inactive since: ${dateThreshold.toISOString()}`);

    // Önce last_login tarihi threshold'dan küçük olanları alalım
    const { data: olderLoginUsers, error: error1 } = await supabaseAdmin
      .from('users')
      .select('*')
      .lt('last_login', dateThreshold.toISOString())
      .order('last_login', { ascending: true });

    if (error1) {
      console.error('Supabase error in getInactiveUsers (older logins):', error1);
      throw error1;
    }

    // Sonra hiç giriş yapmamış kullanıcıları alalım
    const { data: nullLoginUsers, error: error2 } = await supabaseAdmin
      .from('users')
      .select('*')
      .is('last_login', null)
      .order('created_at', { ascending: true });

    if (error2) {
      console.error('Supabase error in getInactiveUsers (null logins):', error2);
      throw error2;
    }

    // İki sonucu birleştirelim
    const combinedUsers = [...(olderLoginUsers || []), ...(nullLoginUsers || [])];

    console.log(`Found ${combinedUsers.length} inactive users (${olderLoginUsers?.length || 0} with old logins, ${nullLoginUsers?.length || 0} with no logins)`);
    return combinedUsers as User[];
  } catch (error) {
    console.error('Error fetching inactive users:', error);
    return [];
  }
}

// Kullanıcıları toplu olarak silen fonksiyon
export async function deleteUsers(userIds: string[]): Promise<{success: boolean, count: number, error?: any}> {
  try {
    if (!userIds.length) return { success: true, count: 0 };

    // Önce bu kullanıcılara ait kredi işlemlerindeki kullanıcı referanslarını NULL yapıyoruz
    const { error: transactionsError } = await supabaseAdmin
      .from('credit_transactions')
      .update({ user_id: null })
      .in('user_id', userIds);

    if (transactionsError) {
      console.error('Kredi işlemlerini güncellerken hata:', transactionsError);
      return {
        success: false,
        count: 0,
        error: {
          message: 'Kredi işlemlerindeki kullanıcı referanslarını güncellerken hata oluştu',
          details: transactionsError
        }
      };
    }

    // Sonra bu kullanıcılara ait hesapları siliyoruz
    const { error: accountsError } = await supabaseAdmin
      .from('accounts')
      .delete()
      .in('user_id', userIds);

    if (accountsError) {
      console.error('Hesapları silerken hata:', accountsError);
      return {
        success: false,
        count: 0,
        error: {
          message: 'Kullanıcı hesaplarını silerken hata oluştu',
          details: accountsError
        }
      };
    }

    // Son olarak kullanıcıları siliyoruz
    const { data, error } = await supabaseAdmin
      .from('users')
      .delete()
      .in('id', userIds);

    if (error) {
      console.error('Kullanıcıları silerken hata:', error);
      return {
        success: false,
        count: 0,
        error: {
          message: 'Kullanıcıları silerken hata oluştu',
          details: error
        }
      };
    }

    return {
      success: true,
      count: userIds.length
    };
  } catch (error) {
    console.error('Error deleting users:', error);
    return {
      success: false,
      count: 0,
      error: {
        message: 'Kullanıcıları silerken beklenmeyen hata',
        details: error
      }
    };
  }
}

// Kullanıcının son giriş zamanını güncelleyen fonksiyon
export async function updateUserLastLogin(email: string): Promise<boolean> {
  try {
    if (!email) {
      console.error('updateUserLastLogin: Empty email provided');
      return false;
    }

    // E-posta adresi temizleme
    const cleanEmail = email.toLowerCase().trim();

    // Kullanıcı var mı kontrol et - subaseAdmin kullanarak RLS kısıtlamalarını atla
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .single();

    if (fetchError) {
      console.error('updateUserLastLogin: Error fetching user:', fetchError);
      // Kullanıcı bulunamadıysa, saveUser fonksiyonu ile oluştur
      const newUser = await saveUser({ email: cleanEmail });
      if (!newUser) {
        console.error('updateUserLastLogin: Failed to create user for email:', cleanEmail);
        return false;
      }
      console.log('updateUserLastLogin: Created new user with ID:', newUser.id);
      return true;
    }

    // Son giriş zamanını güncelle
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('email', cleanEmail);

    if (updateError) {
      console.error('updateUserLastLogin: Error updating last login:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserLastLogin:', error);
    return false;
  }
}

// Hesap havuzundaki tüm hesapları getirme fonksiyonu
export async function getAccountPool(
  is_available?: boolean,
  page: number = 1,
  pageSize: number = 20,
  type?: string,
  email_domain?: string
): Promise<{accounts: AccountPool[], count: number}> {
  try {
    // Önce toplam sayıyı alalım
    let countQuery = supabase
      .from('account_pool')
      .select('*', { count: 'exact', head: true });

    // Eğer sadece belirli durumdaki hesaplar isteniyorsa
    if (is_available !== undefined) {
      countQuery = countQuery.eq('is_available', is_available);
    }

    // Hesap tipine göre filtreleme
    if (type && type !== "all") {
      countQuery = countQuery.eq('type', type);
    }

    // Email domain'ine göre filtreleme - içinde geçen değerleri alacak şekilde
    if (email_domain) {
      countQuery = countQuery.ilike('email', `%${email_domain}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting accounts in pool:', countError);
      return { accounts: [], count: 0 };
    }

    // Hesapları getir
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('account_pool')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    // Eğer sadece belirli durumdaki hesaplar isteniyorsa
    if (is_available !== undefined) {
      query = query.eq('is_available', is_available);
    }

    // Hesap tipine göre filtreleme
    if (type && type !== "all") {
      query = query.eq('type', type);
    }

    // Email domain'ine göre filtreleme - içinde geçen değerleri alacak şekilde
    if (email_domain) {
      query = query.ilike('email', `%${email_domain}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching account pool:', error);
      throw error;
    }

    return {
      accounts: data as AccountPool[],
      count: count || 0
    };
  } catch (error) {
    console.error('Error in getAccountPool:', error);
    return { accounts: [], count: 0 };
  }
}

// Belirli bir gün sayısından daha eski olan hesapların sayısını getir
export async function getOldAccountsCount(days: number = 15): Promise<number> {
  try {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const { count, error } = await supabase
      .from('account_pool')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', dateThreshold.toISOString());

    if (error) {
      console.error('Error counting old accounts:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getOldAccountsCount:', error);
    return 0;
  }
}

// Belirli bir gün sayısından daha eski havuzdaki hesapları silme fonksiyonu
export async function deleteOldPoolAccounts(days: number = 15): Promise<{success: boolean, count: number, error?: any}> {
  try {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    const thresholdStr = dateThreshold.toISOString();

    console.log(`Attempting to delete pool accounts older than ${days} days (threshold: ${thresholdStr})`);

    // API'ye doğrudan istek yapmak yerine, supabaseAdmin'in JavaScript API'sini kullanıyoruz
    // Önce silinecek hesapları bulalım
    const { data: oldAccounts, error: findError } = await supabaseAdmin
      .from('account_pool')
      .select('id, email')
      .lt('created_at', thresholdStr);

    if (findError) {
      console.error('Error finding old accounts:', findError);
      return {
        success: false,
        count: 0,
        error: {
          message: 'Eski hesapları bulurken hata oluştu',
          details: findError
        }
      };
    }

    if (!oldAccounts || oldAccounts.length === 0) {
      // Silinecek eski hesap yok
      console.log('No old accounts found to delete');
      return {
        success: true,
        count: 0
      };
    }

    console.log(`Found ${oldAccounts.length} old accounts to delete:`, oldAccounts.map(a => a.email).join(', '));

    // Hesap ID'lerini alalım ve bunları silelim (doğrudan tarih ile silmek yerine)
    const accountIds = oldAccounts.map(acc => acc.id);

    // Hesapları ID'lere göre silelim
    const { error: deleteError } = await supabaseAdmin
      .from('account_pool')
      .delete()
      .in('id', accountIds);

    if (deleteError) {
      console.error('Error deleting old accounts by ID:', deleteError);
      return {
        success: false,
        count: 0,
        error: {
          message: 'Eski hesapları silerken hata oluştu',
          details: deleteError
        }
      };
    }

    console.log(`Successfully deleted ${oldAccounts.length} old accounts`);
    return {
      success: true,
      count: oldAccounts.length
    };
  } catch (error) {
    console.error('Error in deleteOldPoolAccounts:', error);
    return {
      success: false,
      count: 0,
      error: {
        message: 'Eski hesapları silerken beklenmeyen hata',
        details: error
      }
    };
  }
}

// Son bir saat içindeki satın alım sayısını kontrol et - service role ile
export async function getUserPurchasesInLastHour(userId: string): Promise<number> {
  try {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    // Son bir saatteki satın alım sayısını getir - service role ile
    const { count, error } = await supabaseAdmin
      .from('credit_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .lt('amount', 0) // Kredi eksilmeleri satın alımdır
      .gte('created_at', oneHourAgo.toISOString());

    if (error) {
      console.error('Error fetching user purchases in the last hour:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error fetching user purchases in the last hour:', error);
    return 0;
  }
}

// Kullanıcı banlama fonksiyonu
export async function banUser(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_banned: true })
      .eq('id', userId);

    if (error) {
      console.error('Error banning user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error banning user:', error);
    return false;
  }
}

// Kullanıcı banını kaldırma fonksiyonu
export async function unbanUser(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_banned: false })
      .eq('id', userId);

    if (error) {
      console.error('Error unbanning user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error unbanning user:', error);
    return false;
  }
}

// Admin ayarını getiren fonksiyon
export async function getAdminSetting(key: string): Promise<AdminSetting | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      console.error('Error fetching admin setting:', error);
      return null;
    }

    return data as AdminSetting;
  } catch (error) {
    console.error('Error in getAdminSetting:', error);
    return null;
  }
}

// Demo kredi ayarını getiren fonksiyon
export async function getDemoCreditSetting(): Promise<DemoCreditSetting | null> {
  try {
    console.log('getDemoCreditSetting: Fetching demo credit settings');
    const setting = await getAdminSetting('demo_credit');

    if (!setting) {
      console.log('getDemoCreditSetting: No settings found');
      // Varsayılan değerler döndür - yeni sistemlerde bu ayar olmadığı zaman için
      return {
        enabled: true,
        value: 5.0,    // Yeni kullanıcılara 5 kredi
        limit: 1000,   // 1000 kullanıcıya kadar demo kredi verilebilir
        used: 0        // Hiç kullanılmamış
      };
    }

    console.log('getDemoCreditSetting: Settings found:', setting.value);
    return setting.value as DemoCreditSetting;
  } catch (error) {
    console.error('Error in getDemoCreditSetting:', error);
    return null;
  }
}

// Demo kredi ayarını güncelleyen fonksiyon
export async function updateDemoCreditSetting(settings: DemoCreditSetting): Promise<boolean> {
  try {
    console.log('updateDemoCreditSetting: Updating settings:', settings);

    // Önce admin_settings tablosunda demo_credit anahtarı var mı diye kontrol et
    const currentSetting = await getAdminSetting('demo_credit');

    if (!currentSetting) {
      console.log('updateDemoCreditSetting: Creating new demo_credit setting');
      // Kayıt yoksa yeni oluştur
      const { error: insertError } = await supabaseAdmin
        .from('admin_settings')
        .insert({
          key: 'demo_credit',
          value: settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating demo credit setting:', insertError);
        return false;
      }
    } else {
      console.log('updateDemoCreditSetting: Updating existing demo_credit setting');
      // Varsa güncelle
      const { error: updateError } = await supabaseAdmin
        .from('admin_settings')
        .update({
          value: settings,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'demo_credit');

      if (updateError) {
        console.error('Error updating demo credit setting:', updateError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in updateDemoCreditSetting:', error);
    return false;
  }
}

// Demo kredi kullanımını artıran fonksiyon
export async function incrementDemoCreditUsed(): Promise<boolean> {
  try {
    console.log('incrementDemoCreditUsed: Incrementing demo credit usage');

    // Mevcut ayarları al
    const currentSettings = await getDemoCreditSetting();
    if (!currentSettings) {
      console.error('incrementDemoCreditUsed: No demo credit settings found');
      return false;
    }

    console.log('incrementDemoCreditUsed: Current usage:', currentSettings.used, '/', currentSettings.limit);

    // Kullanım sayısını artır
    const updatedSettings = {
      ...currentSettings,
      used: (currentSettings.used || 0) + 1
    };

    // Güncelle
    const updateResult = await updateDemoCreditSetting(updatedSettings);
    console.log('incrementDemoCreditUsed: Update result:', updateResult);

    return updateResult;
  } catch (error) {
    console.error('Error in incrementDemoCreditUsed:', error);
    return false;
  }
}

// Demo kredi için uygun mu kontrol eden fonksiyon
export async function isDemoCreditAvailable(): Promise<boolean> {
  try {
    console.log('isDemoCreditAvailable: Checking if demo credit is available');

    const settings = await getDemoCreditSetting();
    if (!settings) {
      console.log('isDemoCreditAvailable: No settings, returning false');
      return false;
    }

    if (!settings.enabled) {
      console.log('isDemoCreditAvailable: Demo credits disabled');
      return false;
    }

    const isAvailable = (settings.used || 0) < settings.limit;
    console.log('isDemoCreditAvailable:', isAvailable, 'Used:', settings.used, 'Limit:', settings.limit);

    return isAvailable;
  } catch (error) {
    console.error('Error in isDemoCreditAvailable:', error);
    return false;
  }
}

// Kullanıcının admin olup olmadığını kontrol eden fonksiyon
export async function isUserAdmin(email: string): Promise<boolean> {
  try {
    // Boş e-posta kontrolü
    if (!email) {
      console.log("isUserAdmin: Empty email provided");
      return false;
    }

    // E-posta temizleme
    const cleanEmail = email.toLowerCase().trim();
    console.log("isUserAdmin: Checking admin status for:", cleanEmail);

    // Sorgu önce supabase yapılandırmasını kontrol et
    if (!supabaseAdmin) {
      console.error('isUserAdmin: supabaseAdmin is not initialized');
      return false;
    }

    // Debug: Supabase URL'yi loglama
    console.log('isUserAdmin: Using supabase URL:', supabaseUrl);

    // Kullanıcıyı e-posta adresi ile bulalım - service role ile RLS politikalarını atlayalım
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('email', cleanEmail)
      .single();

    if (error) {
      console.error('isUserAdmin: Error fetching user for admin check:', error);
      return false;
    }

    // Kullanıcı verisini logla
    console.log("isUserAdmin: User data:", user);

    // Kullanıcı rolü "admin" ise true, değilse false döndür
    const isAdmin = user?.role === 'admin';
    console.log(`isUserAdmin: User role is "${user?.role}", admin status:`, isAdmin);

    return isAdmin;
  } catch (error) {
    console.error('isUserAdmin: Error checking admin status:', error);
    return false;
  }
}

// Kullanıcı rolünü güncelleyen fonksiyon (sadece adminler tarafından kullanılabilir)
export async function updateUserRole(userId: string, newRole: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
}
