// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

// Import Firebase modules (NO STORAGE NEEDED!)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

// ==========================================
// FIREBASE CONFIG - TTT FOOTWEARS
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyDuOnDSxusQwmMp52fFM-XKsnW93CWE0BE",
    authDomain: "learn-feadc.firebaseapp.com",
    projectId: "learn-feadc",
    storageBucket: "learn-feadc.firebasestorage.app",
    messagingSenderId: "1085239453979",
    appId: "1:1085239453979:web:8a44f7dfb930626ed58bbe"
};

// ==========================================
// DEBUG: Check configuration
// ==========================================
console.log('=== FIREBASE.JS LOADED ===');
console.log('Firebase config:', {
    apiKey: firebaseConfig.apiKey.substring(0, 10) + '...',
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
});

// ==========================================
// INITIALIZE FIREBASE
// ==========================================

let app, auth, db;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    alert('Firebase initialization failed! Check console for details.');
}

// ==========================================
// EXPORT FIREBASE SERVICES
// ==========================================

export { auth, db };