import os, sqlite3, random, argparse, re, time, requests, shutil, pathlib, platform
from utils import BrowserService, print_status, print_error, UpdateService
from uuid import uuid4
from urllib.parse import urlparse
class CursorDatabaseManager:
    def __init__(self, platform_name):
        self.storage = Storage(platform_name)
        self.db_path = self.storage.cursor_db_path()
    def update_auth(self, email=None, access_token=None, refresh_token=None):
        updates = [("cursorAuth/cachedSignUpType", "Auth_0")]
        if email: updates.append(("cursorAuth/cachedEmail", email))
        if access_token: updates.append(("cursorAuth/accessToken", access_token))
        if refresh_token: updates.append(("cursorAuth/refreshToken", refresh_token))
        if not updates:
            print_status("no_update_values")
            return False
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                for key, value in updates:
                    cursor.execute("SELECT COUNT(*) FROM itemTable WHERE key = ?", (key,))
                    if cursor.fetchone()[0] == 0: cursor.execute("INSERT INTO itemTable (key, value) VALUES (?, ?)", (key, value))
                    else: cursor.execute("UPDATE itemTable SET value = ? WHERE key = ?", (value, key))
                    print_status("auth_update_success" if cursor.rowcount > 0 else "auth_update_failed", {"field": key.split("/")[-1]})
                conn.commit()
                return True
        except sqlite3.Error as e:
            print_error("database_error", {"error": str(e)})
            return False
        except Exception as e:
            print_error("auth_error", {"error": str(e)})
            return False
class Storage:
    def __init__(self, platform_name): self.platform_name = platform_name.lower()
    def cursor_global_storage_path(self):
        home = str(pathlib.Path.home())
        if self.platform_name == "windows": return os.path.join(os.getenv("APPDATA"), "Cursor", "User", "globalStorage")
        elif self.platform_name == "macos": return os.path.join(home, "Library", "Application Support", "Cursor", "User", "globalStorage")
        return os.path.join(home, ".config", "Cursor", "User", "globalStorage")
    def cursor_storage_json_path(self): return os.path.join(self.cursor_global_storage_path(), "storage.json")
    def cursor_storage_json_exist(self): return os.path.exists(self.cursor_storage_json_path())
    def cursor_db_path(self): return os.path.join(self.cursor_global_storage_path(), "state.vscdb")
    def cursor_db_exist(self): return os.path.exists(self.cursor_db_path())
