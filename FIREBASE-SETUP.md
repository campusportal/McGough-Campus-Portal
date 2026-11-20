# 5-Minute Free Google Firebase Cloud Firestore Setup (WWP-TFO-4)

Follow these 5 steps once to give your GitHub Pages portal live multi-device database sync at $0/month on the Firebase Spark plan:

1. **Create Your Free Firebase Project**:
   - Open https://console.firebase.google.com/ and click **Create a project** (or **Add project**).
   - Name it `ellendale-wwp-portal` (Google Analytics is optional - you can toggle it off) and click **Create project**.

2. **Enable Cloud Firestore Database**:
   - In the left sidebar, open **Build -> Firestore Database** and click **Create database**.
   - Select **Standard edition**, pick a US location close to North Dakota (such as `nam5 (us-central)`), choose **Start in production mode**, and click **Create**.

3. **Enable Anonymous Authentication & Publish Security Rules**:
   - In the left sidebar, open **Build -> Authentication -> Get started -> Sign-in method**, click **Anonymous**, toggle **Enable** ON, and click **Save**.
   - Go back to **Build -> Firestore Database -> Rules**, paste the contents of `firestore.rules` from this repository, and click **Publish**.

4. **Register Your Web App & Copy `firebaseConfig`**:
   - Click the gear icon next to **Project Overview -> Project settings**, scroll down to **Your apps**, and click the Web icon (`</>`).
   - Enter nickname `WWP-TFO-4 GitHub Pages`, leave Firebase Hosting unchecked (since GitHub Pages hosts your HTML/CSS/JS), click **Register app**, and copy the `firebaseConfig` block.

5. **Paste Into `js/storage.js` & Push to GitHub**:
   - Open `js/storage.js` and paste your 6 keys (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`) into `DEFAULT_FIREBASE_CONFIG` at the top of the file (or click **Cloud Sync: Setup Firebase** on the portal login screen, paste your snippet, and click **Copy DEFAULT_FIREBASE_CONFIG for js/storage.js**).
   - Commit and push all files in this folder to `kissmydilley/WWP-TFO-4`. Every phone, tablet, and laptop opening your GitHub Pages URL will immediately show a green **Cloud Live** badge and sync in real time!
