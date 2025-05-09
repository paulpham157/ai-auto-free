import { NextResponse } from 'next/server';
import { addAccount, getUserByEmail, getAccountsByUserId } from '@/utils/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';

// Yeni hesap ekleme
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, type, password, userEmail } = body;

    if (!email || !type || !password || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Kullanıcıyı e-posta ile bul
    const user = await getUserByEmail(userEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Yeni hesabı ekle
    const newAccount = await addAccount({
      user_id: user.id,
      type,
      email,
      password,
    });

    if (!newAccount) {
      return NextResponse.json(
        { error: 'Failed to add account' },
        { status: 500 }
      );
    }

    return NextResponse.json(newAccount);
  } catch (error) {
    console.error('Error adding account:', error);
    return NextResponse.json(
      { error: 'An error occurred while adding the account' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // URL'den sayfalama parametrelerini al
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);

    // Geçerli sayfalama değerlerini kontrol et
    if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1 || pageSize > 50) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    // Kullanıcı bilgilerini getir
    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Kullanıcının hesaplarını getir
    const accountsData = await getAccountsByUserId(user.id, page, pageSize);

    // Sayfalama meta verileri ekleyerek yanıt döndür
    return NextResponse.json({
      accounts: accountsData.accounts,
      pagination: {
        total: accountsData.count,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(accountsData.count / pageSize),
        hasMore: page * pageSize < accountsData.count
      }
    });
  } catch (error) {
    console.error('Error fetching user accounts:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
