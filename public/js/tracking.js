document.addEventListener('DOMContentLoaded', function() {
    const trackingForm = document.getElementById('trackingForm');
    const trackingResult = document.querySelector('.tracking-result');
    
    // Initialize tracking form
    if (trackingForm) {
        trackingForm.addEventListener('submit', handleTracking);
    }
    
    // Check for tracking number in URL
    const urlParams = new URLSearchParams(window.location.search);
    const trackingNumber = urlParams.get('tracking');
    if (trackingNumber) {
        fetchTrackingInfo(trackingNumber);
    }
});

async function handleTracking(e) {
    e.preventDefault();
    const trackingNumber = e.target.querySelector('input').value.trim();
    
    if (trackingNumber) {
        try {
            await fetchTrackingInfo(trackingNumber);
        } catch (error) {
            showError('Unable to fetch tracking information. Please try again.');
        }
    }
}

async function fetchTrackingInfo(trackingNumber) {
    try {
        const response = await fetch(`/api/tracking/${trackingNumber}`);
        const data = await response.json();
        
        if (data.success) {
            updateTrackingDisplay(data.data);
            showTrackingResult();
        } else {
            showError(data.message || 'Tracking information not found');
        }
    } catch (error) {
        throw new Error('Failed to fetch tracking information');
    }
}

function updateTrackingDisplay(shipment) {
    // Update tracking number
    document.getElementById('trackingNumber').textContent = shipment.trackingNumber;
    
    // Update status badge
    const statusBadge = document.querySelector('.status .badge');
    statusBadge.className = `badge badge-${getStatusClass(shipment.status)}`;
    statusBadge.textContent = formatStatus(shipment.status);
    
    // Update timeline
    updateTimeline(shipment.trackingUpdates);
    
    // Update shipment details
    updateShipmentDetails(shipment);
}

function updateTimeline(updates) {
    const timeline = document.querySelector('.tracking-timeline');
    timeline.innerHTML = updates.map(update => `
        <div class="timeline-event ${update.status === 'completed' ? 'completed' : ''}">
            <div class="event-icon">
                <i class="fas ${getStatusIcon(update.status)}"></i>
            </div>
            <div class="event-content">
                <h3>${formatStatus(update.status)}</h3>
                <p class="event-location">${update.location.city}, ${update.location.country}</p>
                <p class="event-time">${formatDate(update.timestamp)}</p>
                <p class="event-description">${update.description}</p>
            </div>
        </div>
    `).join('');
}

function updateShipmentDetails(shipment) {
    const detailsGrid = document.querySelector('.details-grid');
    detailsGrid.innerHTML = `
        <div class="detail-item">
            <span class="detail-label">Service Type</span>
            <span class="detail-value">${shipment.serviceType}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Expected Delivery</span>
            <span class="detail-value">${formatDate(shipment.timeline.estimated_delivery)}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Origin</span>
            <span class="detail-value">${shipment.origin.city}, ${shipment.origin.country}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Destination</span>
            <span class="detail-value">${shipment.destination.city}, ${shipment.destination.country}</span>
        </div>
    `;
}

// Utility functions
function showTrackingResult() {
    const result = document.querySelector('.tracking-result');
    result.classList.remove('hidden');
    result.scrollIntoView({ behavior: 'smooth' });
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 3000);
}

function getStatusClass(status) {
    const statusClasses = {
        'pending': 'warning',
        'in_transit': 'info',
        'delivered': 'success',
        'cancelled': 'danger'
    };
    return statusClasses[status] || 'default';
}

function getStatusIcon(status) {
    const statusIcons = {
        'order_received': 'fa-box',
        'in_transit': 'fa-truck',
        'out_for_delivery': 'fa-truck-fast',
        'delivered': 'fa-check-circle',
        'cancelled': 'fa-times-circle'
    };
    return statusIcons[status] || 'fa-circle';
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
} 