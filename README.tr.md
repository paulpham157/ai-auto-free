# AI Auto Free ( ![GitHub Repo stars](https://img.shields.io/github/stars/ruwiss/ai-auto-free) )

> **ÖNEMLİ:** Bu servis artık aktif değil ve bakımı yapılmamaktadır.

<div align="center">
  <a href="README.md">English</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.cn.md">中文</a>
</div>

<br>

AI Auto Free, Cursor ve Windsurf gibi yapay zeka destekli IDE'lerin sınırsız kullanımını sağlayan kapsamlı bir otomasyon aracıdır.

Bu araç, oluşturulan hesapları uygun maliyetli bir şekilde doğrudan sahiplenmenizi sağlar.

## Önemli Uyarı
Bu araç yalnızca araştırma ve eğitim amaçlı geliştirilmiştir. Lütfen sorumlu bir şekilde kullanın. Geliştirici, bu aracın kullanımından kaynaklanabilecek herhangi bir sorun için sorumluluk kabul etmez.

## Desteklenen Diller

| Dil        |            |            |
|------------|------------|------------|
| English    | Türkçe     | Deutsch    |
| العربية    | Français   | Português  |
| Русский    | 中文       |            |

## Ekran Görüntüleri

![Res1](screenshots/tr-1.png)
![Res2](screenshots/tr-2.png)

### Common Issues

- #### Too many free trial accounts
Hata: Too many free trial accounts used on this machine.
Çözüm: Aynı cihazda birden fazla Cursor deneme hesabı kullandığınız için tespit edildiniz. Bu sorunu aşmak için ek bir araç kullanmanız gereklidir. Hızlı bir şekilde sorunu çözmek için aşağıdaki komutu terminalinizde çalıştırın.

**Windows Kullanıcıları için:**
```
irm https://raw.githubusercontent.com/yuaotian/go-cursor-help/refs/heads/master/scripts/run/cursor_win_id_modifier.ps1 | iex
```

**Mac Kullanıcıları için:**
```
curl -fsSL https://aizaozao.com/accelerate.php/https://raw.githubusercontent.com/yuaotian/go-cursor-help/refs/heads/master/scripts/run/cursor_mac_id_modifier.sh -o ./cursor_mac_id_modifier.sh && sudo bash ./cursor_mac_id_modifier.sh && rm ./cursor_mac_id_modifier.sh
```

**Linux Kullanıcıları için:**
```
curl -fsSL https://raw.githubusercontent.com/yuaotian/go-cursor-help/refs/heads/master/scripts/run/cursor_linux_id_modifier.sh | sudo bash
```

- #### Our servers are currently overloaded
Hata: Our servers are currently overloaded for non-pro users, and you've used your free quota.
Çözüm: Hesap limitiniz dolduğunda bu hatayı görebilirsiniz. Eğer hala limitiniz varsa ama yine de bu hatayı alıyorsanız, büyük ihtimalle Cursor sunucuları deneme hesabı kullananlar için geçici olarak kısıtlanmıştır. Bu durumda bir süre bekleyin ya da hesabınızdan çıkıp tekrar giriş yapın.

- #### Unauthorized Request
Hata: User is unauthorized.
Çözüm: Kullandığınız hesap yetkisiz, yani Cursor tarafından engellenmiştir.

- #### High Load
Hata: We're experiencing high demand for Claude 3.7 Sonnet right now.
Çözüm: Cursor, yoğunluktan dolayı deneme hesapları için Claude'un modellerini bir süreliğine kısıtlamıştır. Bir süre bekleyin ve tekrar deneyin.

- #### Trial Request Limit
Hata: You've reached your trial request limit.
Çözüm: Deneme hesabınızın limitini doldurdunuz. Yeni hesap alarak devam edebilirsiniz.

