# 🚀 **RAILWAY DEPLOYMENT GUIDE - OPTION 4**

**Method:** Railway Configuration File (Monorepo)  
**Status:** ✅ **READY TO DEPLOY**

---

## 📁 **FILES CREATED**

### **railway.json** ✅
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **railway.toml** ✅
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "cd server && npm start"
healthcheckPath = "/api/health"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[environments.production]
variables = { NODE_ENV = "production" }
```

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Commit Configuration Files**
```bash
# Add the Railway configuration files
git add railway.json railway.toml
git commit -m "Add Railway configuration for backend deployment"
git push
```

### **Step 2: Deploy to Railway**
1. **Go to [railway.app](https://railway.app)**
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository:** `ai-heartbridge`
6. **Railway will detect the configuration files**

### **Step 3: Configure Environment Variables**
In Railway dashboard, add these variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-heartbridge

# API Keys
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars

# Server
NODE_ENV=production
PORT=3001
```

### **Step 4: Deploy**
1. **Click "Deploy"**
2. **Railway will:**
   - Install dependencies
   - Build the TypeScript
   - Start the server
   - Run health checks

---

## 🔧 **HOW IT WORKS**

### **Railway Configuration:**
- ✅ **`startCommand`** - Tells Railway to run `cd server && npm start`
- ✅ **`healthcheckPath`** - Monitors `/api/health` endpoint
- ✅ **`builder`** - Uses Nixpacks for Node.js detection
- ✅ **`restartPolicy`** - Auto-restarts on failure

### **Build Process:**
1. **Railway detects** your repository
2. **Reads configuration** from `railway.toml`
3. **Installs dependencies** in server folder
4. **Builds TypeScript** (`npm run build`)
5. **Starts server** (`npm start`)
6. **Health checks** `/api/health` endpoint

---

## 🌐 **GET YOUR BACKEND URL**

After deployment, Railway will give you:
```
https://your-app-name.railway.app
```

**Example:** `https://ai-heartbridge-backend.railway.app`

---

## 🔄 **UPDATE FRONTEND**

### **Update Environment Variables:**
```bash
# In your frontend (Vercel dashboard or .env)
VITE_API_URL=https://your-app-name.railway.app
```

### **Redeploy Frontend:**
```bash
# If using Vercel CLI
vercel --prod

# Or push to GitHub (auto-deploy)
git add .
git commit -m "Update API URL for Railway backend"
git push
```

---

## ✅ **VERIFICATION**

### **Test Your Backend:**
```bash
# Health check
curl https://your-app-name.railway.app/api/health

# Expected response:
{"status":"OK","timestamp":"2025-10-18T..."}
```

### **Test Frontend Connection:**
1. **Open your frontend app**
2. **Check browser console** for API calls
3. **Verify no CORS errors**
4. **Test authentication flow**

---

## 🎯 **EXPECTED RESULTS**

After deployment:
- ✅ **Backend running** on Railway
- ✅ **Health endpoint** responding
- ✅ **Frontend connecting** to backend
- ✅ **Full app working** end-to-end

---

## 🔍 **TROUBLESHOOTING**

### **If Railway doesn't detect the server folder:**
1. **Check `railway.toml`** is in root directory
2. **Verify `startCommand`** points to server folder
3. **Ensure server/package.json** has start script

### **If build fails:**
1. **Check environment variables** are set
2. **Verify MongoDB URI** is correct
3. **Check Railway logs** for errors

### **If health check fails:**
1. **Verify `/api/health`** endpoint exists
2. **Check server is starting** properly
3. **Review Railway logs**

---

## 📊 **MONITORING**

### **Railway Dashboard:**
- ✅ **Deployment status**
- ✅ **Logs and errors**
- ✅ **Resource usage**
- ✅ **Environment variables**

### **Health Monitoring:**
- ✅ **Automatic health checks**
- ✅ **Auto-restart on failure**
- ✅ **Uptime monitoring**

---

## 🎉 **SUCCESS!**

Your complete stack will be:
- 🌐 **Frontend:** Vercel (`https://ai-heart-bridge.vercel.app`)
- ⚡ **Backend:** Railway (`https://your-app.railway.app`)
- 🗄️ **Database:** MongoDB Atlas (free tier)

**Total cost: $0/month!** 🚀

---

## 🚀 **QUICK DEPLOY COMMANDS**

```bash
# 1. Commit Railway config
git add railway.json railway.toml
git commit -m "Add Railway configuration"
git push

# 2. Deploy to Railway (via dashboard)
# Go to railway.app → New Project → Deploy from GitHub

# 3. Update frontend API URL
# Set VITE_API_URL in Vercel dashboard

# 4. Test everything works!
```

---

**Your AI HeartBridge app will be fully deployed and working!** 💝
