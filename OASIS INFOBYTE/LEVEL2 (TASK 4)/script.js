document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const toast = document.getElementById('toast');
    
    // Initialize the app
    initApp();

    // Event Listeners
    signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
    });

    signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
    });

    registerForm.addEventListener('submit', handleRegister);
    loginForm.addEventListener('submit', handleLogin);
    
    // Password validation indicators
    const regPassword = document.getElementById('regPassword');
    if (regPassword) {
        regPassword.addEventListener('input', validatePassword);
    }

    // Functions
    function initApp() {
        // Check authentication status on page load
        const authToken = localStorage.getItem('authToken');
        const currentUser = localStorage.getItem('currentUser');
        
        if (authToken && currentUser) {
            // Verify token hasn't expired (simple frontend check)
            const tokenData = parseJwt(authToken);
            if (tokenData && tokenData.exp > Date.now() / 1000) {
                showSecuredPage(currentUser);
                return;
            } else {
                // Token expired, clear it
                clearAuthData();
            }
        }
        
        // Show login form if not authenticated
        container.style.display = 'flex';
    }

    function handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        // Basic validation
        if (!username || !password || !confirmPassword) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        if (username.length < 4) {
            showToast('Username must be at least 4 characters', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        if (!isPasswordValid(password)) {
            showToast('Password does not meet requirements', 'error');
            return;
        }
        
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(user => user.username === username);
        
        if (userExists) {
            showToast('Username already exists', 'error');
            return;
        }
        
        // Create new user with hashed password (simple frontend hashing)
        const newUser = {
            username,
            password: hashPassword(password),
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        showToast('Registration successful! Please log in.', 'success');
        container.classList.remove("right-panel-active");
        
        // Clear form
        registerForm.reset();
        resetPasswordValidation();
    }

    function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        // Check credentials
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.username === username);
        
        if (!user || !verifyPassword(password, user.password)) {
            showToast('Invalid username or password', 'error');
            return;
        }
        
        // Create auth token (simple frontend implementation)
        const authToken = createAuthToken(username);
        
        // Store authentication data
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', username);
        
        showSecuredPage(username);
    }

    function showSecuredPage(username) {
        // Hide the login/register container
        container.style.display = 'none';
        
        // Remove any existing secured container
        const existingContainer = document.getElementById('securedContainer');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        // Create secured page content
        const securedContainer = document.createElement('div');
        securedContainer.className = 'secured-container';
        securedContainer.id = 'securedContainer';
        
        securedContainer.innerHTML = `
            <div class="secured-content">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${encodeURIComponent('512da8')}&color=fff&size=100" alt="User Avatar" class="user-avatar">
                <h1>Welcome, ${username}!</h1>
                <p>You have successfully logged in to our secure system.</p>
                <p>Last login: ${new Date().toLocaleString()}</p>
                <button class="logout-btn" id="logoutBtn">Logout</button>
            </div>
        `;
        
        document.body.appendChild(securedContainer);
        
        // Add logout event listener
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    }

    function handleLogout() {
        clearAuthData();
        
        // Show login container and hide secured page
        const securedContainer = document.getElementById('securedContainer');
        if (securedContainer) {
            securedContainer.remove();
        }
        
        container.style.display = 'flex';
        showToast('You have been logged out', 'info');
        
        // Clear login form
        loginForm.reset();
    }

    function clearAuthData() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }

    // Simple password hashing (not secure, just for demonstration)
    function hashPassword(password) {
        return btoa(password + '|' + new Date().getTime());
    }

    function verifyPassword(password, hashedPassword) {
        try {
            const decoded = atob(hashedPassword).split('|')[0];
            return decoded === password;
        } catch (e) {
            return false;
        }
    }

    // Simple JWT-like token creation (frontend only)
    function createAuthToken(username) {
        const header = {
            alg: 'none',
            typ: 'JWT'
        };
        
        const payload = {
            sub: username,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
        };
        
        return btoa(JSON.stringify(header)) + '.' + 
               btoa(JSON.stringify(payload)) + '.' + 
               'signature';
    }

    function parseJwt(token) {
        try {
            const base64Payload = token.split('.')[1];
            return JSON.parse(atob(base64Payload));
        } catch (e) {
            return null;
        }
    }

    function validatePassword() {
        const password = this.value;
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        // Update UI for each requirement
        for (const [key, met] of Object.entries(requirements)) {
            const element = document.getElementById(key);
            if (element) {
                element.classList.toggle('valid', met);
            }
        }
    }

    function resetPasswordValidation() {
        const requirements = ['length', 'uppercase', 'number', 'special'];
        requirements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.remove('valid');
            }
        });
    }

    function isPasswordValid(password) {
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[!@#$%^&*(),.?":{}|<>]/.test(password)
        );
    }

    function showToast(message, type) {
        toast.textContent = message;
        toast.className = 'toast show ' + type;
        
        setTimeout(() => {
            toast.className = toast.className.replace('show', '');
        }, 3000);
    }
});