document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    const togglePasswordBtn = loginForm.querySelector('.fa-eye').parentElement;

    // Password visibility toggle
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        
        // Toggle icon
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = loginForm.querySelector('input[type="email"]').value;
        const password = passwordInput.value;
        const remember = loginForm.querySelector('input[type="checkbox"]').checked;

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
                // Store auth token
                localStorage.setItem('authToken', data.token);
                if (remember) {
                    localStorage.setItem('rememberMe', 'true');
                }

                // Redirect based on user role
                if (data.user.role === 'admin') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/dashboard';
                }
            } else {
                showError(data.message || 'Login failed');
            }
        } catch (error) {
            showError('An error occurred. Please try again.');
        }
    });
});

function showError(message) {
    // Remove any existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create and show new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4';
    errorDiv.textContent = message;
    
    const form = document.getElementById('loginForm');
    form.insertAdjacentElement('beforebegin', errorDiv);

    // Remove error after 3 seconds
    setTimeout(() => errorDiv.remove(), 3000);
} 