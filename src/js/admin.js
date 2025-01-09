// Admin Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard stats
    fetchDashboardStats();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load initial data
    loadInitialData();
});

// Fetch and update dashboard statistics
async function fetchDashboardStats() {
    try {
        const response = await fetch('/api/admin/dashboard');
        const data = await response.json();
        updateDashboardStats(data);
    } catch (error) {
        showError('Failed to load dashboard statistics');
    }
}

// Initialize all event listeners
function initializeEventListeners() {
    // Modal handlers
    document.querySelectorAll('.modal-trigger').forEach(button => {
        button.addEventListener('click', handleModalTrigger);
    });

    // Filter handlers
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', applyFilters);
    });

    // Action buttons
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', handleAction);
    });

    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 500));
    }
}

// Handle modal triggers
function handleModalTrigger(event) {
    const modalId = event.target.dataset.modal;
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// Apply filters
async function applyFilters() {
    const filters = {
        status: document.querySelector('.status-filter').value,
        priority: document.querySelector('.priority-filter').value,
        category: document.querySelector('.category-filter').value
    };

    try {
        const response = await fetch('/api/admin/filter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filters)
        });
        const data = await response.json();
        updateDisplayedData(data);
    } catch (error) {
        showError('Failed to apply filters');
    }
}

// Handle search functionality
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

async function handleSearch(event) {
    const searchTerm = event.target.value;
    try {
        const response = await fetch(`/api/admin/search?term=${searchTerm}`);
        const data = await response.json();
        updateDisplayedData(data);
    } catch (error) {
        showError('Search failed');
    }
}

// Update dashboard statistics
function updateDashboardStats(data) {
    const stats = {
        pendingShipments: document.getElementById('pending-shipments'),
        activeShipments: document.getElementById('active-shipments'),
        pendingUsers: document.getElementById('pending-users'),
        supportTickets: document.getElementById('support-tickets')
    };

    Object.keys(stats).forEach(key => {
        if (stats[key]) {
            stats[key].textContent = data[key];
        }
    });
}

// Error handling
function showError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.classList.add('error-notification');
    errorContainer.textContent = message;
    document.body.appendChild(errorContainer);
    setTimeout(() => errorContainer.remove(), 3000);
}

// Update displayed data
function updateDisplayedData(data) {
    // Implementation depends on the type of data being displayed
    // (users, shipments, or support tickets)
} 