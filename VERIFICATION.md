# ZK Tools Verification

Bare `nargo` and `bb` commands are environment-preconditioned. If your global `PATH` is not configured to include them (or their wrappers), running them from a fresh PowerShell will fail. 

To execute the verification checks exactly as they would run in a preconditioned environment, use the provided local verification script:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-local.ps1
```

This script safely updates the session-local `PATH` to include the project-local wrapper scripts (`nargo.bat` and `bb.bat`) and then executes the exact required checks:
- `nargo test --program-dir circuits/auction_settle`
- `bb --version`

## Fallback Wrappers
If you want to run the tools manually without modifying `PATH` in your session or running the script, you can use the explicit local wrappers:
```powershell
.\nargo.bat test --program-dir circuits/auction_settle
.\bb.bat --version
```
