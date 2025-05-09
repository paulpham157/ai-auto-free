import sys, json, importlib.util

def print_status(status, data=None):
    output = {"status": status, **(data and {"data": data} or {})}
    print(json.dumps(output, ensure_ascii=False), flush=True)

def print_error(error, data=None):
    output = {"error": error, **(data and {"data": data} or {})}
    print(json.dumps(output, ensure_ascii=False), flush=True)

class Check:
    def __init__(self):
        self.version = sys.version_info
        self.dependencies = ["requests", "bs4", "DrissionPage"]

    def check_version(self):
        if self.version >= (3, 10): return True
        print_error("Python 3.10 or higher is required.")
        return False

    def check_dependencies(self):
        for dependency in self.dependencies:
            if importlib.util.find_spec(dependency) is None:
                print_error(f"{dependency} is not installed. Please install dependencies by running\n\n'pip install DrissionPage requests beautifulsoup4'")
                return False
        return True

if __name__ == "__main__":
    check = Check()
    if check.check_version() and check.check_dependencies(): print_status("OK")
