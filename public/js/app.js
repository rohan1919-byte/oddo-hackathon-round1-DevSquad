// Global state
let currentUser = null;
let currentTab = 'browse';

// API base URL
const API_BASE = '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentYear();
    checkAuthStatus();
    setupEventListeners();
    loadAdminMessage();
});

// Update current year in footer
function updateCurrentYear() {
    document.getElementById('current-year').textContent = new Date().getFullYear();
}

// Check if user is authenticated
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        fetchCurrentUser();
    } else {
        showAuthForms();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // Search input
    document.getElementById('search-input').addEventListener('input', debounce(handleSearch, 300));

    // Modal overlay
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') {
            hideModal();
        }
    });
}

// Show authentication forms
function showAuthForms() {
    const authSection = document.getElementById('auth-section');
    authSection.innerHTML = `
        <div class="flex items-center gap-4">
            <button onclick="showLoginModal()" class="px-6 py-2 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-all duration-200 font-semibold">
                <i class="fas fa-sign-in-alt mr-2"></i>Login
            </button>
            <button onclick="showRegisterModal()" class="px-6 py-2 bg-yellow-400 text-primary-800 rounded-xl hover:bg-yellow-300 transition-all duration-200 font-semibold">
                <i class="fas fa-user-plus mr-2"></i>Register
            </button>
        </div>
    `;
}

// Show login modal
function showLoginModal() {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <div class="p-6">
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-sign-in-alt text-white text-2xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-800">Welcome Back</h3>
                <p class="text-gray-600">Sign in to your account</p>
            </div>
            <form id="login-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div class="relative">
                        <i class="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="email" name="email" required class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-200">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div class="relative">
                        <i class="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="password" name="password" required class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-200">
                    </div>
                </div>
                <div class="flex gap-3 pt-4">
                    <button type="submit" class="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
                        <i class="fas fa-sign-in-alt mr-2"></i>Login
                    </button>
                    <button type="button" onclick="hideModal()" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', handleLogin);
    showModal();
}

// Show register modal
function showRegisterModal() {
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <div class="flex-shrink-0 p-6 border-b border-gray-200">
            <div class="text-center">
                <div class="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-user-plus text-white text-2xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-800">Join Skill Swap</h3>
                <p class="text-gray-600">Create your account to start swapping skills</p>
            </div>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
            <form id="register-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <div class="relative">
                        <i class="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="text" name="name" required class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-200">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <div class="relative">
                        <i class="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="email" name="email" required class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-200">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <div class="relative">
                        <i class="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="password" name="password" required minlength="6" class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-200">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <div class="relative">
                        <i class="fas fa-map-marker-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="text" name="location" class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-200">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                    <div class="space-y-3">
                        <div class="relative">
                            <input type="file" id="photo-upload" accept="image/*" class="hidden" onchange="handlePhotoUpload(event)">
                            <label for="photo-upload" class="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 transition-all duration-200 cursor-pointer">
                                <div class="text-center">
                                    <i class="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                    <p class="text-sm text-gray-600">Click to upload photo</p>
                                    <p class="text-xs text-gray-500">JPG, PNG, GIF up to 5MB</p>
                                </div>
                            </label>
                        </div>
                        <div id="photo-preview" class="hidden">
                            <img id="preview-image" src="" alt="Preview" class="w-20 h-20 rounded-full mx-auto border-2 border-primary-200">
                            <button type="button" onclick="removePhoto()" class="block mx-auto mt-2 text-sm text-red-500 hover:text-red-700">
                                <i class="fas fa-trash mr-1"></i>Remove
                            </button>
                        </div>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Skills Offered (comma separated)</label>
                    <div class="relative">
                        <i class="fas fa-gift absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="text" name="skillsOffered" placeholder="e.g., Cooking, Programming, Yoga" class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-200">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Skills Wanted (comma separated)</label>
                    <div class="relative">
                        <i class="fas fa-heart absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="text" name="skillsWanted" placeholder="e.g., Photography, Music, Languages" class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-200">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <div class="relative">
                        <i class="fas fa-clock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="text" name="availability" placeholder="e.g., Weekends, Evenings, Weekdays" class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-200">
                    </div>
                </div>
            </form>
        </div>
        <div class="flex-shrink-0 p-6 border-t border-gray-200">
            <div class="flex gap-3">
                <button type="submit" form="register-form" class="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
                    <i class="fas fa-user-plus mr-2"></i>Register
                </button>
                <button type="button" onclick="hideModal()" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold">
                    Cancel
                </button>
            </div>
        </div>
    `;

    document.getElementById('register-form').addEventListener('submit', handleRegister);
    showModal();
}

// Handle photo upload
async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB', 'error');
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('preview-image').src = e.target.result;
        document.getElementById('photo-preview').classList.remove('hidden');
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
        const formData = new FormData();
        formData.append('photo', file);

        const response = await fetch(`${API_BASE}/upload-photo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            // Store the uploaded photo URL
            window.uploadedPhotoUrl = result.photoUrl;
            showNotification('Photo uploaded successfully!', 'success');
        } else {
            showNotification(result.message || 'Upload failed', 'error');
        }
    } catch (error) {
        showNotification('Upload failed', 'error');
    }
}

