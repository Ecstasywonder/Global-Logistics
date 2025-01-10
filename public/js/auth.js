document.addEventListener('DOMContentLoaded', function() {
    // Initialize forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // Initialize password toggles
    initializePasswordToggles();
    
    // Add form handlers
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Check for registration success message
    checkRegistrationSuccess();
});

function initializePasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.closest('.relative').querySelector('input');
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            
            // Toggle icon
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    const remember = e.target.querySelector('input[type="checkbox"]')?.checked;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, remember })
        });

        const data = await response.json();

        if (data.success) {
            // Store token
            localStorage.setItem('authToken', data.token);
            if (remember) {
                localStorage.setItem('rememberMe', 'true');
            }

            // Redirect based on user role
            redirectBasedOnRole(data.user.role);
        } else {
            showError(data.message || 'Login failed');
        }
    } catch (error) {
        showError('An error occurred during login');
    }
}

async function handleRegistration(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());

    // Validate passwords match
    if (userData.password !== userData.confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (data.success) {
            // Redirect to login with success message
            window.location.href = '/login?registered=true';
        } else {
            showError(data.message || 'Registration failed');
        }
    } catch (error) {
        showError('An error occurred during registration');
    }
}

function redirectBasedOnRole(role) {
    switch (role) {
        case 'admin':
            window.location.href = '/admin';
            break;
        case 'staff':
            window.location.href = '/dashboard/staff';
            break;
        default:
            window.location.href = '/dashboard';
    }
}

function checkRegistrationSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
        showSuccess('Registration successful! Please log in.');
    }
}

function showError(message) {
    const notification = createNotification(message, 'error');
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showSuccess(message) {
    const notification = createNotification(message, 'success');
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function createNotification(message, type) {
    const div = document.createElement('div');
    div.className = `notification notification-${type}`;
    div.textContent = message;
    return div;
}

// Token management
function getAuthToken() {
    return localStorage.getItem('authToken');
}

function removeAuthToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rememberMe');
}

// Logout functionality
window.handleLogout = async function() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (response.ok) {
            removeAuthToken();
            window.location.href = '/login';
        }
    } catch (error) {
        showError('Logout failed');
    }
};

// Check authentication status
export function isAuthenticated() {
    return !!getAuthToken();
}

// Add authentication headers to fetch requests
export function authFetch(url, options = {}) {
    const token = getAuthToken();
    if (!token) {
        return Promise.reject(new Error('No authentication token'));
    }

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    });
} 