Cursor Reset Trial

```powershell
irm https://raw.githubusercontent.com/ruwiss/ai-auto-free/refs/heads/master/utils/patch_cursor.ps1 | iex
```

If you have execution policy restrictions, you can run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; irm https://raw.githubusercontent.com/ruwiss/ai-auto-free/refs/heads/master/utils/patch_cursor.ps1 | iex
```
