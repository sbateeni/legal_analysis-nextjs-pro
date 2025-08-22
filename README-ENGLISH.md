# Smart Legal Analysis Platform

An advanced legal analysis platform using artificial intelligence, specifically designed for the Palestinian legal system.

## 🚀 Key Features

- **Advanced Legal Analysis**: 12-stage sequential and cumulative legal analysis
- **Smart Legal Assistant**: Interactive AI conversation
- **Analytics & Statistics**: Detailed case and usage statistics
- **Progressive Web App (PWA)**: Can be installed as a mobile app
- **Responsive Interface**: Works perfectly on all devices
- **Privacy Protection**: All data stored locally

## 📁 Project Structure

```
legal_analysis-nextjs-pro/
├── frontend/                 # Main application
│   ├── pages/               # Next.js pages
│   │   ├── index.tsx        # Home page
│   │   ├── chat.tsx         # Legal assistant
│   │   ├── analytics.tsx    # Analytics & statistics
│   │   ├── history.tsx      # Case history
│   │   ├── about.tsx        # About page
│   │   ├── privacy.tsx      # Privacy policy
│   │   └── api/            # API endpoints
│   ├── components/          # React components
│   ├── utils/              # Utility tools
│   ├── types/              # TypeScript definitions
│   ├── stages/             # Legal stage files
│   ├── public/             # Public files (PWA)
│   └── styles/             # CSS files
├── pages/                   # Additional pages (root directory)
├── components/              # Additional components
├── contexts/                # React contexts
├── utils/                   # Additional utility tools
├── types/                   # Additional TypeScript types
├── styles/                  # Additional styles
├── next.config.js           # Next.js configuration
├── vercel.json              # Vercel deployment settings
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

## 🛠️ Technologies Used

- **Next.js 15**: Main framework
- **React 18**: UI library
- **TypeScript**: For safe and organized code
- **Google Gemini AI**: For legal analysis
- **IndexedDB**: For local data storage
- **PWA**: For local app experience

## ⚡ Installation & Setup

### Requirements
- Node.js 18+ 
- Gemini API key from Google AI Studio

### Installation Steps

1. **Clone the project:**
```bash
git clone <repository-url>
cd legal_analysis-nextjs-pro
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
# Create .env.local file
echo "GOOGLE_API_KEY=your_gemini_api_key_here" > .env.local
echo "NEXT_PUBLIC_ENCRYPTION_SECRET=your_secret_key_here" >> .env.local
```

4. **Run the application:**
```bash
npm run dev
```

5. **Open browser:**
```
http://localhost:3000
```

## 🔑 Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new account or sign in
3. Create new API key
4. Copy the key and add it to `.env.local`

## 📱 Using the Application

### 1. Data Entry
- Enter Gemini API key
- Write case name
- Enter case details

### 2. Legal Analysis
- Go to "Analysis Stages" tab
- Start with first stage
- Follow stages in order

### 3. Legal Assistant
- Go to assistant page
- Ask legal questions
- Get smart answers

### 4. Analytics
- Review statistics
- Track case progress
- Get detailed insights

## 🚀 Deploying to Vercel

### Applied Solutions for 404 Error:

1. ✅ Removed incorrect `@/*` path from `tsconfig.json`
2. ✅ Cleaned `pages` directory from unnecessary files
3. ✅ Created `_document.tsx`
4. ✅ Converted `next.config.ts` to `next.config.js`
5. ✅ Updated `vercel.json` with `rewrites` settings
6. ✅ Created `.vercelignore`
7. ✅ Improved build script

### Deployment Steps:

1. **Ensure code is updated:**
```bash
git add .
git commit -m "Fix 404 error - complete solution"
git push origin main
```

2. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings" → "General"
   - Ensure "Framework Preset" is "Next.js"
   - Click "Redeploy"

3. **Required Build Settings:**
   - Build Command: `npm run build`
   - Install Command: `npm ci`
   - Output Directory: `.next`
   - Root Directory: `./` (or leave empty)

### Environment Variables in Vercel:
- `GOOGLE_API_KEY`: Gemini API key
- `NEXT_PUBLIC_ENCRYPTION_SECRET`: Encryption secret
- `NODE_ENV`: `production`

### If 404 Error Persists:

#### Solution 1: Reset Project
1. Delete project from Vercel
2. Re-link with Git
3. Ensure "Next.js" is selected as Framework

#### Solution 2: Use Alternative File
```bash
mv vercel-alt.json vercel.json
git add .
git commit -m "Try alternative vercel config"
git push origin main
```

#### Solution 3: Check Build Logs
1. In Vercel Dashboard, go to "Deployments"
2. Click on latest deployment
3. Check "Build Logs" and "Function Logs"

## 🔒 Security & Privacy

- ✅ All data stored locally on your device
- ✅ No data sent to external servers
- ✅ Advanced encryption for sensitive data
- ✅ Protection from XSS and SQL Injection attacks

## 📄 Legal Stages

1. **Identify Legal Problem**
2. **Gather Information & Documents**
3. **Analyze Legal Texts**
4. **Identify Applicable Legal Rules**
5. **Analyze Judicial Precedents**
6. **Analyze Legal Doctrine**
7. **Analyze Factual Circumstances**
8. **Identify Possible Legal Solutions**
9. **Evaluate Legal Solutions**
10. **Choose Optimal Solution**
11. **Formulate Legal Solution**
12. **Provide Recommendations**
13. **Final Legal Petition**

## 🛠️ Troubleshooting

### Common Issues & Solutions:

1. **404 Error in Vercel:**
   - Review `DEPLOYMENT.md`
   - Check `vercel.json` settings
   - Verify `next.config.js`

2. **Build Issues:**
   ```bash
   # Clean and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

3. **TypeScript Issues:**
   - Check `tsconfig.json`
   - Verify dependency versions

### Useful Testing Commands:

```bash
# Test build locally
npm run build

# Test running
npm run start

# Clean and rebuild
rm -rf .next && npm run build

# Check dependencies
npm audit
npm outdated
```

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the project
2. Create feature branch
3. Make changes
4. Send Pull Request

## 📞 Support

For technical support or questions:
- Open Issue on GitHub
- Review `DEPLOYMENT.md`
- Check environment settings
- Review Vercel build logs

## 📄 License

This project is licensed under MIT License.

---

**Note**: This application is specifically designed for the Palestinian legal system and should be used as an assistance tool, not as a substitute for professional legal consultation.

**Important Note**: Comprehensive solutions have been applied for the 404 error in Vercel. Review `DEPLOYMENT.md` for complete details. 