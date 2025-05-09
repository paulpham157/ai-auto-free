import json, sys, os, time, random, requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from DrissionPage import ChromiumOptions, Chromium
import zipfile
import subprocess

def _contains_chinese(text): return any('\u4e00' <= char <= '\u9fff' for char in str(text))

def print_status(status, data=None):
    if _contains_chinese(status) or (data and _contains_chinese(str(data))): return
    output = {"status": status, **(data and {"data": data} or {})}
    print(json.dumps(output, ensure_ascii=False), flush=True)

def print_error(error, data=None):
    if _contains_chinese(error) or (data and _contains_chinese(str(data))): return
    output = {"error": error, **(data and {"data": data} or {})}
    print(json.dumps(output, ensure_ascii=False), flush=True)

class UserAgentService:
    def __init__(self):
        self.user_agents_url = "https://www.whatismybrowser.com/guides/the-latest-user-agent/android"
        self.cache_file = os.path.join(os.path.dirname(__file__), "user_agents_cache.json")
        self.cache_duration = timedelta(days=1)

    def _is_cache_valid(self):
        if not os.path.exists(self.cache_file): return False
        try:
            with open(self.cache_file, 'r', encoding='utf-8') as f:
                cached_data = json.load(f)
                if not cached_data: return False
        except: return False
        return datetime.now() - datetime.fromtimestamp(os.path.getmtime(self.cache_file)) < self.cache_duration

    def _fetch_user_agents(self):
        for attempt in range(2):
            try:
                response = requests.get(self.user_agents_url)
                if response.status_code == 200: return [span.text.strip() for span in BeautifulSoup(response.text, 'html.parser').select("span.code")] or None
                if attempt == 0: time.sleep(3)
            except:
                if attempt == 0: time.sleep(3)
        return None

    def remove_user_agent(self, user_agent):
        try:
            user_agents = self._read_from_cache()
            if user_agents and user_agent in user_agents:
                user_agents.remove(user_agent)
                self._save_to_cache(user_agents)
                print_status(f"User agent removed successfully.")
                return True
            return False
        except Exception as e:
            print_error(f"User agent removal failed: {str(e)}")
            return False

    def _save_to_cache(self, user_agents):
        try:
            with open(self.cache_file, 'w', encoding='utf-8') as f: json.dump(user_agents, f)
        except: pass

    def _read_from_cache(self):
        try:
            with open(self.cache_file, 'r', encoding='utf-8') as f: return json.load(f) or None
        except: return None

    def get_random_user_agent(self):
        if not self._is_cache_valid():
            user_agents = self._fetch_user_agents()
            if user_agents: self._save_to_cache(user_agents)
        else: user_agents = self._read_from_cache()

        if not user_agents:
            user_agents = self._fetch_user_agents()
            if user_agents: self._save_to_cache(user_agents)
            else: return None

        return random.choice(user_agents)

class BrowserService:
    def __init__(self, headless=True):
        self.browser, self.headless, self.user_agent_service = None, headless, UserAgentService()

    def init_browser(self):
        print_status("init_browser_starting")
        co_generator = self._get_browser_options()
        try:
            while True: yield next(co_generator)
        except StopIteration as e:
            self.co = e.value
            self.quit()
            return self._get_browser_with_user_agent()

    def _get_browser_with_user_agent(self):
        try:
            user_agent = self.user_agent_service.get_random_user_agent()
            self.co.set_user_agent(user_agent)
            self.browser = Chromium(self.co)
            print_status("user_agent_set", {"user_agent": user_agent})
        except Exception as e:
            print_error("Error setting user agent", {"error": str(e)})
            self.browser = Chromium(self.co)
        return self.browser

    def _get_browser_options(self):
        co = ChromiumOptions()
        co.set_argument("--lang=en-US")
        co.set_pref("intl.accept_languages", "en-US")

        try:
            extension_path_generator = self._get_extension_path()
            while True: yield next(extension_path_generator)
        except StopIteration as e:
            if e.value: co.add_extension(e.value)
        except Exception as e:
            yield f"Chrome extension loading error: {e}"

        co.set_pref("credentials_enable_service", False)
        co.set_argument("--hide-crash-restore-bubble")
        co.auto_port()

        if self.headless: co.set_argument("--headless=new")
        if sys.platform in ["darwin", "linux"]:
            co.set_argument("--no-sandbox")
            co.set_argument("--disable-gpu")

        return co

    def _get_extension_path(self):
        try:
            extension_path = os.path.join(os.path.dirname(__file__), "turnstilePatch")
            if not os.path.exists(extension_path): raise FileNotFoundError(f"Extension directory not found: {extension_path}")
            if not os.path.exists(os.path.join(extension_path, "manifest.json")): raise FileNotFoundError(f"manifest.json not found in extension directory")
            return extension_path
        except Exception as e:
            yield f"Extension path error: {str(e)}"

    def quit(self):
        if self.browser: self.browser.quit()

class UpdateService:
    def __init__(self):
        pass

    def update_application(self, zip_path, target_folder):
        try:
            # AIAutoFree.exe process'ini sessizce sonlandırma
            try:
                startupinfo = subprocess.STARTUPINFO()
                startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                startupinfo.wShowWindow = subprocess.SW_HIDE
                subprocess.run(['taskkill', '/F', '/IM', 'AIAutoFree.exe'],
                             startupinfo=startupinfo,
                             capture_output=True)
                subprocess.run(['taskkill', '/F', '/IM', 'AI Auto Free.exe'],
                             startupinfo=startupinfo,
                             capture_output=True)
                time.sleep(2)
            except Exception as e:
                pass

            # Zip dosyasını hedef klasöre çıkartma
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                total_files = len(zip_ref.namelist())
                for index, file in enumerate(zip_ref.namelist(), 1):
                    zip_ref.extract(file, target_folder)

            # AIAutoFree.exe'yi sessizce yeniden başlatma
            exe_path = os.path.join(target_folder, "AIAutoFree.exe")
            if os.path.exists(exe_path):
                startupinfo = subprocess.STARTUPINFO()
                startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                startupinfo.wShowWindow = subprocess.SW_HIDE
                subprocess.Popen([exe_path],
                               startupinfo=startupinfo,
                               creationflags=subprocess.CREATE_NO_WINDOW)
                import sys
                sys.exit(0)
            else:
                return False

        except Exception:
            return False
