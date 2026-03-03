const firebaseConfig = {
  apiKey: "AIzaSyCkbSf9Q_Frgbv-4Q6PqasrThDXBl1IJEY",
  authDomain: "volunteer-management-systems.firebaseapp.com",
  databaseURL: "https://volunteer-management-systems-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "volunteer-management-systems",
  storageBucket: "volunteer-management-systems.firebasestorage.app",
  messagingSenderId: "731686702642",
  appId: "1:731686702642:web:f3e76639c1cd35c35e762b"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Test Database Connection
function testDatabaseConnection() {
    database.ref('.info/connected').on('value', (snap) => {
        if (snap.val() === true) {
            console.log(' Database connected successfully');
            showToast('Database connected', 'success');
        } else {
            console.log(' Database not connected');
            showToast('Database connection lost', 'error');
        }
    });
}

function showToast(message, icon = 'success') {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
    
    Toast.fire({
        icon: icon,
        title: message
    });
}

function showLoading(message = 'Please wait...') {
    Swal.fire({
        title: message,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

function showSuccess(title, message, redirectUrl = null) {
    Swal.fire({
        icon: 'success',
        title: title,
        text: message,
        timer: redirectUrl ? 2000 : null,
        showConfirmButton: !redirectUrl,
        willClose: () => {
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        }
    });
}

function showError(title, message) {
    Swal.fire({
        icon: 'error',
        title: title,
        text: message,
        confirmButtonColor: '#667eea'
    });
}

function showWarning(title, message, confirmCallback) {
    Swal.fire({
        icon: 'warning',
        title: title,
        text: message,
        showCancelButton: true,
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed && confirmCallback) {
            confirmCallback();
        }
    });
}

function showInputDialog(title, inputLabel, inputPlaceholder, confirmCallback) {
    Swal.fire({
        title: title,
        input: 'text',
        inputLabel: inputLabel,
        inputPlaceholder: inputPlaceholder,
        showCancelButton: true,
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
            if (!value) {
                return 'This field is required!';
            }
        }
    }).then((result) => {
        if (result.isConfirmed && confirmCallback) {
            confirmCallback(result.value);
        }
    });
}

function showError(id, message) {
    const el = document.getElementById(id);
    if (el) el.textContent = message;
}

function clearErrors() {
    const errors = document.querySelectorAll(".error");
    errors.forEach(err => err.textContent = "");
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// SIGNUP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function(e) {
        e.preventDefault();
        clearErrors();

        const name = document.getElementById("name").value.trim();
        const fname = document.getElementById("fname").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const role = document.getElementById("role").value;

        let isValid = true;

        if (!name) {
            showError("nameError", "Name required");
            isValid = false;
        }

        if (!fname) {
            showError("fnameError", "Father's name required");
            isValid = false;
        }

        if (!email) {
            showError("emailError", "Email required");
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError("emailError", "Invalid email format");
            isValid = false;
        }

        if (!password) {
            showError("passwordError", "Password required");
            isValid = false;
        } else if (password.length < 6) {
            showError("passwordError", "Password must be at least 6 characters");
            isValid = false;
        }

        if (!role) {
            showError("roleError", "Please select a role");
            isValid = false;
        }

        if (!isValid) return;

        showLoading('Creating your account...');

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;

                return user.updateProfile({ 
                    displayName: name,
                    photoURL: null 
                }).then(() => {
                    return { user, name, fname, email, role };
                });
            })
            .then(({ user, name, fname, email, role }) => {
                const userData = {
                    userId: user.uid,
                    name: name,
                    fatherName: fname,
                    email: email,
                    role: role,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    status: 'active',
                    profileComplete: true
                };

                return database.ref('users/' + user.uid).set(userData)
                    .then(() => {
                        console.log(' User data saved to database');
                        Swal.close(); // Close loading
                        return userData;
                    });
            })
            .then((userData) => {
                showSuccess(
                    'Signup Successful! ',
                    `Welcome ${userData.name}! Your account has been created.`,
                    userData.role === "admin" ? "admin.html" : "home.html"
                );
            })
            .catch(error => {
                Swal.close(); 
                console.error('Signup Error:', error);
                
                let errorMessage = error.message;
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'This email is already registered. Please use a different email or login.';
                } else if (error.code === 'auth/network-request-failed') {
                    errorMessage = 'Network error. Please check your internet connection.';
                }
                
                showError('Signup Failed', errorMessage);
                
               
                if (error.code === 'auth/email-already-in-use') {
                    showError("emailError", "Email already in use");
                }
            });
    });
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        clearErrors();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email && !password) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Email and password are required!',
                confirmButtonColor: '#667eea'
            });
            return;
        }
        
        if (!email) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Email is required!',
                confirmButtonColor: '#667eea'
            });
            return;
        }
        
        if (!password) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Password is required!',
                confirmButtonColor: '#667eea'
            });
            return;
        }

        if (!isValidEmail(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Invalid email format!',
                confirmButtonColor: '#667eea'
            });
            return;
        }

        showLoading('Logging in...');

        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;

                return database.ref('users/' + user.uid).update({
                    lastLogin: new Date().toISOString()
                }).then(() => {
                    return { user };
                });
            })
            .then(({ user }) => {
                return database.ref('users/' + user.uid).once('value')
                    .then(snapshot => {
                        Swal.close();
                        
                        const data = snapshot.val();
                        if (!data) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'User data not found!',
                                confirmButtonColor: '#667eea'
                            });
                            return;
                        }

                        showToast(`Welcome ${data.name}!`, 'success');

                        setTimeout(() => {
                            if (data.role === "admin") {
                                window.location.href = "admin.html";
                            } else {
                                window.location.href = "home.html";
                            }
                        }, 1500);
                    });
            })
            .catch(error => {
                Swal.close();
                
                console.log('ERROR CODE:', error.code);
                console.log('ERROR MESSAGE:', error.message);
                
                let message = '';
                
                // Firebase errors
                if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
                    message = 'Email is wrong!';
                }
                else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    message = 'Password is wrong!';
                }
                else if (error.code === 'auth/too-many-requests') {
                    message = 'Too many attempts! Try later.';
                }
                else if (error.code === 'auth/network-request-failed') {
                    message = 'Network error!';
                }
                else {
                    const errorMsg = error.message.toLowerCase();
                    if (errorMsg.includes('password')) {
                        message = 'Password is wrong!';
                    } else if (errorMsg.includes('email') || errorMsg.includes('user')) {
                        message = 'Email is wrong!';
                    } else {
                        message = 'Login failed! Try again.';
                    }
                }
                
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message,
                    confirmButtonColor: '#667eea',
                    confirmButtonText: 'OK'
                });
            });
    });
}

