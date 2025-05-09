#!/usr/bin/env python3

import json
import pyperclip
from mitmproxy import http
from mitmproxy import ctx

class CursorTokenInterceptor:
    def __init__(self):
        print("Cursor Token Interceptor başlatıldı!")
        print("api2.cursor.sh/auth/poll istekleri bekleniyor...")
        # İşlenen URL'leri takip etmek için set oluştur
        self.processed_urls = set()

    def response(self, flow: http.HTTPFlow) -> None:
        # URL içerisinde belirtilen path var mı kontrol et
        if "api2.cursor.sh/auth/poll" in flow.request.pretty_url:
            # Bu URL daha önce işlendi mi kontrol et
            if flow.request.pretty_url in self.processed_urls:
                return

            # Sadece başarılı yanıtları işle
            if flow.response.status_code == 200:
                try:
                    # JSON yanıtını ayrıştır
                    response_data = json.loads(flow.response.content.decode('utf-8'))

                    # Gerekli alanları al
                    access_token = response_data.get("accessToken")
                    authId = response_data.get("authId")

                    if access_token and authId:
                        # Formatlı string oluştur
                        result = f"{authId.split('|')[1]}%3A%3A{access_token}"
                        self.processed_urls.add(flow.request.pretty_url)

                        # Panoya kopyala
                        pyperclip.copy(result)

                        # Sonucu ekrana yazdır
                        print("\n" + "=" * 50)
                        print(f"CURSOR TOKEN BULUNDU!")
                        print("=" * 50)
                        print(f"Sonuç panoya kopyalandı: {result}")
                        print("=" * 50 + "\n")

                except Exception as e:
                    # Hata durumunda sessizce devam et
                    pass


# Scripti başlat
addons = [CursorTokenInterceptor()]


"""
Kullanım:
1. Bu dosyayı kaydedin
2. Konsolda şu komutu çalıştırın:
   mitmdump -s cursor_token_interceptor.py

Proxy'i tarayıcınıza veya sistema ayarlamanız gerekecektir (genellikle 127.0.0.1:8080).
HTTPS için sertifika kurulumu gerekebilir.
"""
