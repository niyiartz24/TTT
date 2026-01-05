// ==========================================
// ADMIN.JS - ADMIN DASHBOARD LOGIC
// No Firebase Storage needed - images stored as Base64!
// ==========================================

console.log('🔥 ADMIN.JS: Starting to load...');

// Use absolute path from root
const isInAdminFolder = window.location.pathname.includes('/admin/');
const firebasePath = isInAdminFolder ? '../js/firebase.js' : './js/firebase.js';

console.log('Loading firebase from:', firebasePath);
console.log('Current path:', window.location.pathname);

import { auth, db } from '../js/firebase.js';

console.log('🔥 ADMIN.JS: Firebase imported', { auth, db });

import { 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';

console.log('🔥 ADMIN.JS: Firebase Auth functions imported');

import { 
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';

console.log('🔥 ADMIN.JS: Firebase Firestore functions imported');

// ==========================================
// DEBUG: Check if Firebase is loaded
// ==========================================
console.log('=== ADMIN.JS LOADED SUCCESSFULLY ===');
console.log('Auth object:', auth);
console.log('Database object:', db);

// Update debug output if on login page
if (document.getElementById('debug-output')) {
    const debugOutput = document.getElementById('debug-output');
    debugOutput.innerHTML = '✅ Admin script loaded<br>✅ Firebase connected<br>Ready to login!';
}

// ==========================================
// PAGE DETECTION
// ==========================================

const isLoginPage = window.location.pathname.includes('login.html');
const isDashboardPage = window.location.pathname.includes('index.html');

console.log('Current page - Login:', isLoginPage, 'Dashboard:', isDashboardPage);

// ==========================================
// AUTH STATE OBSERVER
// ==========================================

console.log('Setting up auth state observer...');

let authCheckComplete = false;

onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed. User:', user?.email || 'Not logged in');
    
    // Prevent infinite redirect loops
    if (authCheckComplete) {
        console.log('Auth check already processed, skipping...');
        return;
    }
    
    if (user) {
        // User is logged in
        console.log('User authenticated:', user.email);
        authCheckComplete = true;
        
        if (isLoginPage) {
            console.log('On login page, redirecting to dashboard...');
            // Use absolute path for hosted sites
            const dashboardPath = window.location.pathname.replace('login.html', 'index.html');
            console.log('Redirecting to:', dashboardPath);
            window.location.href = dashboardPath;
        } else if (isDashboardPage) {
            console.log('On dashboard, initializing...');
            // Initialize dashboard
            initDashboard(user);
        }
    } else {
        // User is not logged in
        console.log('No user authenticated');
        authCheckComplete = true;
        
        if (isDashboardPage) {
            console.log('On dashboard without auth, redirecting to login...');
            // Use absolute path for hosted sites
            const loginPath = window.location.pathname.replace('index.html', 'login.html');
            console.log('Redirecting to:', loginPath);
            window.location.href = loginPath;
        } else if (isLoginPage) {
            console.log('On login page, ready for user input');
        }
    }
}, (error) => {
    console.error('Auth state observer error:', error);
});

// ==========================================
// LOGIN FUNCTIONALITY
// ==========================================

if (isLoginPage) {
    console.log('📋 Initializing login page...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        console.log('⏳ Waiting for DOM to load...');
        document.addEventListener('DOMContentLoaded', initLoginPage);
    } else {
        console.log('✅ DOM already loaded, initializing now...');
        initLoginPage();
    }
}

