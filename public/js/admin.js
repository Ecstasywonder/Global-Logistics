import { authFetch } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin dashboard
    initializeAdminDashboard();
    
    // Setup event listeners
    setupAdminEventListeners();
    
    // Load initial data
    loadAdminDashboardData();
});

async function initializeAdminDashboard() {
    try {
        // Load dashboard stats
        await loadDashboardStats();
        
        // Load recent activities
        await loadRecentActivities();
        
        // Initialize data tables
        initializeDataTables();
        
        // Setup real-time updates if needed
        setupRealTimeUpdates();
    } catch (error) {
        showError('Failed to initialize admin dashboard');
    }
}

async function loadDashboardStats() {
    try {
        const response = await authFetch('/api/admin/dashboard/stats');
        const data = await response.json();
        
        if (data.success) {
            updateDashboardStats(data.stats);
        }
    } catch (error) {
        showError('Failed to load dashboard statistics');
    }
}

function updateDashboardStats(stats) {
    // Update each stat card
    Object.entries(stats).forEach(([key, value]) => {
        const element = document.querySelector(`[data-stat="${key}"]`);
        if (element) {
            element.querySelector('.stat-value').textContent = value;
            updateStatTrend(element, value, stats[`${key}_previous`]);
        }
    });
}

function updateStatTrend(element, current, previous) {
    const trend = element.querySelector('.stat-trend');
    if (!trend) return;
    
    const percentage = ((current - previous) / previous) * 100;
    trend.innerHTML = `
        <i class="fas fa-${percentage >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
        ${Math.abs(percentage).toFixed(1)}%
    `;
    trend.className = `stat-trend ${percentage >= 0 ? 'positive' : 'negative'}`;
}

async function loadRecentActivities() {
    try {
        const response = await authFetch('/api/admin/activities');
        const data = await response.json();
        
        if (data.success) {
            updateActivityLog(data.activities);
        }
    } catch (error) {
        showError('Failed to load recent activities');
    }
}

function updateActivityLog(activities) {
    const activityLog = document.querySelector('.activity-log');
    if (!activityLog) return;
    
    activityLog.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="fas ${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.description}</p>
                <span class="activity-time">${formatTimeAgo(activity.timestamp)}</span>
            </div>
        </div>
    `).join('');
}

function setupAdminEventListeners() {
    // User Management
    setupUserManagement();
    
    // Shipment Management
    setupShipmentManagement();
    
    // Support Ticket Management
    setupSupportTicketManagement();
    
    // Report Generation
    setupReportGeneration();
}

function setupUserManagement() {
    // User search
    const userSearch = document.querySelector('.user-search');
    if (userSearch) {
        userSearch.addEventListener('input', debounce(handleUserSearch, 300));
    }
    
    // User filters
    document.querySelectorAll('.user-filter').forEach(filter => {
        filter.addEventListener('change', handleUserFilter);
    });
    
    // Bulk actions
    const bulkActionForm = document.querySelector('.bulk-action-form');
    if (bulkActionForm) {
        bulkActionForm.addEventListener('submit', handleBulkAction);
    }
}

async function handleUserSearch(e) {
    const searchTerm = e.target.value;
    try {
        const response = await authFetch(`/api/admin/users/search?term=${searchTerm}`);
        const data = await response.json();
        
        if (data.success) {
            updateUsersTable(data.users);
        }
    } catch (error) {
        showError('Search failed');
    }
}

function handleUserFilter(e) {
    const filters = collectFilters();
    updateUsersTable(filters);
}

async function handleBulkAction(e) {
    e.preventDefault();
    
    const action = e.target.querySelector('select').value;
    const selectedUsers = getSelectedUsers();
    
    if (!selectedUsers.length) {
        showError('No users selected');
        return;
    }
    
    try {
        const response = await authFetch('/api/admin/users/bulk-action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action, users: selectedUsers })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Bulk action completed successfully');
            refreshUserTable();
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('Failed to perform bulk action');
    }
}

function setupShipmentManagement() {
    // Similar to user management but for shipments
    // Implementation details would go here
}

function setupSupportTicketManagement() {
    // Support ticket handling
    // Implementation details would go here
}

function setupReportGeneration() {
    const reportForm = document.querySelector('.report-form');
    if (reportForm) {
        reportForm.addEventListener('submit', handleReportGeneration);
    }
}

async function handleReportGeneration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    try {
        const response = await authFetch('/api/admin/reports/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        
        const blob = await response.blob();
        downloadReport(blob, formData.get('reportType'));
    } catch (error) {
        showError('Failed to generate report');
    }
}

// Utility Functions
function initializeDataTables() {
    // Initialize tables with sorting, pagination, etc.
    // This would typically use a library like DataTables
}

function setupRealTimeUpdates() {
    // Setup WebSocket connection for real-time updates
    // Implementation would go here
}

function getActivityIcon(type) {
    const icons = {
        'user': 'fa-user',
        'shipment': 'fa-shipping-fast',
        'support': 'fa-headset',
        'system': 'fa-cog'
    };
    return icons[type] || 'fa-info-circle';
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

function downloadReport(blob, type) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Error/Success handlers (same as in auth.js)
function showError(message) {
    // Implementation from auth.js
}

function showSuccess(message) {
    // Implementation from auth.js
} 