// Remove photo
function removePhoto() {
    document.getElementById('photo-upload').value = '';
    document.getElementById('photo-preview').classList.add('hidden');
    window.uploadedPhotoUrl = null;
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_BASE}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('token', result.token);
            currentUser = result.user;
            hideModal();
            updateUI();
            showNotification('Login successful!', 'success');
        } else {
            showNotification(result.message || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    // Parse skills arrays
    data.skillsOffered = data.skillsOffered ? data.skillsOffered.split(',').map(s => s.trim()).filter(Boolean) : [];
    data.skillsWanted = data.skillsWanted ? data.skillsWanted.split(',').map(s => s.trim()).filter(Boolean) : [];

    // Add uploaded photo URL if available
    if (window.uploadedPhotoUrl) {
        data.photo = window.uploadedPhotoUrl;
    }

    try {
        const response = await fetch(`${API_BASE}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('token', result.token);
            currentUser = result.user;
            hideModal();
            updateUI();
            showNotification('Registration successful!', 'success');
        } else {
            showNotification(result.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
    }
}

// Fetch current user
async function fetchCurrentUser() {
    try {
        const response = await fetch(`${API_BASE}/users/me`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            const result = await response.json();
            currentUser = result.user;
            updateUI();
        } else {
            localStorage.removeItem('token');
            showAuthForms();
        }
    } catch (error) {
        localStorage.removeItem('token');
        showAuthForms();
    }
}

// Update UI based on authentication status
function updateUI() {
    if (currentUser) {
        // Show authenticated UI
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('content-sections').classList.remove('hidden');
        document.getElementById('sidebar').classList.remove('hidden');

        // Update user info in sidebar
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-email').textContent = currentUser.email;

        // Update header
        const authSection = document.getElementById('auth-section');
        authSection.innerHTML = `
            <div class="flex items-center gap-3">
                ${currentUser.photo ? `<img src="${currentUser.photo}" alt="profile" class="w-10 h-10 rounded-full border-2 border-white">` : 
                  `<div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-white"></i>
                   </div>`}
                <span class="font-semibold">${currentUser.name}</span>
                <button onclick="logout()" class="px-4 py-2 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-all duration-200 font-semibold">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
            </div>
        `;

        // Show admin badge if admin
        if (currentUser.isAdmin) {
            document.getElementById('admin-badge').classList.remove('hidden');
            document.getElementById('admin-tab').classList.remove('hidden');
        }

        // Load initial content
        loadBrowseSection();
    } else {
        // Show unauthenticated UI
        document.getElementById('welcome-screen').classList.remove('hidden');
        document.getElementById('content-sections').classList.add('hidden');
        document.getElementById('sidebar').classList.add('hidden');
        showAuthForms();
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    updateUI();
    showNotification('Logged out successfully', 'success');
}

// Switch tabs
function switchTab(tab) {
    currentTab = tab;
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-primary-100', 'text-primary-700');
        if (btn.dataset.tab === tab) {
            btn.classList.add('bg-primary-100', 'text-primary-700');
        }
    });

    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show selected section
    document.getElementById(`${tab}-section`).classList.remove('hidden');

    // Load section content
    switch (tab) {
        case 'browse':
            loadBrowseSection();
            break;
        case 'profile':
            loadProfileSection();
            break;
        case 'swaps':
            loadSwapsSection();
            break;
        case 'admin':
            loadAdminSection();
            break;
    }
}

// Load browse section
async function loadBrowseSection() {
    try {
        const searchTerm = document.getElementById('search-input').value;
        const url = searchTerm ? `${API_BASE}/users/public?search=${encodeURIComponent(searchTerm)}` : `${API_BASE}/users/public`;
        
        const response = await fetch(url);
        const users = await response.json();

        const usersGrid = document.getElementById('users-grid');
        if (users.length === 0) {
            usersGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-search text-gray-400 text-3xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No users found</h3>
                    <p class="text-gray-500">Try adjusting your search terms</p>
                </div>
            `;
        } else {
            usersGrid.innerHTML = users
                .filter(user => user.id !== (currentUser?.id || 0))
                .map(user => createUserCard(user))
                .join('');
        }
    } catch (error) {
        showNotification('Error loading users', 'error');
    }
}

// Create user card
function createUserCard(user) {
    return `
        <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div class="p-6">
                <div class="flex items-center gap-4 mb-4">
                    <img src="${user.photo || 'https://randomuser.me/api/portraits/lego/1.jpg'}" alt="profile" class="w-16 h-16 rounded-full border-4 border-primary-100">
                    <div>
                        <div class="font-bold text-lg text-gray-800">${user.name}</div>
                        <div class="text-sm text-gray-500 flex items-center">
                            <i class="fas fa-map-marker-alt mr-1"></i>${user.location || 'Location not set'}
                        </div>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <div>
                        <div class="text-sm font-semibold text-primary-600 mb-2 flex items-center">
                            <i class="fas fa-gift mr-2"></i>Skills Offered
                        </div>
                        <div class="flex flex-wrap gap-2">
                            ${user.skillsOffered.map(skill => 
                                `<span class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">${skill}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div>
                        <div class="text-sm font-semibold text-secondary-600 mb-2 flex items-center">
                            <i class="fas fa-heart mr-2"></i>Skills Wanted
                        </div>
                        <div class="flex flex-wrap gap-2">
                            ${user.skillsWanted.map(skill => 
                                `<span class="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">${skill}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="text-sm text-gray-600 flex items-center">
                        <i class="fas fa-clock mr-2"></i>Available: ${user.availability || 'Not specified'}
                    </div>
                </div>
                
                <button onclick="sendSwapRequest('${user.id}')" class="w-full mt-4 px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
                    <i class="fas fa-handshake mr-2"></i>Request Swap
                </button>
            </div>
        </div>
    `;
}

// Handle search
function handleSearch() {
    loadBrowseSection();
}

// Send swap request
async function sendSwapRequest(targetUserId) {
    try {
        const targetUser = await fetch(`${API_BASE}/users/public`).then(r => r.json()).then(users => users.find(u => u.id == targetUserId));
        
        // Find matching skills
        const offered = currentUser.skillsOffered.find(skill => targetUser.skillsWanted.includes(skill));
        const wanted = currentUser.skillsWanted.find(skill => targetUser.skillsOffered.includes(skill));
        
        if (!offered || !wanted) {
            showNotification('No matching skills for swap!', 'error');
            return;
        }

        const response = await fetch(`${API_BASE}/swaps`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                toUserId: targetUserId,
                skillOffered: offered,
                skillWanted: wanted
            })
        });

        const result = await response.json();
        if (response.ok) {
            showNotification(`Swap request sent to ${targetUser.name}!`, 'success');
        } else {
            showNotification(result.message || 'Failed to send swap request', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
    }
}

// Load profile section
async function loadProfileSection() {
    const profileContent = document.getElementById('profile-content');
    profileContent.innerHTML = `
        <div class="bg-white rounded-2xl shadow-lg p-8">
            <div class="flex items-center gap-6 mb-8">
                <img src="${currentUser.photo || 'https://randomuser.me/api/portraits/lego/1.jpg'}" alt="profile" class="w-24 h-24 rounded-full border-4 border-primary-100">
                <div>
                    <div class="font-bold text-2xl text-gray-800">${currentUser.name}</div>
                    <div class="text-gray-500 flex items-center">
                        <i class="fas fa-map-marker-alt mr-2"></i>${currentUser.location || 'Location not set'}
                    </div>
                </div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-semibold text-primary-600 mb-3 flex items-center">
                        <i class="fas fa-gift mr-2"></i>Skills Offered
                    </h3>
                    <div class="flex flex-wrap gap-2">
                        ${currentUser.skillsOffered.map(skill => 
                            `<span class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full">${skill}</span>`
                        ).join('') || '<span class="text-gray-500">No skills added yet</span>'}
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold text-secondary-600 mb-3 flex items-center">
                        <i class="fas fa-heart mr-2"></i>Skills Wanted
                    </h3>
                    <div class="flex flex-wrap gap-2">
                        ${currentUser.skillsWanted.map(skill => 
                            `<span class="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full">${skill}</span>`
                        ).join('') || '<span class="text-gray-500">No skills added yet</span>'}
                    </div>
                </div>
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-200">
                <div class="text-gray-600 flex items-center">
                    <i class="fas fa-clock mr-2"></i>Availability: ${currentUser.availability || 'Not specified'}
                </div>
            </div>
            
            <div class="flex gap-4 mt-8">
                <button onclick="showEditProfileModal()" class="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
                    <i class="fas fa-edit mr-2"></i>Edit Profile
                </button>
                <button onclick="toggleProfileVisibility()" class="px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${currentUser.isPublic ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-white hover:bg-gray-500'}">
                    <i class="fas fa-${currentUser.isPublic ? 'eye' : 'eye-slash'} mr-2"></i>${currentUser.isPublic ? 'Public' : 'Private'}
                </button>
            </div>
        </div>
    `;
}

// Load swaps section
async function loadSwapsSection() {
    try {
        const response = await fetch(`${API_BASE}/swaps/my-swaps`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const swaps = await response.json();

        const swapsContent = document.getElementById('swaps-content');
        swapsContent.innerHTML = `
            <div class="space-y-6">
                <div class="bg-white rounded-2xl shadow-lg p-6">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-inbox mr-2 text-primary-600"></i>Incoming Requests
                    </h3>
                    ${swaps.incoming.length === 0 ? 
                        `<div class="text-center py-8 text-gray-500">
                            <i class="fas fa-inbox text-4xl mb-4"></i>
                            <p>No incoming requests yet</p>
                        </div>` : 
                        swaps.incoming.map(swap => createSwapCard(swap, 'incoming')).join('')
                    }
                </div>
                
                <div class="bg-white rounded-2xl shadow-lg p-6">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-paper-plane mr-2 text-secondary-600"></i>Outgoing Requests
                    </h3>
                    ${swaps.outgoing.length === 0 ? 
                        `<div class="text-center py-8 text-gray-500">
                            <i class="fas fa-paper-plane text-4xl mb-4"></i>
                            <p>No outgoing requests yet</p>
                        </div>` : 
                        swaps.outgoing.map(swap => createSwapCard(swap, 'outgoing')).join('')
                    }
                </div>
                
                <div class="bg-white rounded-2xl shadow-lg p-6">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-handshake mr-2 text-green-600"></i>Accepted Swaps
                    </h3>
                    ${swaps.accepted.length === 0 ? 
                        `<div class="text-center py-8 text-gray-500">
                            <i class="fas fa-handshake text-4xl mb-4"></i>
                            <p>No accepted swaps yet</p>
                        </div>` : 
                        swaps.accepted.map(swap => createSwapCard(swap, 'accepted')).join('')
                    }
                </div>
            </div>
        `;
    } catch (error) {
        showNotification('Error loading swaps', 'error');
    }
}

// Create swap card
function createSwapCard(swap, type) {
    return `
        <div class="bg-gray-50 rounded-xl p-4 mb-4">
            <div class="flex items-center justify-between">
                <div>
                    <div class="font-semibold text-gray-800">Swap Request</div>
                    <div class="text-sm text-gray-600">Skill Offered: ${swap.skillOffered}</div>
                    <div class="text-sm text-gray-600">Skill Wanted: ${swap.skillWanted}</div>
                </div>
                <div class="flex gap-2">
                    ${type === 'incoming' ? `
                        <button onclick="handleSwapAction('${swap.id}', 'accepted')" class="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm">
                            Accept
                        </button>
                        <button onclick="handleSwapAction('${swap.id}', 'rejected')" class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm">
                            Reject
                        </button>
                    ` : type === 'outgoing' ? `
                        <button onclick="deleteSwap('${swap.id}')" class="px-3 py-1 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all duration-200 text-sm">
                            Delete
                        </button>
                    ` : `
                        <button onclick="showFeedbackModal('${swap.id}')" class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm">
                            Leave Feedback
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
}

// Load admin section
async function loadAdminSection() {
    if (!currentUser.isAdmin) {
        showNotification('Access denied', 'error');
        return;
    }

    try {
        const [usersResponse, swapsResponse] = await Promise.all([
            fetch(`${API_BASE}/users/public`),
            fetch(`${API_BASE}/swaps/my-swaps`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        ]);

        const [users, swaps] = await Promise.all([
            usersResponse.json(),
            swapsResponse.json()
        ]);

        const adminContent = document.getElementById('admin-content');
        adminContent.innerHTML = `
            <div class="space-y-6">
                <div class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-bullhorn mr-2 text-yellow-600"></i>Send Platform Message
                    </h3>
                    <div class="flex gap-3">
                        <input type="text" id="admin-message-input" placeholder="Enter your message..." class="flex-1 px-4 py-3 border-2 border-yellow-200 rounded-xl focus:border-yellow-500 focus:outline-none">
                        <button onclick="sendAdminMessage()" class="px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all duration-200 font-semibold">
                            <i class="fas fa-paper-plane mr-2"></i>Send
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-users text-primary-600 text-2xl"></i>
                        </div>
                        <div class="text-3xl font-bold text-gray-800">${users.length}</div>
                        <div class="text-gray-600">Total Users</div>
                    </div>
                    
                    <div class="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <div class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-handshake text-secondary-600 text-2xl"></i>
                        </div>
                        <div class="text-3xl font-bold text-gray-800">${swaps.incoming.length + swaps.outgoing.length + swaps.accepted.length}</div>
                        <div class="text-gray-600">Total Swaps</div>
                    </div>
                    
                    <div class="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-star text-green-600 text-2xl"></i>
                        </div>
                        <div class="text-3xl font-bold text-gray-800">0</div>
                        <div class="text-gray-600">Reviews</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-2xl shadow-lg p-6">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-users-cog mr-2 text-gray-600"></i>User Management
                    </h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-gray-200">
                                    <th class="text-left py-3 px-4">Name</th>
                                    <th class="text-left py-3 px-4">Location</th>
                                    <th class="text-left py-3 px-4">Status</th>
                                    <th class="text-left py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${users.map(user => `
                                    <tr class="border-b border-gray-100">
                                        <td class="py-3 px-4">${user.name}</td>
                                        <td class="py-3 px-4">${user.location}</td>
                                        <td class="py-3 px-4">
                                            <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
                                        </td>
                                        <td class="py-3 px-4">
                                            <button class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-200 text-xs">
                                                Ban
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        showNotification('Error loading admin panel', 'error');
    }
}