function initLoginPage() {
    console.log('🔧 initLoginPage() called');
    
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const statusMessage = document.getElementById('status-message');
    const loginBtn = document.getElementById('login-btn');
    const manualRedirectBtn = document.getElementById('manual-redirect-btn');

    console.log('Form elements:', {
        loginForm: !!loginForm,
        emailInput: !!emailInput,
        passwordInput: !!passwordInput,
        errorMessage: !!errorMessage,
        statusMessage: !!statusMessage,
        loginBtn: !!loginBtn,
        manualRedirectBtn: !!manualRedirectBtn
    });

    if (!loginForm) {
        console.error('❌ ERROR: Login form not found!');
        return;
    }

    console.log('✅ Login form found, attaching event listener...');

    // Helper function to show status
    function showStatus(message, type = 'loading') {
        console.log(`[STATUS ${type}] ${message}`);
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.className = `status-message show ${type}`;
        }
        if (errorMessage && type !== 'error') {
            errorMessage.classList.remove('show');
        }
    }

    // Helper function to show error
    function showError(message) {
        console.error(`[ERROR] ${message}`);
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.className = 'status-message show error';
        }
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');
        }
    }

    // Show initial ready status
    showStatus('✅ Ready to login!', 'success');
    setTimeout(() => {
        if (statusMessage) statusMessage.classList.remove('show');
    }, 2000);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('🚀 Login form submitted!');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        console.log('📧 Email:', email);
        console.log('🔑 Password length:', password.length);
        
        showStatus('Connecting to Firebase...', 'loading');

        // Disable button and show loading
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="spinner"></span> Logging in...';

        try {
            console.log('🔐 Calling signInWithEmailAndPassword...');
            showStatus('Authenticating...', 'loading');
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            console.log('✅ Login successful!', userCredential.user.email);
            console.log('User UID:', userCredential.user.uid);
            
            showStatus('✅ Login successful! Redirecting...', 'success');
            
            // Force immediate redirect - don't wait for auth observer
            console.log('➡️ Forcing redirect to dashboard...');
            
            // Use multiple redirect strategies for compatibility
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
            const dashboardUrl = basePath + '/index.html';
            
            console.log('Dashboard URL:', dashboardUrl);
            
            // Try multiple redirect methods
            setTimeout(() => {
                try {
                    window.location.replace(dashboardUrl);
                } catch (e) {
                    console.log('Replace failed, trying href...');
                    window.location.href = dashboardUrl;
                }
                
                // If still on login page after 2 seconds, show manual button
                setTimeout(() => {
                    if (window.location.pathname.includes('login.html')) {
                        console.log('Auto-redirect failed, showing manual button');
                        if (manualRedirectBtn) {
                            manualRedirectBtn.style.display = 'block';
                            manualRedirectBtn.onclick = () => {
                                window.location.href = dashboardUrl;
                            };
                        }
                    }
                }, 2000);
            }, 800);
            
        } catch (error) {
            console.error('❌ Login error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Full error object:', error);
            
            let errorText = 'Login failed. Please check your credentials.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorText = '❌ No account found. Did you create an admin user in Firebase Authentication?';
                    console.error('HINT: Go to Firebase Console → Authentication → Users → Add User');
                    break;
                case 'auth/wrong-password':
                    errorText = '❌ Incorrect password. Please try again.';
                    break;
                case 'auth/invalid-email':
                    errorText = '❌ Invalid email address format.';
                    break;
                case 'auth/too-many-requests':
                    errorText = '❌ Too many failed attempts. Please try again later.';
                    break;
                case 'auth/invalid-credential':
                    errorText = '❌ Invalid credentials. Check your email and password.';
                    break;
                case 'auth/network-request-failed':
                    errorText = '❌ Network error. Check your internet connection.';
                    break;
                case 'auth/invalid-api-key':
                    errorText = '❌ Firebase configuration error. Check your API key.';
                    break;
                default:
                    errorText = `❌ ${error.message}`;
            }

            showError(errorText);
            
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    });

    console.log('✅ Login event listener attached successfully');
}

// ==========================================
// DASHBOARD INITIALIZATION
// ==========================================

function initDashboard(user) {
    // Display admin email
    const adminEmailElement = document.getElementById('admin-email');
    if (adminEmailElement) {
        adminEmailElement.textContent = user.email;
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Error logging out. Please try again.');
            }
        });
    }

    // Initialize upload form
    initUploadForm();

    // Load products for management
    loadProductsForManagement();
}

// ==========================================
// UPLOAD FORM FUNCTIONALITY
// ==========================================

