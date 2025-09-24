// Firebase 設定
const firebaseConfig = {
    apiKey: "AIzaSyCTEQRZYcpzRDJJUPi88DxFmfLZQRBCLTw",
    authDomain: "nwcom-checkin.firebaseapp.com",
    projectId: "nwcom-checkin",
    storageBucket: "nwcom-checkin.firebasestorage.app",
    messagingSenderId: "121673680169",
    appId: "1:121673680169:web:a1ba8d244432053c48a338",
    measurementId: "G-6LDQZJ2MFM"
  };

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 取得服務實例
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// 匯出供其他模組使用
window.firebaseApp = {
    auth,
    db,
    storage
};