// FORGOT PASSWORD WITH SWEETALERT
const forgotPasswordBtn = document.getElementById('forgotPassword');

if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        Swal.fire({
            title: 'Reset Password',
            html: 'Enter your email address and we\'ll send you a link to reset your password.',
            input: 'email',
            inputLabel: 'Email Address',
            inputPlaceholder: 'Enter your email',
            showCancelButton: true,
            confirmButtonColor: '#667eea',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Send Reset Link',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value) {
                    return 'Email is required!';
                }
                if (!isValidEmail(value)) {
                    return 'Please enter a valid email address!';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const email = result.value;
                
                showLoading('Sending reset link...');
                
                auth.sendPasswordResetEmail(email)
                    .then(() => {
                        Swal.close();
                        Swal.fire({
                            icon: 'success',
                            title: 'Email Sent!',
                            html: `Password reset link has been sent to <strong>${email}</strong>. Check your inbox.`,
                            confirmButtonColor: '#667eea'
                        });
                    })
                    .catch(error => {
                        Swal.close();
                        
                        let errorMessage = '';
                        switch (error.code) {
                            case 'auth/user-not-found':
                                errorMessage = 'No account found with this email address.';
                                break;
                            case 'auth/invalid-email':
                                errorMessage = 'Invalid email address.';
                                break;
                            default:
                                errorMessage = error.message;
                        }
                        
                        Swal.fire({
                            icon: 'error',
                            title: 'Failed to Send',
                            text: errorMessage,
                            confirmButtonColor: '#667eea'
                        });
                    });
            }
        });
    });
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
        showWarning(
            'Logout Confirmation',
            'Are you sure you want to logout?',
            () => {
                showLoading('Logging out...');
                
                auth.signOut()
                    .then(() => {
                        Swal.close();
                        showToast('Logged out successfully', 'success');
                        window.location.href = "index.html";
                    })
                    .catch(error => {
                        Swal.close();
                        showError('Logout Failed', error.message);
                    });
            }
        );
    });
}

// AUTH STATE OBSERVER
auth.onAuthStateChanged(user => {
    const userName = document.getElementById("userName");
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (user) {
        if (userName) {
            database.ref('users/' + user.uid).once('value')
                .then(snapshot => {
                    const data = snapshot.val();
                    if (data) {
                        userName.textContent = data.name || user.displayName || 'User';
                    } else {
                        userName.textContent = user.displayName || 'User';
                    }
                })
                .catch(() => {
                    userName.textContent = user.displayName || 'User';
                });
        }

        if (currentPage === 'index.html' || currentPage === '') {
            database.ref('users/' + user.uid).once('value')
                .then(snapshot => {
                    const data = snapshot.val();
                    if (data && data.role === 'admin') {
                        window.location.href = "admin.html";
                    } else {
                        window.location.href = "home.html";
                    }
                })
                .catch(() => {
                    window.location.href = "home.html";
                });
        }
    } else {
        if (userName) {
            userName.textContent = 'Guest';
        }

        const protectedPages = ['home.html', 'admin.html', 'dashboard.html'];
        if (protectedPages.includes(currentPage)) {
            showToast('Please login to continue', 'warning');
            window.location.href = "index.html";
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    testDatabaseConnection();
});