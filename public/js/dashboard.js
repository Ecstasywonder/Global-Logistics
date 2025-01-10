import { authFetch } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard components
    initializeDashboard();
    
    // Load initial data
    loadDashboardData();
    
    // Setup event listeners
    setupEventListeners();
});

async function initializeDashboard() {
    try {
        // Load user profile
        await loadUserProfile();
        
        // Load recent shipments
        await loadRecentShipments();
        
        // Load notifications
        await loadNotifications();
        
        // Initialize charts if they exist
        initializeCharts();
    } catch (error) {
        showError('Failed to initialize dashboard');
    }
}

async function loadUserProfile() {
    try {
        const response = await authFetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success) {
            updateProfileDisplay(data.user);
        }
    } catch (error) {
        showError('Failed to load profile');
    }
}

async function loadRecentShipments() {
    try {
        const response = await authFetch('/api/shipments?limit=5');
        const data = await response.json();
        
        if (data.success) {
            updateShipmentsTable(data.shipments);
        }
    } catch (error) {
        showError('Failed to load recent shipments');
    }
}

async function loadNotifications() {
    try {
        const response = await authFetch('/api/notifications');
        const data = await response.json();
        
        if (data.success) {
            updateNotificationsPanel(data.notifications);
        }
    } catch (error) {
        showError('Failed to load notifications');
    }
}

function updateProfileDisplay(user) {
    const profileElements = {
        name: document.querySelector('.user-name'),
        email: document.querySelector('.user-email'),
        company: document.querySelector('.user-company'),
        avatar: document.querySelector('.user-avatar')
    };
    
    if (profileElements.name) {
        profileElements.name.textContent = `${user.firstName} ${user.lastName}`;
    }
    if (profileElements.email) {
        profileElements.email.textContent = user.email;
    }
    if (profileElements.company) {
        profileElements.company.textContent = user.company || 'N/A';
    }
    if (profileElements.avatar && user.avatar) {
        profileElements.avatar.src = user.avatar;
    }
}

function updateShipmentsTable(shipments) {
    const tableBody = document.querySelector('.shipments-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = shipments.map(shipment => `
        <tr>
            <td>${shipment.trackingNumber}</td>
            <td>${shipment.origin.city} → ${shipment.destination.city}</td>
            <td><span class="status-badge ${shipment.status}">${formatStatus(shipment.status)}</span></td>
            <td>${formatDate(shipment.timeline.estimated_delivery)}</td>
            <td>
                <button onclick="viewShipment('${shipment._id}')" class="btn-icon">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateNotificationsPanel(notifications) {
    const notificationsList = document.querySelector('.notifications-list');
    if (!notificationsList) return;
    
    notificationsList.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.read ? 'read' : 'unread'}">
            <div class="notification-icon">
                <i class="fas ${getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="notification-content">
                <p>${notification.message}</p>
                <span class="notification-time">${formatTimeAgo(notification.createdAt)}</span>
            </div>
        </div>
    `).join('');
    
    updateNotificationBadge(notifications.filter(n => !n.read).length);
}

function setupEventListeners() {
    // New Shipment Form
    const newShipmentForm = document.getElementById('newShipmentForm');
    if (newShipmentForm) {
        newShipmentForm.addEventListener('submit', handleNewShipment);
    }
    
    // Profile Update Form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Quick Actions
    document.querySelectorAll('.quick-action').forEach(button => {
        button.addEventListener('click', handleQuickAction);
    });
}

async function handleNewShipment(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const response = await authFetch('/api/shipments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Shipment created successfully');
            await loadRecentShipments(); // Refresh shipments list
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('Failed to create shipment');
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const response = await authFetch('/api/auth/updateprofile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Profile updated successfully');
            updateProfileDisplay(data.user);
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('Failed to update profile');
    }
}

function handleQuickAction(e) {
    const action = e.currentTarget.dataset.action;
    switch (action) {
        case 'new-shipment':
            openNewShipmentModal();
            break;
        case 'track-shipment':
            openTrackingModal();
            break;
        case 'support':
            openSupportModal();
            break;
    }
}

// Utility Functions
function initializeCharts() {
    // Initialize charts if needed
    // This would use a charting library like Chart.js
}

function formatStatus(status) {
    return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return formatDate(dateString);
}

function getNotificationIcon(type) {
    const icons = {
        'shipment': 'fa-box',
        'payment': 'fa-credit-card',
        'system': 'fa-bell',
        'support': 'fa-headset'
    };
    return icons[type] || 'fa-bell';
}

function showError(message) {
    // Implementation from auth.js
}

function showSuccess(message) {
    // Implementation from auth.js
} 