class CursorPatch:
    def __init__(self):
        self.SYSTEM = platform.system()
        if self.SYSTEM not in ("Windows", "Linux", "Darwin"): print_error(f"Unsupported OS: {self.SYSTEM}"); exit()
        if self.SYSTEM == "Windows": os.system("color")
    def uuid(self): return str(uuid4())
    def path(self, p): return pathlib.Path(p).resolve()
    def curbasepath(self):
        if self.SYSTEM == "Windows":
            localappdata = os.getenv("LOCALAPPDATA")
            assert localappdata, "Panicked: LOCALAPPDATA not exist"
            return self.path(localappdata) / "Programs" / "cursor" / "resources" / "app"
        elif self.SYSTEM == "Darwin": return self.path("/Applications/Cursor.app/Contents/Resources/app")
        elif self.SYSTEM == "Linux":
            bases = [self.path("/opt/Cursor/resources/app"), self.path("/usr/share/cursor/resources/app")]
            for base in bases:
                if base.exists(): return base
            print_error("Cursor base path not found"); exit()
    def jspath(self, p):
        jspath = self.curbasepath() / "out" / "main.js" if not p else self.path(p)
        if not jspath.exists(): print_error(f"File '{jspath}' not found"); exit()
        return jspath
    def randomuuid(self, randomuuid):
        if not randomuuid: randomuuid = self.uuid(); print_status("Generated UUID", {"uuid": randomuuid})
        return randomuuid
    def macaddr(self, macaddr):
        if not macaddr:
            while not macaddr or macaddr in ("00:00:00:00:00:00", "ff:ff:ff:ff:ff:ff", "ac:de:48:00:11:22"):
                macaddr = ":".join([f"{random.randint(0, 255):02X}" for _ in range(6)])
            print_status("Generated MAC address", {"mac": macaddr})
        return macaddr
    def load(self, path):
        with open(path, "rb") as f: return f.read()
    def save(self, path, data):
        print_status("Saving file")
        try:
            with open(path, "wb") as f: f.write(data); print_status("File saved successfully"); print_status("OK")
        except PermissionError: print_error(f"Permission denied", {"message": f"The file '{path}' is in use, please close it and try again"}); exit()
    def backup(self, path):
        print_status("Creating backup")
        bakfile = path.with_name(path.name + ".bak")
        if not os.path.exists(bakfile): shutil.copy2(path, bakfile); print_status("Backup created")
        else: print_status("Backup exists")
    def replace(self, data, pattern, replace, probe):
        pattern, replace, probe = (p.encode() if isinstance(p, str) else p for p in (pattern, replace, probe))
        assert all(isinstance(p, bytes) for p in (pattern, replace, probe))
        print_status("Replacing pattern")
        regex, patched_regex = re.compile(pattern, re.DOTALL), re.compile(probe, re.DOTALL)
        count, patched_count = len(list(regex.finditer(data))), len(list(patched_regex.finditer(data)))
        if count == 0:
            if patched_count > 0: print_status("Found already patched patterns")
            else: print_status("Warning", {"message": f"Pattern <{pattern}> not found, SKIPPED!"}); return data
        data, replaced1_count = patched_regex.subn(replace, data)
        data, replaced2_count = regex.subn(replace, data)
        replaced_count = replaced1_count + replaced2_count
        if replaced_count != count + patched_count: print_status("Warning", {"message": f"Patched {replaced_count}/{count}, failed {count - replaced_count}"})
        else: print_status("Patching complete")
        return data
    def execute(self):
        js = self.jspath(""); data = self.load(js)
        machineid = self.randomuuid("")
        data = self.replace(data, r"=.{0,50}timeout.{0,10}5e3.*?,", f'=/*csp1*/"{machineid}"/*1csp*/,', r"=/\*csp1\*/.*?/\*1csp\*/,")
        mac = self.macaddr("")
        data = self.replace(data, r"(function .{0,50}\{).{0,300}Unable to retrieve mac address.*?(\})", f'\\1return/*csp2*/"{mac}"/*2csp*/;\\2', r"()return/\*csp2\*/.*?/\*2csp\*/;()")
        sqm = ""
        data = self.replace(data, r'return.{0,50}\.GetStringRegKey.*?HKEY_LOCAL_MACHINE.*?MachineId.*?\|\|.*?""', f'return/*csp3*/"{sqm}"/*3csp*/', r"return/\*csp3\*/.*?/\*3csp\*/")
        devid = self.randomuuid("")
        data = self.replace(data, r"return.{0,50}vscode\/deviceid.*?getDeviceId\(\)", f'return/*csp4*/"{devid}"/*4csp*/', r"return/\*csp4\*/.*?/\*4csp\*/")
        self.backup(js); self.save(js, data)
class TestCursorAccount:
    def __init__(self, token): self.token = token
    def test_cursor_account(self):
        print_status("testing_account")
        headers = {
            'Accept-Encoding': 'gzip, deflate, br',
            'Authorization': f'Bearer {self.token}',
            'Connect-Protocol-Version': '1',
            'Content-Type': 'application/proto',
            'User-Agent': 'connect-es/1.6.1',
            'X-Ghost-Mode': 'true'
        }
        try:
            response = requests.post('https://api2.cursor.sh/aiserver.v1.DashboardService/GetTeams', headers=headers)
            is_valid = response.status_code == 200
            if is_valid: print_status("account_valid")
            else: print_error("account_invalid", {"status": response.status_code})
        except Exception as e: print_error("account_test_error", {"error": str(e)})