- #### Your request has been blocked as our system
Hata: Your request has been blocked as our system has detected suspicious activity from your account/ip adress.
Çözüm: Daha önce hesabınız Cursor tarafından yasaklandıysa IP adresiniz kara listeye düşmüş olabilir. İnternet IP adresinizi değiştirin veya "Warp" aracını kullanın: https://one.one.one.one/

- #### Connection Failed
Hata: If the problem persists, please check your internet connection or VPN, or email us at hi@cursor.sh.

### Sıkça Sorulan Sorular

- #### Bu araç ne işe yarar?
Cursor ve Windsurf gibi kod yazmamıza yardımcı olan AI destekli IDE'ler ücretsiz planda sınırlı kullanıma sahiptir. Bu sınırlamanın üstesinden gelmek için bu aracı kullanabilirsiniz.

Bir hesap aldıktan sonra, aldığınız hesaba tıklayarak hesap değiştirebilirsiniz. Bu şekilde birden fazla hesap kullanabilirsiniz.

- #### Bu araç nasıl kullanılır?
Hesabınıza kredi ekleyerek hesap edinmeye başlayabilirsiniz. Aldığınız hesapların bilgileri ana sayfanızda yer alacaktır. Bu hesapların detay sekmesinden hesap türüne göre diğer özelliklere erişebilirsiniz. Limit sorgulama veya hesabı otomatik açma gibi. Ancak bazı özellikler tarayıcı eklentisi gerektirebilir.

Hesapları aldıktan sonra hemen kullanabilirsiniz.

Hesap limitiniz bittikçe yeni hesap alarak kullanmaya devam edebilirsiniz. Ancak Cursor hesapları için farklı bir durum olarak kullanmadan önce herhangi bir uyarı ile karşılaşmamak için ana sayfada bulunan Cursor Deneme Sıfırlama butonunu kullanmanız iyi olacaktır. Hesapları birden almak yerine ihtiyaç halinde almanız sizin için daha iyi olacaktır. Çünkü bazen hesaplar sağlayıcılar tarafından yasaklanabilmektedir.

- #### Yeni bir hesap oluşturursam, kodlarım veya yapay zeka ile yaptığım konuşmalar (bağlam) silinir mi?
Hayır, silinmezler.

# Cursor Patch

MacOS, Linux ve Windows için Cursor uygulamasını yama yapan basit bir araç.

## Kullanım

### Windows

PowerShell'de çalıştırın:

```powershell
irm https://raw.githubusercontent.com/ruwiss/ai-auto-free/refs/heads/master/utils/patch_cursor.ps1 | iex
```

Eğer yürütme politikası kısıtlamalarınız varsa, şunu çalıştırabilirsiniz:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; irm https://raw.githubusercontent.com/ruwiss/ai-auto-free/refs/heads/master/utils/patch_cursor.ps1 | iex
```

### MacOS ve Linux

Terminal'de çalıştırın:

```bash
chmod +x ./utils/patch_cursor.sh
./utils/patch_cursor.sh
```

Veya doğrudan curl ile:

```bash
curl -fsSL https://raw.githubusercontent.com/ruwiss/ai-auto-free/refs/heads/master/utils/patch_cursor.sh | bash
```

## Ne İşe Yarar

Bu yama, Cursor'un cihaz tanımlama mekanizmasını şu şekilde değiştirir:

1. Makine kimliği için rastgele bir UUID oluşturur
2. Rastgele bir MAC adresi ayarlar
3. Windows kayıt defteri kontrollerini atlar
4. Rastgele bir cihaz kimliği oluşturur

Herhangi bir değişiklik yapılmadan önce tüm orijinal dosyalar `.bak` uzantısıyla yedeklenir.

## Notlar

- Yamayı çalıştırmadan önce Cursor'un kapalı olduğundan emin olun
- Bu betikleri çalıştırmak için yükseltilmiş ayrıcalıklara ihtiyacınız olabilir
- Geri yüklemeniz gerekirse orijinal yedek dosyaları korunur

## Lisans

MIT
