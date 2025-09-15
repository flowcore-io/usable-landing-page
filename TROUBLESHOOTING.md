# Troubleshooting Guide - Usable Landing Page

## Problem: Running Wrong Project

### Issue
When running a local development server, you might see a completely different project (e.g., Flowcore instead of Usable) even though you're in the correct directory and serving the right files.

### Root Causes
1. **Browser Cache**: Browser is serving cached content from a previous project
2. **Port Conflicts**: Multiple projects running on same port
3. **Service Worker Cache**: PWA service workers caching old content
4. **DNS/Network Cache**: System-level caching of localhost responses

### Solution Steps

#### 1. Kill All Node Processes
```bash
# Windows
taskkill /f /im node.exe

# macOS/Linux
pkill -f node
```

#### 2. Check Port Usage
```bash
# Windows
netstat -ano | findstr :8000

# macOS/Linux
lsof -i :8000
```

#### 3. Clear Browser Cache
- **Hard Refresh**: `Ctrl + F5` or `Ctrl + Shift + R`
- **Developer Tools**: F12 → Network tab → check "Disable cache"
- **Incognito Mode**: Open new incognito/private window
- **Clear Cache**: Settings → Privacy → Clear browsing data

#### 4. Use Different Port
```bash
# If port 8000 is cached, use a different port
npx http-server -p 8001 -o
```

#### 5. Verify Correct Project
Check server logs for correct asset loading:
```
✅ Correct: "GET /assets/images/Alminni%20-%20Logo%20-%20transparent.png"
❌ Wrong: "GET /assets/images/flowcore-logo.png"
```

### Prevention
- Always use `taskkill /f /im node.exe` before starting new servers
- Use incognito mode for testing different projects
- Clear browser cache between project switches
- Use different ports for different projects
- Verify asset loading in server logs

### Quick Fix Command Sequence
```bash
# 1. Kill existing processes
taskkill /f /im node.exe

# 2. Start fresh server
npx http-server -p 8000 -o

# 3. If still wrong project, try different port
npx http-server -p 8001 -o
```

## Success Indicators
When the Usable project is running correctly, you should see:
- ✅ Usable logo and branding
- ✅ "Development teams forget. Usable remembers." hero text
- ✅ Blue and orange nudibranch mascot
- ✅ Server logs showing Usable assets being loaded

## Common Issues
- **404 favicon.ico**: Normal - just means no favicon is set
- **Service worker errors**: Normal - project doesn't use service workers
- **Deprecation warnings**: Normal - from http-server package

---
*Created: September 10, 2025*
*Last Updated: September 10, 2025*