class CursorManualAuth:
    def __init__(self):
        self.browser_service = BrowserService(headless=False)
        self.browser_generator = self.browser_service.init_browser()

        # Generator'ı doğru şekilde işliyoruz
        browser = None
        while True:
            try:
                browser = next(self.browser_generator)
                # Eğer browser bir string ise, bu bir hata mesajıdır
                if isinstance(browser, str):
                    print_status("browser_message", {"message": browser})
                    continue
                break
            except StopIteration as e:
                # Generator tamamlandığında, gerçek browser nesnesini alıyoruz
                browser = e.value
                break

        self.browser = browser
        self.tab = self.browser.latest_tab
        print_status("browser_initialized")

    def manual_auth(self):
        if not self._open_auth_page():
            print_error("failed_open_auth_page")
            self.browser_service.quit()
            return False
        raw_token = self._get_cursor_session_token()
        if not raw_token:
            print_error("failed_get_cursor_session_token")
            self.browser_service.quit()
            return False
        email = self._get_manual_email()
        if not email:
            email = raw_token.split("%3A%3A")[0]
        self.browser_service.quit()
        print_status("account_created", {"email": email, "token": raw_token, "manual": True})
        print_status("OK")
        return True

    def _open_auth_page(self):
        print_status("opening_auth_page")
        try:
            # Browser nesnesini kullanarak sayfayı açıyoruz
            self.tab.get("https://authenticator.cursor.sh/")
            auth = False

            while not auth:
                detect = self.tab.ele("css:body > div.radix-themes > div > div > div:nth-child(2) > div > form > div > div.rt-CalloutRoot.rt-r-size-2.rt-variant-soft > p", timeout=0.5)
                if detect:
                    if detect.text == "Can't verify the user is human. Please try again.":
                        print_status("We have been detected. Please try again.")
                        self.browser_service.user_agent_service.remove_user_agent(self.tab.user_agent)
                    else: print_status(detect.text)
                    return False
                time.sleep(1)
                parsed_url = urlparse(self.tab.url)
                domain = parsed_url.netloc
                if "cursor.com" in domain:
                    print_status("auth_detected")
                    auth = True

            return auth
        except Exception as e:
            print_error("auth_page_error", {"error": str(e)})
            return False

    def _get_cursor_session_token(self, max_attempts=3, retry_interval=2):
        print_status("getting_cursor_session_token")
        attempts = 0

        while attempts < max_attempts:
            try:
                # DrissionPage'in cookies metodunu kullanıyoruz
                cookies = self.tab.cookies()
                for cookie in cookies:
                    if cookie.get("name") == "WorkosCursorSessionToken":
                        raw_token = cookie["value"]
                        return raw_token

                attempts += 1
                if attempts < max_attempts:
                    self.tab.refresh()
                    time.sleep(retry_interval)
                else:
                    print_status("max_attempts_reached")
            except Exception as e:
                print_error("token_error", {"error": str(e)})
                attempts += 1
                if attempts < max_attempts:
                    time.sleep(retry_interval)

        return None

    def _get_manual_email(self):
        self.tab.get("https://www.cursor.com/settings")
        time.sleep(1)
        try:
            email_selector = "css:body > main > div > div > div > div > div > div.col-span-1.flex.flex-col.gap-2.xl\\:gap-4 > div:nth-child(1) > div.flex.w-full.flex-col.gap-2 > div:nth-child(2) > p.\\[\\&_b\\]\\:md\\:font-semibold.\\[\\&_strong\\]\\:md\\:font-semibold.text-base\\/\\[1\\.5rem\\].text-brand-gray-400"
            email_ele = self.tab.ele(email_selector, timeout=1)
            email = email_ele.text
            return email
        except Exception: return None

