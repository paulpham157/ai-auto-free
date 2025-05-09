@echo off
echo Cursor Token Interceptor baslatiliyor...
echo HTTPS istekleri icin sertifika kurulumu gereklidir!
echo Proxy adresi: 127.0.0.1:8080
echo Beklemede... Cursor'a giris yaptiginizda token otomatik kopyalanacak.
echo.

mitmdump -q -s cursor_token_interceptor.py

pause
