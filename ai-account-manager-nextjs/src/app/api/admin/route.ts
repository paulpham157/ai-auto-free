import { NextResponse } from 'next/server';
import { getUserByEmail, supabaseAdmin, isUserAdmin, deleteOldPoolAccounts, updateDemoCreditSetting, getInactiveUsers, deleteUsers, banUser, unbanUser, updateUserCredit } from '@/utils/supabase';
import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Nonce değeri (tek kullanımlık değer) oluşturma fonksiyonu
function generateNonce(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Birleştirilmiş Admin API Endpoint'i
export async function GET(request: Request) {
  try {
    // JWT token kontrolü
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Token yoksa veya email yoksa hemen çık (check için özel durum aşağıda)
    // if (!token || !token.email) {
    //   // Check action'ı guest dönebilir, bu yüzden burada 401 dönmeyelim henüz.
    // }

    // URL'den action ve diğer parametreleri al
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    // Eğer token yoksa ve action 'check' ise guest dönebiliriz
    if (!token || !token.email) {
      if (action === 'check') {
        return NextResponse.json(
          { status: 'success', role: 'guest' },
          { status: 200 }
        );
      }
      // Diğer action'lar için yetkisiz hatası ver
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const email = token.email as string;

    // Admin kontrolü (sadece action 'check' DEĞİLSE yapılır)
    if (action !== 'check') {
      const user = await getUserByEmail(email);
      if (!user || user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin privileges required' },
          { status: 403 }
        );
      }
    }

    // Diğer parametreleri al (sadece admin gerektiren action'lar için ilgili olabilir)
    const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? true : false;
    // Diğer potansiyel parametreler buraya eklenebilir

    switch (action) {
      case 'check': { // Yeni case eklendi
        // Admin kontrolü yap (isUserAdmin ile)
        const isAdmin = await isUserAdmin(email);

        if (!isAdmin) {
          // Admin değilse, normal kullanıcıya uygun yanıt ver
          return NextResponse.json(
            { status: 'success', role: 'user' },
            { status: 200 }
          );
        }

        // Admin ise, güvenli bir şekilde yanıt ver
        // Tek kullanımlık bir nonce değeri oluştur ve token olarak cookie'ye kaydet
        const adminToken = generateNonce();

        // Cookie oluştur ve ayarla
        const cookieStore = cookies();
        cookieStore.set('admin_session', adminToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600 // 1 saat
        });

        // Admin token'ı ile birlikte yanıt ver
        return NextResponse.json({
          status: 'success',
          role: 'admin',
          token: adminToken.substring(0, 8) // Token'ın bir kısmını doğrulama için gönder
        });
      }
      case 'credit-transactions': {
        console.log(`Fetching credit transactions requested by ${email}`);

        // Sorgu parametrelerini al
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const userEmail = url.searchParams.get('userEmail');
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        // Sayfalama için offset hesapla
        const offset = (page - 1) * limit;

        // Temel sorgu oluştur
        let query = supabaseAdmin
          .from('credit_transactions')
          .select(`
            *,
            users:user_id (
              id,
              name,
              email
            )
          `)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        // Filtreleri uygula
        let userIds: string[] = [];
        if (userEmail) {
          // Önce email'e göre kullanıcıyı bul
          const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('id')
            .ilike('email', `%${userEmail}%`)
            .limit(10);

          if (!userError && userData && userData.length > 0) {
            // Bulunan kullanıcı ID'lerini kullanarak filtreleme yap
            userIds = userData.map(user => user.id);
            query = query.in('user_id', userIds);
          } else {
            // Kullanıcı bulunamadıysa boş sonuç döndür
            return NextResponse.json({
              status: 'success',
              data: [],
              pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0
              }
            });
          }
        }

        if (startDate) {
          query = query.gte('created_at', startDate);
        }

        if (endDate) {
          query = query.lte('created_at', endDate);
        }

        // Sorguyu çalıştır
        const { data: transactions, error } = await query;

        if (error) {
          console.error('Error fetching credit transactions:', error);
          return NextResponse.json(
            { error: 'Failed to fetch credit transactions' },
            { status: 500 }
          );
        }

        // Toplam kayıt sayısını hesapla
        let countQuery = supabaseAdmin
          .from('credit_transactions')
          .select('*', { count: 'exact', head: true });

        // Filtreleri count sorgusuna da uygula
        if (userIds.length > 0) {
          countQuery = countQuery.in('user_id', userIds);
        }

        if (startDate) {
          countQuery = countQuery.gte('created_at', startDate);
        }

        if (endDate) {
          countQuery = countQuery.lte('created_at', endDate);
        }

        const { count: totalCount, error: countError } = await countQuery;

        if (countError) {
          console.error('Error counting credit transactions:', countError);
        }

        return NextResponse.json({
          status: 'success',
          data: transactions,
          pagination: {
            page,
            limit,
            total: totalCount || transactions.length,
            totalPages: Math.ceil((totalCount || transactions.length) / limit)
          }
        });
      }
      case 'demo-credit': { // Yeni case eklendi (GET)
        console.log(`Fetching demo credit settings requested by ${email}`);

        const { data, error } = await supabaseAdmin
          .from('admin_settings')
          .select('*')
          .eq('key', 'demo_credit');

        if (error) {
          console.error('Error fetching demo credit settings:', error);
          throw error;
        }

        // Verinin varlığını kontrol et ve varsayılan sağla
        let settings = null;
        if (data && data.length > 0) {
          settings = data[0].value || {
            enabled: true,
            value: 1,
            limit: 10,
            used: 0
          };
        } else {
          settings = {
            enabled: true,
            value: 1,
            limit: 10,
            used: 0
          };
        }

        return NextResponse.json({
          status: 'success',
          settings
        });
      }
      case 'demo-credit-update': { // Yeni case ekledim
        // URL'den parametreleri al
        const enabled = url.searchParams.get('enabled') === 'true';
        const value = parseFloat(url.searchParams.get('value') || '0');
        const limit = parseInt(url.searchParams.get('limit') || '0');
        const used = parseInt(url.searchParams.get('used') || '0');
        const resetUsed = url.searchParams.get('resetUsed') === 'true';

        console.log(`Direct demo credit update requested by ${email}:`, { enabled, value, limit, used, resetUsed });

        // Mevcut ayarları al
        const currentSettingResp = await supabaseAdmin
          .from('admin_settings')
          .select('*')
          .eq('key', 'demo_credit')
          .maybeSingle();

        let currentSetting = currentSettingResp.data?.value;
        if (!currentSetting) {
          currentSetting = {
            enabled: true,
            value: 1,
            limit: 10,
            used: 0
          };
        }

        // Değer veya limit değiştiyse used'ı sıfırla
        const shouldResetUsed = resetUsed ||
          currentSetting.value !== value ||
          currentSetting.limit !== limit;

        // Yeni ayarları oluştur
        const settings = {
          enabled: enabled,
          value: value,
          limit: limit,
          used: shouldResetUsed ? 0 : used || currentSetting.used
        };

        console.log('New settings to apply:', settings);

        // Direkt olarak veritabanına kaydet
        if (!currentSettingResp.data) {
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
            return NextResponse.json({
              error: 'Failed to create demo credit setting',
              details: insertError.message
            }, { status: 500 });
          }
        } else {
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
            return NextResponse.json({
              error: 'Failed to update demo credit setting',
              details: updateError.message
            }, { status: 500 });
          }
        }

        return NextResponse.json({
          status: 'success',
          settings,
          message: shouldResetUsed ?
            'Demo kredi ayarları başarıyla güncellendi ve kullanım sayacı sıfırlandı' :
            'Demo kredi ayarları başarıyla güncellendi'
        });
      }
      case 'export-accounts': { // Yeni case eklendi (GET)
        // URL'den parametreleri al
        const is_available = url.searchParams.get('is_available');
        const type = url.searchParams.get('type');
        const exportMode = url.searchParams.get('mode') || 'all'; // Default to 'all'
        const domain = url.searchParams.get('domain');

        console.log(`Export accounts request by ${email} with params:`, { is_available, type, exportMode, domain });

        // Sorgu oluşturma
        let query = supabaseAdmin.from('account_pool').select('*');

        // Filtreler
        if (is_available === 'true') {
          query = query.eq('is_available', true);
        } else if (is_available === 'false') {
          query = query.eq('is_available', false);
        }

        if (type && type !== 'all') {
          query = query.eq('type', type);
        }

        if (exportMode === 'domain' && domain) {
          query = query.ilike('email', `%@${domain}`);
        }

        // Verileri getir
        const { data, error } = await query;

        if (error) {
          console.error('Error fetching accounts for export:', error);
          throw error;
        }

        console.log(`Found ${data?.length || 0} accounts to export for ${email}`);

        if (!data || data.length === 0) {
          return NextResponse.json({
            status: 'success',
            accounts: [],
            count: 0
          });
        }

        // JSON formatını hazırla (sadece gerekli alanlar)
        const accounts = data.map(account => ({
          email: account.email,
          password: account.password,
          token: account.token || '',
          addon: account.addon || ''
        }));

        return NextResponse.json({
          status: 'success',
          accounts,
          count: accounts.length
        });
      }
      case 'inactive-users': { // Yeni case eklendi (GET)
        // URL'den inaktif gün sayısını al
        const days = parseInt(url.searchParams.get('days') || '30');
        console.log(`Fetching users inactive for ${days} days, requested by ${email}`);
        const inactiveUsers = await getInactiveUsers(days);
        return NextResponse.json({
          status: 'success',
          inactiveUsers
        });
      }
      case 'users': {
        // Kullanıcıları getir (Burada artık admin olduğu varsayılır)
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('*')
          .order('created_at', { ascending: sortOrder });

        if (userError) {
          throw userError;
        }

        return NextResponse.json({
          status: 'success',
          users: userData
        });
      }
      case 'accounts': {
        // Hesapları getir
        const { data: accountData, error: accountError } = await supabaseAdmin
          .from('accounts')
          .select('*')
          .order('created_at', { ascending: sortOrder });

        if (accountError) {
          throw accountError;
        }

        return NextResponse.json({
          status: 'success',
          accounts: accountData
        });
      }
      case 'account-pool': {
        // URL parametrelerini al (account-pool'a özel)
        const isAvailable = url.searchParams.get('is_available');
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '20', 10);
        const type = url.searchParams.get('type');
        const emailDomain = url.searchParams.get('email_domain');

        // Sayfalama için offset hesapla
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // Önce toplam sayıyı al
        let countQuery = supabaseAdmin
          .from('account_pool')
          .select('*', { count: 'exact', head: true });

        // Parametrelere göre filtreleme yap
        if (isAvailable !== null && isAvailable !== undefined) {
          countQuery = countQuery.eq('is_available', isAvailable === 'true');
        }
        if (type && type !== 'all') {
          countQuery = countQuery.eq('type', type);
        }
        if (emailDomain) {
          countQuery = countQuery.ilike('email', `%${emailDomain}%`);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          console.error('Error counting account pool:', countError);
          throw countError;
        }

        // Hesapları getir
        let query = supabaseAdmin
          .from('account_pool')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, to);

        // Parametrelere göre filtreleme yap (tekrar)
        if (isAvailable !== null && isAvailable !== undefined) {
          query = query.eq('is_available', isAvailable === 'true');
        }
        if (type && type !== 'all') {
          query = query.eq('type', type);
        }
        if (emailDomain) {
          query = query.ilike('email', `%${emailDomain}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching account pool:', error);
          throw error;
        }

        return NextResponse.json({
          status: 'success',
          accounts: data || [],
          count: count || 0
        });
      }
      case 'account-types': { // Yeni case eklendi (GET)
        console.log(`Fetching account types requested by ${email}`);
        const { data: accountTypes, error } = await supabaseAdmin
          .from('account_settings')
          .select('*');

        if (error) {
          console.error('Error fetching account types:', error);
          throw error;
        }

        return NextResponse.json({
          status: 'success',
          accountTypes
        });
      }
      case 'old-accounts-count': { // Yeni case eklendi (GET)
        // URL'den days parametresini al
        const days = parseInt(url.searchParams.get('days') || '15', 10);

        // Belirlenen gün sayısından eski olan hesaplar için tarih eşiği
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);

        console.log(`Counting accounts older than ${days} days (threshold: ${dateThreshold.toISOString()}), requested by ${email}`);

        // Eski hesapların sayısını al (head: true ile sadece sayıyı alırız)
        const { count, error: countError } = await supabaseAdmin
          .from('account_pool')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', dateThreshold.toISOString());

        if (countError) {
          console.error('Error counting old accounts:', countError);
          throw countError;
        }

        return NextResponse.json({
          status: 'success',
          count: count || 0,
          days: days,
          threshold_date: dateThreshold.toISOString()
        });
      }
      case 'user-search': { // Yeni case eklendi (GET)
        const searchEmail = url.searchParams.get('email');

        if (!searchEmail) {
          return NextResponse.json(
            { error: 'Email query parameter is required for user search' },
            { status: 400 }
          );
        }

        console.log(`Admin ${email} searching for user with email: ${searchEmail}`);

        const { data: userData, error: searchError } = await supabaseAdmin
          .from('users')
          .select('*') // Select all user data as in the original endpoint
          .eq('email', searchEmail.toLowerCase().trim())
          .maybeSingle();

        if (searchError) {
          console.error(`Error searching for user ${searchEmail}:`, searchError);
          throw searchError; // Let the main catch block handle it
        }

        if (!userData) {
          console.log(`User not found with email: ${searchEmail}`);
          return NextResponse.json({
            status: 'success',
            user: null, // Return null as in the original endpoint
            message: 'User not found'
          });
        }

        console.log(`User found: ${userData.id}`);
        return NextResponse.json({
          status: 'success',
          user: userData // Return the full user object
        });
      }
      // Diğer action'lar için case'ler buraya eklenecek
      // Örnek: case 'check': { ... }

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(`Error in admin API (action: ${new URL(request.url).searchParams.get('action')}):`, error);
    // Check action hata durumunda bile 200 dönebilir, özel kontrol
    const currentAction = new URL(request.url).searchParams.get('action');
    if (currentAction === 'check') {
      return NextResponse.json(
        { status: 'success', role: 'user', error: 'Internal server error during check' },
        { status: 200 } // Check endpointi hata durumunda bile 200 dönebilir
      );
    }
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // JWT token kontrolü
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Kimlik doğrulama yoksa veya email yoksa hata döndür
    if (!token || !token.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const email = token.email as string;

    // Admin kontrolü
    const user = await getUserByEmail(email);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    // URL'den action parametresini al
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    // İstek gövdesini oku (sadece bir kez okunabilir)
    const body = await request.json();

    switch (action) {
      case 'bulk-add-accounts': {
        const { accounts, type } = body;

        if (!accounts || !Array.isArray(accounts) || !type) {
          return NextResponse.json(
            { error: 'Missing or invalid required fields (accounts array, type)' },
            { status: 400 }
          );
        }

        console.log(`Attempting to add ${accounts.length} accounts to pool (type: ${type}) requested by ${email}`);

        const results = [];
        const errors = [];

        for (const account of accounts) {
          try {
            // Token sadece boş string değilse gönder
            const tokenVal = account.token && account.token.trim() !== '' ? account.token : null;
            // Addon sadece boş string değilse gönder
            const addonVal = account.addon && account.addon.trim() !== '' ? account.addon : null;

            if (!account.email || !account.password) {
              errors.push({ email: account.email || 'Missing Email', error: 'Missing email or password' });
              continue; // Skip this account
            }

            console.log(`Adding account: ${account.email} (type: ${type})`);

            const { data: newAccount, error } = await supabaseAdmin
              .from('account_pool')
              .insert({
                type: type,
                email: account.email,
                password: account.password,
                token: tokenVal,
                addon: addonVal,
                is_available: true
              })
              .select()
              .maybeSingle();

            if (error) {
              console.error(`Error adding account ${account.email}:`, error);
              errors.push({
                email: account.email,
                error: `Database error: ${error.message || 'Unknown error'}`
              });
            } else if (newAccount) {
              console.log(`Account added successfully: ${account.email}`);
              results.push(newAccount);
            } else {
              errors.push({
                email: account.email,
                error: 'Failed to add account to pool (no data returned)'
              });
            }
          } catch (err: any) {
            console.error(`Exception adding account ${account.email} to pool:`, err);
            errors.push({
              email: account.email,
              error: `Error processing account: ${err.message || 'Unknown error'}`
            });
          }
        }

        return NextResponse.json({
          success: true,
          added: results.length,
          errors: errors.length > 0 ? errors : null,
          accounts: results // Return added accounts as in original endpoint
        });
      }
      case 'user-ban': { // Yeni case eklendi (POST)
        const { userId, action: banAction } = body; // 'action' zaten scope'ta olduğu için 'banAction' ismini kullanalım

        if (!userId || !banAction || (banAction !== 'ban' && banAction !== 'unban')) {
          return NextResponse.json(
            { error: 'Invalid request parameters: userId and action (ban/unban) are required' },
            { status: 400 }
          );
        }

        console.log(`Attempting to ${banAction} user ${userId}, requested by ${email}`);

        let success;
        if (banAction === 'ban') {
          success = await banUser(userId);
        } else { // unban
          success = await unbanUser(userId);
        }

        if (!success) {
          console.error(`Failed to ${banAction} user ${userId}`);
          throw new Error(`Failed to ${banAction} user`);
        }

        return NextResponse.json({
          status: 'success',
          message: `User ${banAction === 'ban' ? 'banned' : 'unbanned'} successfully`
        });
      }
      case 'delete-users': { // POST metodu için kullanıcı silme action'ı
        const { userIds } = body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
          return NextResponse.json(
            { error: 'No user IDs provided or invalid format' },
            { status: 400 }
          );
        }

        console.log(`Attempting to delete ${userIds.length} users requested by ${email}`);

        // Kullanıcıları sil (deleteUsers fonksiyonu ile)
        const result = await deleteUsers(userIds);

        // deleteUsers fonksiyonunun ne döndürdüğüne bağlı olarak yanıtı ayarlayabiliriz.
        return NextResponse.json({
          status: 'success',
          message: `Attempted deletion of ${userIds.length} users. Result: ${JSON.stringify(result)}`
        });
      }
      case 'delete-pool-accounts': { // POST metodu için havuz hesaplarını silme action'ı
        const { accountIds } = body;

        if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
          return NextResponse.json(
            { error: 'No account IDs provided or invalid format' },
            { status: 400 }
          );
        }

        console.log(`Attempting to delete ${accountIds.length} pool accounts requested by ${email}`);

        // Hesapları sil
        const { error } = await supabaseAdmin
          .from('account_pool')
          .delete()
          .in('id', accountIds);

        if (error) {
          console.error(`Error deleting pool accounts by ID:`, error);
          throw error;
        }

        return NextResponse.json({
          status: 'success',
          message: `${accountIds.length} account(s) deleted successfully`
        });
      }
      case 'delete-old-pool-accounts': { // POST metodu için eski havuz hesaplarını silme action'ı
        const { days } = body;
        const daysToDelete = days && typeof days === 'number' && days > 0 ? days : 15; // Default to 15 days if not specified or invalid

        console.log(`Attempting to delete pool accounts older than ${daysToDelete} days requested by ${email}`);

        // Tarih eşiğini hesapla
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - daysToDelete);
        const thresholdStr = dateThreshold.toISOString();

        console.log(`Date threshold for deletion: ${thresholdStr}`);

        // Önce silinecek hesapları bulalım
        const { data: oldAccounts, error: findError } = await supabaseAdmin
          .from('account_pool')
          .select('id, email')
          .lt('created_at', thresholdStr);

        if (findError) {
          console.error('Error finding old accounts:', findError);
          return NextResponse.json({
            status: 'error',
            message: 'Eski hesapları bulurken hata oluştu',
            error: findError
          }, { status: 500 });
        }

        if (!oldAccounts || oldAccounts.length === 0) {
          // Silinecek eski hesap yok
          console.log('No old accounts found to delete');
          return NextResponse.json({
            status: 'success',
            message: 'Silinecek eski hesap bulunamadı',
            count: 0
          });
        }

        console.log(`Found ${oldAccounts.length} old accounts to delete:`, oldAccounts.map(a => a.email).join(', '));

        // Hesap ID'lerini alalım
        const accountIds = oldAccounts.map(acc => acc.id);
        const accountEmails = oldAccounts.map(acc => acc.email);

        // 1. Önce accounts tablosundan ilgili e-posta adreslerine sahip hesapları silelim
        const { error: accountsDeleteError } = await supabaseAdmin
          .from('accounts')
          .delete()
          .in('email', accountEmails);

        if (accountsDeleteError) {
          console.error('Error deleting accounts from accounts table:', accountsDeleteError);
          return NextResponse.json({
            status: 'error',
            message: 'Hesapları accounts tablosundan silerken hata oluştu',
            error: accountsDeleteError
          }, { status: 500 });
        }

        console.log(`Successfully deleted ${accountEmails.length} accounts from accounts table`);

        // 2. Şimdi account_pool tablosundan hesapları silelim
        const { error: deleteError } = await supabaseAdmin
          .from('account_pool')
          .delete()
          .in('id', accountIds);

        if (deleteError) {
          console.error('Error deleting old accounts from account_pool:', deleteError);
          return NextResponse.json({
            status: 'error',
            message: 'Eski hesapları account_pool tablosundan silerken hata oluştu',
            error: deleteError
          }, { status: 500 });
        }

        console.log(`Successfully deleted ${oldAccounts.length} old accounts from both tables`);
        return NextResponse.json({
          status: 'success',
          message: `${oldAccounts.length} eski hesap accounts ve account_pool tablolarından başarıyla silindi.`,
          count: oldAccounts.length
        });
      }

      // Diğer POST action'ları buraya eklenecek

      default:
        return NextResponse.json(
          { error: `Invalid action '${action}' for POST method` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    const action = new URL(request.url).searchParams.get('action'); // Hata durumunda action'ı loglamak için tekrar al
    console.error(`Error in admin API POST (action: ${action}):`, error);
    // JSON parse hatası kontrolü
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An internal error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // JWT token kontrolü
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Kimlik doğrulama yoksa veya email yoksa hata döndür
    if (!token || !token.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const email = token.email as string;

    // Admin kontrolü
    const user = await getUserByEmail(email);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    // URL'den action parametresini al
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    // İstek gövdesini oku
    const body = await request.json();

    switch (action) {
      case 'demo-credit': { // Yeni case eklendi (PUT)
        const settings = body; // Gövdenin tamamının ayarlar olduğunu varsayıyoruz

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json({ error: 'Invalid settings provided in body' }, { status: 400 });
        }

        console.log(`Attempting to update demo credit settings requested by ${email}:`, settings);

        // Demo kredi ayarlarını güncelle
        const success = await updateDemoCreditSetting(settings);

        if (!success) {
          console.error('Failed to update demo credit settings using utility function.');
          throw new Error('Failed to update demo credit settings');
        }

        return NextResponse.json({
          status: 'success',
          settings // Güncellenen ayarları geri döndür
        });
      }
      case 'user-credit': { // Yeni case eklendi (PUT)
        const { userId, creditAmount } = body;

        console.log(`Attempting credit update for user ${userId} with amount ${creditAmount}, requested by ${email}`);

        if (!userId || creditAmount === undefined || typeof creditAmount !== 'number') {
          console.log('Invalid user-credit parameters:', body);
          return NextResponse.json(
            { error: 'Invalid request parameters: userId and numeric creditAmount required' },
            { status: 400 }
          );
        }

        // UUID format kontrolü (isteğe bağlı ama iyi bir pratik)
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(userId)) {
          console.error(`Invalid user ID format for credit update: ${userId}`);
          return NextResponse.json(
            { error: 'Invalid user ID format' },
            { status: 400 }
          );
        }

        try {
          // updateUserCredit fonksiyonu, amount'u mevcut krediye ekler/çıkarır.
          const newCredit = await updateUserCredit(userId, creditAmount);
          console.log(`Credit updated successfully for user ${userId}. New credit: ${newCredit}`);

          return NextResponse.json({
            status: 'success',
            newCredit,
            message: `Credit updated by ${creditAmount}. New balance: ${newCredit}`
          });
        } catch (creditError: any) {
          // updateUserCredit içinde kullanıcı bulunamadı hatası veya başka bir veritabanı hatası olabilir.
          console.error(`Error updating credit for user ${userId}:`, creditError);
          // Hatanın türüne göre daha spesifik yanıtlar verilebilir.
          if (creditError.message?.includes('User not found')) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
          }
          return NextResponse.json(
            { error: 'Failed to update user credit', details: creditError.message || 'Unknown error' },
            { status: 500 }
          );
        }
      }
      // Diğer PUT action'ları buraya eklenecek

      default:
        return NextResponse.json(
          { error: `Invalid action '${action}' for PUT method` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    const action = new URL(request.url).searchParams.get('action');
    console.error(`Error in admin API PUT (action: ${action}):`, error);
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An internal error occurred during update' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // JWT token kontrolü
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Kimlik doğrulama yoksa veya email yoksa hata döndür
    if (!token || !token.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const email = token.email as string;

    // Admin kontrolü
    const user = await getUserByEmail(email);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    // URL'den action parametresini al
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    // İstek gövdesini oku
    const body = await request.json();

    switch (action) {
      case 'delete-pool-accounts': {
        const { accountIds } = body;

        if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
          return NextResponse.json(
            { error: 'No account IDs provided or invalid format' },
            { status: 400 }
          );
        }

        console.log(`Attempting to delete ${accountIds.length} pool accounts requested by ${email}`);

        // Hesapları sil
        const { error } = await supabaseAdmin
          .from('account_pool')
          .delete()
          .in('id', accountIds);

        if (error) {
          console.error(`Error deleting pool accounts by ID:`, error);
          throw error;
        }

        return NextResponse.json({
          status: 'success',
          message: `${accountIds.length} account(s) deleted successfully`
        });
      }
      case 'delete-old-pool-accounts': {
         const { days } = body;
         const daysToDelete = days && typeof days === 'number' && days > 0 ? days : 15; // Default to 15 days if not specified or invalid

         console.log(`Attempting to delete pool accounts older than ${daysToDelete} days requested by ${email}`);

         // Tarih eşiğini hesapla
         const dateThreshold = new Date();
         dateThreshold.setDate(dateThreshold.getDate() - daysToDelete);
         const thresholdStr = dateThreshold.toISOString();

         console.log(`Date threshold for deletion: ${thresholdStr}`);

         // Önce silinecek hesapları bulalım
         const { data: oldAccounts, error: findError } = await supabaseAdmin
           .from('account_pool')
           .select('id, email')
           .lt('created_at', thresholdStr);

         if (findError) {
           console.error('Error finding old accounts:', findError);
           return NextResponse.json({
             status: 'error',
             message: 'Eski hesapları bulurken hata oluştu',
             error: findError
           }, { status: 500 });
         }

         if (!oldAccounts || oldAccounts.length === 0) {
           // Silinecek eski hesap yok
           console.log('No old accounts found to delete');
           return NextResponse.json({
             status: 'success',
             message: 'Silinecek eski hesap bulunamadı',
             count: 0
           });
         }

         console.log(`Found ${oldAccounts.length} old accounts to delete:`, oldAccounts.map(a => a.email).join(', '));

         // Hesap ID'lerini alalım
         const accountIds = oldAccounts.map(acc => acc.id);
         const accountEmails = oldAccounts.map(acc => acc.email);

         // 1. Önce accounts tablosundan ilgili e-posta adreslerine sahip hesapları silelim
         const { error: accountsDeleteError } = await supabaseAdmin
           .from('accounts')
           .delete()
           .in('email', accountEmails);

         if (accountsDeleteError) {
           console.error('Error deleting accounts from accounts table:', accountsDeleteError);
           return NextResponse.json({
             status: 'error',
             message: 'Hesapları accounts tablosundan silerken hata oluştu',
             error: accountsDeleteError
           }, { status: 500 });
         }

         console.log(`Successfully deleted ${accountEmails.length} accounts from accounts table`);

         // 2. Şimdi account_pool tablosundan hesapları silelim
         const { error: deleteError } = await supabaseAdmin
           .from('account_pool')
           .delete()
           .in('id', accountIds);

         if (deleteError) {
           console.error('Error deleting old accounts from account_pool:', deleteError);
           return NextResponse.json({
             status: 'error',
             message: 'Eski hesapları account_pool tablosundan silerken hata oluştu',
             error: deleteError
           }, { status: 500 });
         }

         console.log(`Successfully deleted ${oldAccounts.length} old accounts from both tables`);
         return NextResponse.json({
           status: 'success',
           message: `${oldAccounts.length} eski hesap accounts ve account_pool tablolarından başarıyla silindi.`,
           count: oldAccounts.length
         });
      }
      case 'inactive-users': { // Yeni case eklendi (DELETE)
        const { userIds } = body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
          return NextResponse.json(
            { error: 'No user IDs provided or invalid format' },
            { status: 400 }
          );
        }

        console.log(`Attempting to delete ${userIds.length} inactive users requested by ${email}`);

        // Kullanıcıları sil (deleteUsers fonksiyonu ile)
        const result = await deleteUsers(userIds);

        // deleteUsers fonksiyonunun ne döndürdüğüne bağlı olarak yanıtı ayarlayabiliriz.
        return NextResponse.json({
          status: 'success',
          message: `Attempted deletion of ${userIds.length} users. Result: ${JSON.stringify(result)}`
        });
      }

      default:
        return NextResponse.json(
          { error: `Invalid action '${action}' for DELETE method` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    const action = new URL(request.url).searchParams.get('action');
    console.error(`Error in admin API DELETE (action: ${action}):`, error);
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'An internal error occurred during deletion' },
      { status: 500 }
    );
  }
}