class CursorAutoLogin:
    def __init__(self, token, lang="en"):
        self.token = token
        self.lang = lang.lower()
        self.browser_service = BrowserService(headless=False)
        self.browser_generator = self.browser_service.init_browser()

        # Generator'ı doğru şekilde işliyoruz
        browser = None
        while True:
            try:
                browser = next(self.browser_generator)
                # Eğer browser bir string ise, bu bir hata mesajıdır
                if isinstance(browser, str):
                    print_status("browser_message", {"message": browser})
                    continue
                break
            except StopIteration as e:
                # Generator tamamlandığında, gerçek browser nesnesini alıyoruz
                browser = e.value
                break

        self.browser = browser
        self.tab = self.browser.latest_tab
        print_status("browser_initialized")

    def _get_localized_text(self):
        # En popüler 8 dil için çeviriler
        translations = {
            "en": "Quick Login: Click \"Sign In\" button in Cursor app, then copy and paste the URL here to automatically login!",
            "es": "Inicio de sesión rápido: ¡Haz clic en el botón \"Iniciar sesión\" en la aplicación Cursor, luego copia y pega la URL aquí para iniciar sesión automáticamente!",
            "fr": "Connexion rapide : Cliquez sur le bouton \"Se connecter\" dans l'application Cursor, puis copiez et collez l'URL ici pour vous connecter automatiquement !",
            "de": "Schnelle Anmeldung: Klicken Sie in der Cursor-App auf die Schaltfläche \"Anmelden\", kopieren Sie dann die URL und fügen Sie sie hier ein, um sich automatisch anzumelden!",
            "it": "Accesso rapido: Fai clic sul pulsante \"Accedi\" nell'app Cursor, quindi copia e incolla l'URL qui per accedere automaticamente!",
            "tr": "Hızlı Giriş: Cursor uygulamasındaki \"Giriş Yap\" düğmesine tıklayın, ardından otomatik olarak giriş yapmak için URL'yi buraya kopyalayıp yapıştırın!",
            "ru": "Быстрый вход: Нажмите кнопку \"Войти\" в приложении Cursor, затем скопируйте и вставьте URL-адрес здесь, чтобы автоматически войти в систему!",
            "zh": "快速登录：点击 Cursor 应用中的\"登录\"按钮，然后将 URL 复制并粘贴到此处以自动登录！",
            "ja": "クイックログイン：Cursorアプリの「サインイン」ボタンをクリックし、URLをここにコピー＆ペーストして自動的にログインしてください！",
            "pt": "Login Rápido: Clique no botão \"Entrar\" no aplicativo Cursor, depois copie e cole o URL aqui para fazer login automaticamente!"
        }

        # Dil kodu yoksa veya desteklenmeyen bir dil ise İngilizce kullan
        return translations.get(self.lang, translations["en"])

    def auto_login(self):
        print_status("auto_login_starting")
        try:
            # Boş bir sayfaya giderek cookie'yi ekleyebiliriz
            self.tab.get("https://www.cursor.com")
            print_status("navigated_to_cursor")

            # JavaScript ile cookie ekle
            cookie_script = f"""
            document.cookie = "WorkosCursorSessionToken={self.token}; domain=.cursor.com; path=/; secure";
            """
            self.tab.run_js(cookie_script)
            print_status("account_logged_in")

            # Sayfayı yenile
            self.tab.refresh()
            time.sleep(3)  # Sayfanın yüklenmesi için bekle

            # Kullanıcı bilgilerini almak için ayarlar sayfasına git
            self.tab.get("https://www.cursor.com/settings")
            time.sleep(2)

            # Çeviriyi al
            localized_message = self._get_localized_text()

            # DOM'a bilgi ekleyen JavaScript kodunu çalıştır - HTML ve tekst kısmı
            html_part = f"""
            // Sayfanın üstüne bir bilgi kutusu ekle
            const infoDiv = document.createElement('div');
            infoDiv.style.position = 'fixed';
            infoDiv.style.top = '0';
            infoDiv.style.left = '0';
            infoDiv.style.right = '0';
            infoDiv.style.backgroundColor = '#4CAF50';
            infoDiv.style.color = 'white';
            infoDiv.style.padding = '15px';
            infoDiv.style.textAlign = 'center';
            infoDiv.style.zIndex = '9999';
            infoDiv.style.fontWeight = 'bold';
            infoDiv.style.fontSize = '16px';
            infoDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

            // Bilgi metni
            infoDiv.innerHTML = `
                <div>
                    <p style="margin: 0;">{localized_message}</p>
                    <input type="text" id="loginUrlInput" placeholder="Paste login URL from Cursor here..."
                           style="margin-top: 10px; padding: 8px; width: 80%; border-radius: 4px; border: none;" />
                    <button id="processLoginButton"
                            style="background-color: #2E7D32; color: white; border: none; padding: 8px 15px;
                                   border-radius: 4px; cursor: pointer; margin-left: 10px;">
                        Login
                    </button>
                </div>
            `;

            document.body.prepend(infoDiv);
            """

            # JavaScript fonksiyon kısmı
            js_part = """
            // URL işleme fonksiyonu
            document.getElementById('processLoginButton').addEventListener('click', function() {
                const loginUrl = document.getElementById('loginUrlInput').value.trim();
                if (loginUrl) {
                    // İki farklı URL formatını kontrol et
                    if (loginUrl.includes('authenticator.cursor.sh')) {
                        // Birinci format: authenticator.cursor.sh URL'sindeki returnTo parametresinden deep link URL'sini çıkar
                        try {
                            const stateParam = new URLSearchParams(new URL(loginUrl).search).get('state');
                            if (stateParam) {
                                const stateObj = JSON.parse(decodeURIComponent(stateParam));
                                if (stateObj.returnTo) {
                                    // returnTo URL'sine git
                                    const deepLinkUrl = decodeURIComponent(stateObj.returnTo);
                                    console.log('Extracted deep link URL:', deepLinkUrl);
                                    window.location.href = deepLinkUrl;
                                    return;
                                }
                            }
                        } catch (e) {
                            console.error('Error parsing state parameter:', e);
                        }
                        alert('Could not extract deep link URL from authenticator URL');
                    } else if (loginUrl.includes('/loginDeepControl')) {
                        // İkinci format: Doğrudan loginDeepControl URL'si
                        console.log('Deep link URL detected, navigating...');
                        window.location.href = loginUrl;
                        return;
                    } else {
                        // Token URL olduğunu varsayıp token'ı çıkarmayı dene
                        const tokenMatch = loginUrl.match(/token=([^&]+)/);
                        if (tokenMatch && tokenMatch[1]) {
                            const token = decodeURIComponent(tokenMatch[1]);
                            document.cookie = `WorkosCursorSessionToken=${token}; domain=.cursor.com; path=/; secure`;
                            window.location.reload();
                            return;
                        }
                    }
                    alert('Invalid login URL. Please make sure you copied the complete URL from Cursor.');
                } else {
                    alert('Please paste the login URL from Cursor.');
                }
            });

            // Enter tuşu ile de çalışması için
            document.getElementById('loginUrlInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    document.getElementById('processLoginButton').click();
                }
            });
            """

            # JavaScript kodlarını çalıştır
            self.tab.run_js(html_part)
            self.tab.run_js(js_part)

            # Tarayıcıyı açık tut, kullanıcı kapatana kadar bekle
            print_status("cursor_browser_login_info", {"message": "At this stage, you can log in to this account via Cursor IDE."})
            print_status("OK")

            # Tarayıcının açık kalması için bekle
            try:
                while True:
                    time.sleep(60)
            except KeyboardInterrupt:
                print_status("browser_closing", {"message": "User interrupted, closing browser"})
                self.browser_service.quit()

        except Exception as e:
            print_error("auto_login_error", {"error": str(e)})
            self.browser_service.quit()
            return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Cursor Operations')
    subparsers = parser.add_subparsers(dest='command')
    db_manager_parser = subparsers.add_parser('cursor_db_manager', help='Cursor Database Manager CLI')
    db_manager_parser.add_argument('--email')
    db_manager_parser.add_argument('--access-token')
    db_manager_parser.add_argument('--refresh-token')
    db_manager_parser.add_argument('--platform', choices=['windows', 'macos', 'linux'], default='windows')
    test_account_parser = subparsers.add_parser('test_cursor_account', help='Test Cursor Account')
    test_account_parser.add_argument('--token', required=True, help='Account token to test')
    subparsers.add_parser('patch_cursor')
    subparsers.add_parser('cursor_manual_auth', help='Manual authentication for Cursor')

    auto_login_parser = subparsers.add_parser('auto_login_browser', help='Automatic login with token')
    auto_login_parser.add_argument('--token', required=True, help='Session token for auto login')
    auto_login_parser.add_argument('--lang', default='en', help='Language code for UI text (en, es, fr, de, it, tr, ru, zh, ja, pt)')

    update_parser = subparsers.add_parser('update', help='Update application from zip file')
    update_parser.add_argument('--zip-path', required=True, help='Path to the update zip file')
    update_parser.add_argument('--target-folder', required=True, help='Target folder to extract files')
    args = parser.parse_args()
    if args.command == 'cursor_db_manager': CursorDatabaseManager(platform_name=args.platform).update_auth(email=args.email, access_token=args.access_token, refresh_token=args.refresh_token)
    elif args.command == 'patch_cursor': CursorPatch().execute()
    elif args.command == 'test_cursor_account': TestCursorAccount(args.token).test_cursor_account()
    elif args.command == 'cursor_manual_auth': CursorManualAuth().manual_auth()
    elif args.command == 'auto_login_browser': CursorAutoLogin(args.token, args.lang).auto_login()
    elif args.command == 'update':
        UpdateService().update_application(args.zip_path, args.target_folder)
