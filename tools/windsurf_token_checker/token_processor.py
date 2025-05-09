#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import binascii
import os
import json
import base64
import sys
import subprocess
from datetime import datetime

class TokenProcessor:
    def __init__(self, token_file="tokens.txt"):
        self.token_file = token_file
        self.base_url = self.find_windsurf_url()
        self.headers = {
            "accept-encoding": "gzip,br",
            "connect-protocol-version": "1",
            "content-type": "application/proto",
            "user-agent": "connect-es/1.5.0",
            "connection": "close",
            "x-codeium-csrf-token": "4285de5d-594a-40d1-8fcf-4edb7405c868"
        }
        self.debug = False  # Normal kullanım için kapalı
        self.debug_dir = "debug_logs"
        self.results_file = f"sonuclar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

        # Hata ayıklama dizinini oluştur
        if self.debug and not os.path.exists(self.debug_dir):
            os.makedirs(self.debug_dir)

    def find_windsurf_url(self):
        """language_server_windows_x64 işlemini bulup, ilgili portu tespit eder ve URL döndürür."""
        try:
            # PowerShell komutu ile language_server_windows_x64 işleminin portunu bul
            ps_command = 'powershell -Command "Get-Process -Name language_server_windows_x64 | ForEach-Object { $ppid = $_.Id; netstat -ano | Where-Object { $_ -match $ppid } }"'
            output = subprocess.check_output(ps_command, shell=True, universal_newlines=True)

            # Çıktıyı satırlara böl
            lines = output.strip().split('\n')

            # İlk LISTENING durumundaki portu bul
            for line in lines:
                if "LISTENING" in line:
                    parts = line.strip().split()
                    if len(parts) >= 2:
                        # Yerel adres bilgisini al (IP:Port formatında)
                        local_address = parts[1]
                        # IP ve portu ayır
                        ip, port = local_address.rsplit(':', 1)

                        # URL'yi oluştur ve döndür
                        url = f"http://127.0.0.1:{port}"
                        print(f"Language server bağlantısı bulundu: {url}")
                        return url

            # Hiçbir bağlantı bulunamazsa varsayılan port kullan
            print("Language server bağlantısı bulunamadı, varsayılan port kullanılıyor.")
            return "http://127.0.0.1:16200"  # Varsayılan port olarak 16200 kullanılıyor

        except Exception as e:
            print(f"Language server URL tespiti sırasında hata: {str(e)}")
            return "http://127.0.0.1:16200"  # Hata durumunda varsayılan port

    def save_debug_info(self, prefix, request_data, response_data=None, response_status=None):
        """Hata ayıklama bilgilerini dosyaya kaydeder."""
        if not self.debug:
            return

        # İstek verisini kaydet
        with open(f"{self.debug_dir}/{prefix}_request.bin", "wb") as f:
            f.write(request_data)

        # İstek verisinin hex gösterimini kaydet
        with open(f"{self.debug_dir}/{prefix}_request_hex.txt", "w") as f:
            f.write(binascii.hexlify(request_data).decode())

        # Yanıt verisini kaydet (varsa)
        if response_data:
            with open(f"{self.debug_dir}/{prefix}_response.bin", "wb") as f:
                f.write(response_data)

            # Yanıt verisinin hex gösterimini kaydet
            with open(f"{self.debug_dir}/{prefix}_response_hex.txt", "w") as f:
                f.write(binascii.hexlify(response_data).decode())

        # Durum bilgisini kaydet
        if response_status:
            with open(f"{self.debug_dir}/{prefix}_status.txt", "w") as f:
                f.write(str(response_status))

    def encode_varint(self, value):
        """Bir değeri varint formatında kodlar."""
        result = bytearray()
        while value >= 0x80:
            result.append((value & 0x7F) | 0x80)
            value >>= 7
        result.append(value & 0x7F)
        return bytes(result)

    def parse_jwt(self, token):
        """JWT token'ı parse eder ve email adresini çıkarır."""
        try:
            # Token'ın ortadaki kısmını al (payload)
            parts = token.split('.')
            if len(parts) != 3:
                return "Geçersiz JWT formatı"

            # Base64 decode işlemi
            payload = parts[1]
            # Padding ekle
            padding = '=' * (4 - len(payload) % 4) if len(payload) % 4 != 0 else ''
            payload = payload + padding

            # URL-safe base64 decode
            decoded = base64.urlsafe_b64decode(payload)

            # JSON parse
            data = json.loads(decoded)

            # Email ve kullanıcı bilgilerini döndür
            return {
                "email": data.get('email', 'Email bulunamadı'),
                "name": data.get('name', 'İsim bulunamadı'),
                "user_id": data.get('user_id', 'Kullanıcı ID bulunamadı')
            }
        except Exception as e:
            return {"error": f"JWT parse hatası: {str(e)}"}

    def register_user(self, token):
        """Kullanıcı kaydı yapar."""
        try:
            # Token'ı protobuf formatına dönüştür
            token_bytes = token.encode('utf-8')
            token_length = len(token_bytes)

            # Protobuf formatı: field_number (1) + wire type (2) = 0x0A
            # Ardından uzunluk (varint formatında) ve veri
            request_data = b'\x0A' + self.encode_varint(token_length) + token_bytes

            # İsteği gönder
            url = f"{self.base_url}/exa.language_server_pb.LanguageServerService/RegisterUser"

            # Hata ayıklama için istek verisini kaydet
            if self.debug:
                self.save_debug_info(f"register_user_{token[:10]}", request_data)

            response = requests.post(url, data=request_data, headers=self.headers)
            response_data = response.content

            # Hata ayıklama için yanıt verisini kaydet
            if self.debug:
                self.save_debug_info(f"register_user_{token[:10]}", request_data, response_data, response.status_code)

            # Yanıt durumunu kontrol et
            if response.status_code == 200:
                try:
                    # Başarılı yanıt - user_id'yi çıkar
                    # Protobuf yanıtı: field_number (1) + wire type (2) = 0x0A, ardından uzunluk ve veri
                    if response_data and len(response_data) > 2 and response_data[0] == 0x0A:
                        # Uzunluğu ve veriyi çıkar
                        length_bytes = []
                        i = 1
                        while i < len(response_data) and (response_data[i] & 0x80) != 0:
                            length_bytes.append(response_data[i] & 0x7F)
                            i += 1
                        length_bytes.append(response_data[i])
                        i += 1

                        # Uzunluğu hesapla
                        length = 0
                        for j, b in enumerate(length_bytes):
                            length |= b << (7 * j)

                        # Veriyi çıkar
                        if i + length <= len(response_data):
                            user_id = response_data[i:i+length].decode('utf-8')
                            return {"status_code": response.status_code, "user_id": user_id}

                    # Yanıt ayrıştırılamadı
                    return {"status_code": response.status_code, "raw_response": binascii.hexlify(response_data).decode()}
                except Exception as e:
                    # Yanıt ayrıştırma hatası
                    return {"status_code": response.status_code, "error": str(e), "raw_response": binascii.hexlify(response_data).decode()}
            else:
                # Hata yanıtı
                error_message = "Bilinmeyen hata"
                try:
                    # Yanıt mesajını çıkarmaya çalış
                    if response_data:
                        try:
                            # JSON olarak ayrıştırmayı dene
                            error_json = json.loads(response_data)
                            error_message = error_json.get('message', str(error_json))
                        except:
                            # Düz metin olarak dene
                            error_message = response_data.decode('utf-8', errors='ignore')
                except:
                    error_message = "Yanıt mesajı ayrıştırılamadı"

                return {
                    "status_code": response.status_code,
                    "error_message": error_message,
                    "raw_response": binascii.hexlify(response_data).decode()
                }
        except Exception as e:
            # İstek hatası
            return {"status_code": 0, "error": str(e)}

    def get_user_status(self, user_id):
        """Kullanıcı durumunu sorgular."""
        try:
            # Verilen tam protobuf yapısını kullanarak mesajı oluştur
            # [message]    1
            # [string]     1.1   windsurf
            # [string]     1.2   1.30.2
            # [string]     1.3   user_id (dinamik)
            # [string]     1.4   en
            # [string]     1.7   11.0.0
            # [uint32]     1.9   1170
            # [string]     1.10  411d1057-c811-4187-8ea6-088bc7dc2e1b
            # [string]     1.12  windsurf
            # [string]     1.17  c:\Program Files\WindsurfEski\resources\app\extensions\windsurf
            # [string]     1.23  11.0.0

            # Manuel olarak protobuf mesajını oluştur
            message = bytearray()

            # 1.1 alanı - windsurf
            app_name = "windsurf"
            message.extend(b'\x0A\x08')
            message.extend(app_name.encode('utf-8'))

            # 1.2 alanı - 1.30.2
            version = "1.30.2"
            message.extend(b'\x12\x06')
            message.extend(version.encode('utf-8'))

            # 1.3 alanı - user_id (dinamik)
            message.extend(b'\x1A')
            message.extend(self.encode_varint(len(user_id)))
            message.extend(user_id.encode('utf-8'))

            # 1.4 alanı - en
            lang = "en"
            message.extend(b'\x22\x02')
            message.extend(lang.encode('utf-8'))

            # 1.7 alanı - 11.0.0
            version_110 = "11.0.0"
            message.extend(b'\x3A\x06')
            message.extend(version_110.encode('utf-8'))

            # 1.9 alanı - 1170 (uint32)
            message.extend(b'\x48\x92\x09')

            # 1.10 alanı - 411d1057-c811-4187-8ea6-088bc7dc2e1b
            guid = "411d1057-c811-4187-8ea6-088bc7dc2e1b"
            message.extend(b'\x52\x24')
            message.extend(guid.encode('utf-8'))

            # 1.12 alanı - windsurf
            message.extend(b'\x62\x08')
            message.extend(app_name.encode('utf-8'))

            # 1.17 alanı - c:\Program Files\WindsurfEski\resources\app\extensions\windsurf
            path = r"c:\Program Files\WindsurfEski\resources\app\extensions\windsurf"
            message.extend(b'\x8A\x01\x3F')
            message.extend(path.encode('utf-8'))

            # 1.23 alanı - 11.0.0
            message.extend(b'\xBA\x01\x06')
            message.extend(version_110.encode('utf-8'))

            # Mesajı başlat ve uzunluk ekle
            final_message_length = len(message)
            request_data = b'\x0A' + self.encode_varint(final_message_length) + bytes(message)

            # Debug için hex yazdır
            if self.debug:
                print(f"Gönderilen request hex: {binascii.hexlify(request_data).decode()}")

            # İsteği gönder
            url = f"{self.base_url}/exa.language_server_pb.LanguageServerService/GetUserStatus"

            # Hata ayıklama için istek verisini kaydet
            if self.debug:
                self.save_debug_info(f"get_user_status_{user_id[:10]}", request_data)

            # İsteği gönder
            response = requests.post(url, data=request_data, headers=self.headers)
            response_data = response.content

            # Hata ayıklama için yanıt verisini kaydet
            if self.debug:
                self.save_debug_info(f"get_user_status_{user_id[:10]}", request_data, response_data, response.status_code)

            # Yanıt durumunu kontrol et
            if response.status_code == 200:
                # Başarılı yanıt
                print("Kullanıcı durumu başarıyla alındı.")
                # Yanıtı debug için görüntüle
                if self.debug:
                    print(f"Yanıt hex: {binascii.hexlify(response_data).decode()}")
                return {"status_code": response.status_code, "raw_response": binascii.hexlify(response_data).decode()}
            else:
                # Hata yanıtı
                error_message = "Bilinmeyen hata"
                try:
                    # Yanıt mesajını çıkarmaya çalış
                    if response_data:
                        try:
                            # JSON olarak ayrıştırmayı dene
                            error_json = json.loads(response_data)
                            error_message = error_json.get('message', 'Hata mesajı bulunamadı')
                        except:
                            # Düz metin olarak dene
                            error_message = response_data.decode('utf-8', errors='ignore')
                except:
                    error_message = "Yanıt mesajı ayrıştırılamadı"

                # Debug modda hata detayları göster
                if self.debug:
                    print(f"Yanıt durumu: {response.status_code}")
                    print(f"Yanıt hex: {binascii.hexlify(response_data).decode()}")

                return {
                    "status_code": response.status_code,
                    "error_message": error_message,
                    "raw_response": binascii.hexlify(response_data).decode()
                }
        except Exception as e:
            # İstek hatası
            return {"status_code": 0, "error": str(e)}

    def process_tokens(self):
        """Token dosyasını okur ve her token için işlem yapar."""
        try:
            # Token dosyasını oku
            with open(self.token_file, 'r') as f:
                content = f.read()

            # Her satırı ayrı bir token olarak al, boş satırları filtrele
            tokens = [line.strip() for line in content.split('\n') if line.strip()]

            print(f"Toplam {len(tokens)} token işlenecek.")

            # Debug için tokenları göster
            if self.debug:
                for i, token in enumerate(tokens):
                    print(f"Token {i+1}: {token[:30]}...")

            # Sonuçlar için dosya oluştur
            with open(self.results_file, 'w', encoding='utf-8') as result_file:
                result_file.write("TOKEN İŞLEME SONUÇLARI\n")
                result_file.write("=" * 50 + "\n\n")

                # Her token için işlem yap
                for i, token in enumerate(tokens, 1):
                    print(f"[{i}/{len(tokens)}] Token işleniyor: {token[:20]}...")

                    # JWT verilerini çıkar
                    jwt_data = self.parse_jwt(token)

                    # Debug için JWT verilerini göster
                    if self.debug:
                        print(f"JWT verisi: {jwt_data}")

                    email = jwt_data.get('email', 'Email bulunamadı') if isinstance(jwt_data, dict) else 'Email bulunamadı'
                    name = jwt_data.get('name', 'İsim bulunamadı') if isinstance(jwt_data, dict) else 'İsim bulunamadı'
                    internal_user_id = jwt_data.get('user_id', 'Kullanıcı ID bulunamadı') if isinstance(jwt_data, dict) else 'Kullanıcı ID bulunamadı'

                    # Kullanıcı bilgilerini göster
                    if isinstance(jwt_data, dict) and 'email' in jwt_data:
                        print(f"Email: {email}")
                        if name != 'İsim bulunamadı':
                            print(f"İsim: {name}")
                        if internal_user_id != 'Kullanıcı ID bulunamadı':
                            print(f"JWT'den Çıkarılan ID: {internal_user_id}")

                    # Kullanıcı kaydı yap
                    register_result = self.register_user(token)

                    if register_result["status_code"] == 200:
                        # Kullanıcı ID'sini çıkar
                        user_id = register_result.get("user_id")

                        # Başarı bilgisini yaz
                        print(f"Kullanıcı kaydı başarılı! Server User ID: {user_id}")
                        result_file.write(f"Başarılı: {email}\n")
                        result_file.write(f"Server User ID: {user_id}\n")

                        if user_id:
                            # Kullanıcı durumunu sorgula
                            status_result = self.get_user_status(user_id)

                            if status_result["status_code"] != 200:
                                # Hata durumu - hata mesajını da göster
                                error_msg = status_result.get("error_message", str(status_result))
                                result_file.write(f"DURUM HATASI ({status_result['status_code']}): {email}\n")
                                result_file.write(f"Hata Mesajı: {error_msg}\n\n")
                                print(f"Durum sorgusu hatası: {error_msg}")
                            else:
                                # Durum sorgusu başarılı
                                result_file.write(f"Durum Sorgusu Başarılı: {email}\n\n")
                        else:
                            print(f"HATA: Kullanıcı ID çıkarılamadı. Ham yanıt: {register_result.get('raw_response', 'Yanıt yok')[:100]}")
                    else:
                        # Kayıt hatası
                        error_msg = register_result.get("error_message", str(register_result))
                        result_file.write(f"KAYIT HATASI ({register_result['status_code']}): {email}\n")
                        result_file.write(f"Hata Mesajı: {error_msg}\n\n")
                        print(f"Kayıt hatası: {error_msg}")

            print(f"İşlem tamamlandı. Sonuçlar '{self.results_file}' dosyasına kaydedildi.")
            return True

        except FileNotFoundError:
            print(f"Hata: '{self.token_file}' dosyası bulunamadı.")
            return False
        except Exception as e:
            print(f"Hata: {str(e)}")
            return False

def main():
    # Varsayılan değerler
    token_file = "tokens.txt"

    # Komut satırı argümanlarını kontrol et
    if len(sys.argv) > 1:
        # İlk argüman token dosyası olarak yorumla
        token_file = sys.argv[1]

    processor = TokenProcessor(token_file)

    # Base URL kontrolü
    if not processor.base_url:
        print("HATA: Windsurf sunucu adresi tespit edilemedi.")
        print("Kullanım: python token_processor.py [token_dosyası]")
        sys.exit(1)

    print(f"Sunucu adresi: {processor.base_url}")
    processor.process_tokens()

if __name__ == "__main__":
    main()