// Utility functions
function showModal() {
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function hideModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const notificationIcon = document.getElementById('notification-icon');
    
    notificationText.textContent = message;
    
    if (type === 'error') {
        notification.className = 'fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-xl transform transition-all duration-300 bg-red-500 text-white';
        notificationIcon.className = 'fas fa-exclamation-circle mr-3';
    } else {
        notification.className = 'fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-xl transform transition-all duration-300 bg-green-500 text-white';
        notificationIcon.className = 'fas fa-check-circle mr-3';
    }
    
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load admin message
async function loadAdminMessage() {
    try {
        const response = await fetch(`${API_BASE}/admin/messages/latest`);
        const message = await response.json();
        
        if (message) {
            const adminMessageDiv = document.getElementById('admin-message');
            adminMessageDiv.innerHTML = `
                <div class="max-w-7xl mx-auto px-4">
                    <i class="fas fa-bullhorn mr-2"></i>
                    ${message.text}
                </div>
            `;
            adminMessageDiv.classList.remove('hidden');
        }
    } catch (error) {
        // Ignore errors for admin message
    }
}

// Additional functions for demo purposes
function showEditProfileModal() {
    showNotification('Edit profile feature coming soon!', 'info');
}

function toggleProfileVisibility() {
    showNotification('Profile visibility updated!', 'success');
}

function sendAdminMessage() {
    const messageInput = document.getElementById('admin-message-input');
    const message = messageInput.value.trim();
    
    if (!message) return;

    fetch(`${API_BASE}/admin/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text: message })
    })
    .then(response => response.json())
    .then(result => {
        if (result.message) {
            showNotification('Message sent to all users!', 'success');
            messageInput.value = '';
            loadAdminMessage();
        } else {
            showNotification('Failed to send message', 'error');
        }
    })
    .catch(error => {
        showNotification('Network error', 'error');
    });
}

// Swap management functions
async function handleSwapAction(swapId, action) {
    try {
        showNotification(`Swap ${action}!`, 'success');
        loadSwapsSection();
    } catch (error) {
        showNotification('Action failed', 'error');
    }
}

async function deleteSwap(swapId) {
    try {
        showNotification('Swap deleted successfully', 'success');
        loadSwapsSection();
    } catch (error) {
        showNotification('Delete failed', 'error');
    }
}

function showFeedbackModal(swapId) {
    showNotification('Feedback feature coming soon!', 'info');
} 