function initUploadForm() {
    const uploadForm = document.getElementById('upload-form');
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');
    const productCategoryInput = document.getElementById('product-category');
    const productImageInput = document.getElementById('product-image');
    const imagePreview = document.getElementById('image-preview');
    const uploadProgress = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const uploadMessage = document.getElementById('upload-message');
    const uploadBtn = document.getElementById('upload-btn');

    // Image preview
    productImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 1MB recommended for Firestore)
            if (file.size > 1024 * 1024) {
                alert('Image size should be less than 1MB for best performance');
                productImageInput.value = '';
                imagePreview.innerHTML = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Form submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = productNameInput.value.trim();
        const price = parseFloat(productPriceInput.value);
        const category = productCategoryInput.value;
        const imageFile = productImageInput.files[0];

        // Validation
        if (!name || !price || !category || !imageFile) {
            showMessage(uploadMessage, 'Please fill all fields', 'error');
            return;
        }

        // Validate image file
        if (!imageFile.type.startsWith('image/')) {
            showMessage(uploadMessage, 'Please upload a valid image file', 'error');
            return;
        }

        // Disable form during upload
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';
        uploadProgress.style.display = 'block';
        uploadMessage.classList.remove('success', 'error');
        uploadMessage.style.display = 'none';

        try {
            // Convert image to Base64
            progressText.textContent = 'Processing image...';
            console.log('Starting image conversion...');
            
            const base64Image = await convertImageToBase64(imageFile);
            console.log('Image converted successfully, size:', base64Image.length);

            progressFill.style.width = '50%';
            progressText.textContent = 'Uploading to database...';

            // Check if Base64 is too large (Firestore limit is 1MB per document)
            if (base64Image.length > 1000000) {
                throw new Error('Compressed image is still too large. Please use a smaller image file.');
            }

            console.log('Saving to Firestore...');
            
            // Save product to Firestore with Base64 image
            const docRef = await addDoc(collection(db, 'products'), {
                name: name,
                price: price,
                category: category,
                imageBase64: base64Image, // Store image as Base64
                createdAt: serverTimestamp()
            });

            console.log('Product saved with ID:', docRef.id);

            progressFill.style.width = '100%';
            progressText.textContent = 'Upload complete!';

            // Success
            showMessage(uploadMessage, 'Product uploaded successfully!', 'success');
            uploadForm.reset();
            imagePreview.innerHTML = '';
            
            setTimeout(() => {
                resetUploadForm();
            }, 1000);

        } catch (error) {
            console.error('Full error details:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            let errorMessage = 'Error uploading product: ';
            
            // Specific error messages
            if (error.code === 'permission-denied') {
                errorMessage += 'Permission denied. Make sure you are logged in as admin.';
            } else if (error.message && error.message.includes('too large')) {
                errorMessage += 'Image file is too large. Please use an image under 500KB.';
            } else if (error.code === 'unavailable') {
                errorMessage += 'Network error. Check your internet connection.';
            } else if (error.message) {
                errorMessage += error.message;
            } else {
                errorMessage += 'Unknown error. Check console for details.';
            }
            
            showMessage(uploadMessage, errorMessage, 'error');
            resetUploadForm();
        }
    });

    function resetUploadForm() {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload Product';
        uploadProgress.style.display = 'none';
        progressFill.style.width = '0%';
    }
}

// ==========================================
// CONVERT IMAGE TO BASE64
// ==========================================

function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        console.log('Converting image:', file.name, 'Size:', file.size);
        
        const reader = new FileReader();
        
        reader.onload = () => {
            console.log('File read complete, creating image...');
            
            // Compress image if needed
            const img = new Image();
            img.onload = () => {
                console.log('Image loaded. Original dimensions:', img.width, 'x', img.height);
                
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if image is too large (max 800px width)
                const maxWidth = 800;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                    console.log('Resizing to:', width, 'x', height);
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to Base64 with quality compression
                const base64 = canvas.toDataURL('image/jpeg', 0.7); // Reduced to 70% quality
                console.log('Base64 created, length:', base64.length);
                
                resolve(base64);
            };

            img.onerror = (err) => {
                console.error('Image load error:', err);
                reject(new Error('Failed to load image'));
            };
            
            img.src = reader.result;
        };

        reader.onerror = (err) => {
            console.error('FileReader error:', err);
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
    });
}

// ==========================================
// LOAD PRODUCTS FOR MANAGEMENT
// ==========================================

function loadProductsForManagement() {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;

    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));

    onSnapshot(q, (snapshot) => {
        productsList.innerHTML = '';

        if (snapshot.empty) {
            productsList.innerHTML = '<p class="loading">No products yet. Upload your first product!</p>';
            return;
        }

        snapshot.forEach((doc) => {
            const product = doc.data();
            const productItem = createProductItem(doc.id, product);
            productsList.appendChild(productItem);
        });
    }, (error) => {
        console.error('Error loading products:', error);
        productsList.innerHTML = '<p class="loading">Error loading products.</p>';
    });
}

// ==========================================
// CREATE PRODUCT ITEM FOR MANAGEMENT
// ==========================================

function createProductItem(id, product) {
    const item = document.createElement('div');
    item.className = 'product-item';

    const formattedPrice = product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    item.innerHTML = `
        <img src="${product.imageBase64}" alt="${product.name}">
        <div class="product-item-info">
            <h4>${product.name}</h4>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Price:</strong> ₦${formattedPrice}</p>
        </div>
        <button class="btn-delete" data-id="${id}">
            Delete
        </button>
    `;

    // Delete functionality
    const deleteBtn = item.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => deleteProduct(id, product.name));

    return item;
}

// ==========================================
// DELETE PRODUCT
// ==========================================

async function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
        return;
    }

    try {
        // Delete product from Firestore (no storage to clean up!)
        await deleteDoc(doc(db, 'products', productId));
        alert('Product deleted successfully!');
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
    }
}

// ==========================================
// UTILITY: SHOW MESSAGE
// ==========================================

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';

    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}
