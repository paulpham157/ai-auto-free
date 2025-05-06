import platform, os, pathlib, re, shutil, random
from uuid import uuid4

class CursorPatch:
    def __init__(self):
        self.SYSTEM = platform.system()
        if self.SYSTEM not in ("Windows", "Linux", "Darwin"): print(f"Unsupported OS: {self.SYSTEM}"); exit()
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
            print("Cursor base path not found"); exit()
    def jspath(self, p):
        jspath = self.curbasepath() / "out" / "main.js" if not p else self.path(p)
        if not jspath.exists(): print("File not found"); exit()
        return jspath
    def randomuuid(self, randomuuid):
        if not randomuuid: randomuuid = self.uuid(); print("Generated UUID", {"uuid": randomuuid})
        return randomuuid
    def macaddr(self, macaddr):
        if not macaddr:
            while not macaddr or macaddr in ("00:00:00:00:00:00", "ff:ff:ff:ff:ff:ff", "ac:de:48:00:11:22"):
                macaddr = ":".join([f"{random.randint(0, 255):02X}" for _ in range(6)])
            print("Generated MAC address", {"mac": macaddr})
        return macaddr
    def load(self, path):
        with open(path, "rb") as f: return f.read()
    def save(self, path, data):
        print("Saving file")
        try:
            with open(path, "wb") as f: f.write(data); print("File saved successfully"); print("OK")
        except PermissionError: print("Permission denied", {"message": f"The file '{path}' is in use, please close it and try again"}); exit()
    def backup(self, path):
        print("Creating backup")
        bakfile = path.with_name(path.name + ".bak")
        if not os.path.exists(bakfile): shutil.copy2(path, bakfile); print("Backup created")
        else: print("Backup exists")
    def replace(self, data, pattern, replace, probe):
        pattern, replace, probe = (p.encode() if isinstance(p, str) else p for p in (pattern, replace, probe))
        assert all(isinstance(p, bytes) for p in (pattern, replace, probe))
        print("Replacing pattern")
        regex, patched_regex = re.compile(pattern, re.DOTALL), re.compile(probe, re.DOTALL)
        count, patched_count = len(list(regex.finditer(data))), len(list(patched_regex.finditer(data)))
        if count == 0:
            if patched_count > 0: print("Found already patched patterns")
            else: print("Warning", {"message": f"Pattern <{pattern}> not found, SKIPPED!"}); return data
        data, replaced1_count = patched_regex.subn(replace, data)
        data, replaced2_count = regex.subn(replace, data)
        replaced_count = replaced1_count + replaced2_count
        if replaced_count != count + patched_count: print("Warning", {"message": f"Patched {replaced_count}/{count}, failed {count - replaced_count}"})
        else: print("Patching complete")
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

if __name__ == "__main__":
    cp = CursorPatch()
    cp.execute()
