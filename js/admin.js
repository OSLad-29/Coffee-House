document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    if (!localStorage.getItem('adminLoggedIn')) {
        window.location.href = 'admin/login.html';
        return;
    }

    // Initialize dashboard components
    initializeDashboard();
});

function initializeDashboard() {
    // Load all dashboard components
    loadDashboardStats();
    loadRecentOrders();
    loadPendingReservations();

    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Logout button
    document.getElementById('logout')?.addEventListener('click', function() {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = '../index.html';
    });

    // Order detail links
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('order-detail-link')) {
            e.preventDefault();
            showOrderDetails(e.target.getAttribute('data-id'));
        }

        // Reservation actions
        if (e.target.closest('.confirm-btn')) {
            const id = e.target.closest('.confirm-btn').getAttribute('data-id');
            if (confirm(`Confirm reservation #${id}?`)) {
                updateReservationStatus(id, 'confirmed');
            }
        }

        if (e.target.closest('.cancel-btn')) {
            const id = e.target.closest('.cancel-btn').getAttribute('data-id');
            const reason = prompt('Reason for cancellation:');
            if (reason !== null) {
                updateReservationStatus(id, 'cancelled', reason);
            }
        }
    });

    // Modal close buttons
    document.querySelector('.modal .close')?.addEventListener('click', closeModal);
    document.getElementById('close-modal')?.addEventListener('click', closeModal);
}

// Dashboard Statistics
function loadDashboardStats() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Today's orders with trend
    const todayOrders = orders.filter(order => order.date.split('T')[0] === today);
    const yesterdayOrders = orders.filter(order => order.date.split('T')[0] === yesterday);
    const orderChange = calculatePercentageChange(todayOrders.length, yesterdayOrders.length);
    
    if (document.getElementById('today-orders')) {
        document.getElementById('today-orders').innerHTML = `
            ${todayOrders.length}
            <span class="trend ${orderChange.trend}">${orderChange.value}%</span>
        `;
    }
    
    // Today's revenue with trend
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.total, 0);
    const revenueChange = calculatePercentageChange(todayRevenue, yesterdayRevenue);
    
    if (document.getElementById('today-revenue')) {
        document.getElementById('today-revenue').innerHTML = `
            R${todayRevenue.toFixed(2)}
            <span class="trend ${revenueChange.trend}">${revenueChange.value}%</span>
        `;
    }
    
    // Pending reservations
    const pendingReservations = reservations.filter(res => res.status === 'pending');
    if (document.getElementById('pending-reservations')) {
        document.getElementById('pending-reservations').textContent = pendingReservations.length;
    }
}

// Recent Orders Table
function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const tableBody = document.querySelector('#orders-table tbody');
    
    if (!tableBody) return;
    
    // Sort by most recent and get top 5
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    tableBody.innerHTML = recentOrders.length === 0 ? 
        '<tr><td colspan="6" class="no-results">No recent orders</td></tr>' :
        recentOrders.map(order => `
            <tr>
                <td><a href="#" class="order-detail-link" data-id="${order.id}">${order.id}</a></td>
                <td>${order.customer.name}</td>
                <td>${order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                <td>R${order.total.toFixed(2)}</td>
                <td>${formatDateTime(order.date)}</td>
                <td><span class="status-badge ${order.status}">${capitalizeFirstLetter(order.status)}</span></td>
            </tr>
        `).join('');
}

// Pending Reservations
function loadPendingReservations() {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const container = document.getElementById('pending-reservations-list');
    
    if (!container) return;
    
    const pendingReservations = reservations
        .filter(res => res.status === 'pending')
        .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
        .slice(0, 5);
    
    container.innerHTML = pendingReservations.length === 0 ? 
        '<div class="no-results">No pending reservations</div>' :
        pendingReservations.map(res => `
            <div class="reservation-card">
                <div class="reservation-details">
                    <h4>${res.name}</h4>
                    <div class="reservation-meta">
                        <span>${formatDate(res.date)} at ${res.time}</span>
                        <span>${res.guests} ${res.guests === '1' ? 'person' : 'people'}</span>
                    </div>
                    <div class="reservation-contact">
                        <span>${res.phone}</span>
                        <span>${res.email}</span>
                    </div>
                    ${res.notes ? `<div class="reservation-notes">${res.notes}</div>` : ''}
                </div>
                <div class="reservation-actions">
                    <button class="action-btn confirm-btn" data-id="${res.id}">
                        <i class="fas fa-check"></i> Confirm
                    </button>
                    <button class="action-btn reschedule-btn" data-id="${res.id}">
                        <i class="fas fa-calendar-alt"></i> Reschedule
                    </button>
                    <button class="action-btn cancel-btn" data-id="${res.id}">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `).join('');
}

// Order Details Modal
function showOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id == orderId);
    
    if (!order) {
        alert('Order not found');
        return;
    }
    
    // Populate modal elements
    document.getElementById('order-id').textContent = order.id;
    document.getElementById('customer-name').textContent = order.customer.name;
    document.getElementById('customer-email').textContent = order.customer.email;
    document.getElementById('customer-phone').textContent = order.customer.phone;
    
    // Populate order items
    const itemsList = document.getElementById('order-items-list');
    itemsList.innerHTML = order.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>R${item.price.toFixed(2)}</td>
            <td>R${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');
    
    // Populate order summary
    document.getElementById('order-subtotal').textContent = order.subtotal?.toFixed(2) || order.total.toFixed(2);
    document.getElementById('order-fee').textContent = order.fee ? order.fee.toFixed(2) : '0.00';
    document.getElementById('order-total').textContent = order.total.toFixed(2);
    
    const statusBadge = document.getElementById('order-status');
    statusBadge.textContent = capitalizeFirstLetter(order.status);
    statusBadge.className = `status-badge ${order.status}`;
    
    document.getElementById('order-date').textContent = formatDateTime(order.date);
    document.getElementById('order-notes').textContent = order.notes || 'None';
    
    // Show modal
    document.getElementById('order-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('order-modal').style.display = 'none';
}

// Reservation Management
function updateReservationStatus(id, status, reason = null) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const reservationIndex = reservations.findIndex(res => res.id == id);
    
    if (reservationIndex !== -1) {
        reservations[reservationIndex].status = status;
        reservations[reservationIndex].updatedAt = new Date().toISOString();
        
        if (reason) {
            reservations[reservationIndex].cancellationReason = reason;
        }
        
        localStorage.setItem('reservations', JSON.stringify(reservations));
        
        // Refresh dashboard components
        loadDashboardStats();
        loadPendingReservations();
        
        alert(`Reservation #${id} has been ${status}`);
    } else {
        alert('Reservation not found');
    }
}

// Utility Functions
function calculatePercentageChange(current, previous) {
    if (previous === 0) return { value: '100', trend: 'up' };
    const change = ((current - previous) / previous) * 100;
    return {
        value: Math.abs(change).toFixed(0),
        trend: change >= 0 ? 'up' : 'down'
    };
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-ZA', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Make functions available for HTML onclick attributes
window.updateReservationStatus = updateReservationStatus;
window.showOrderDetails = showOrderDetails;
window.closeModal = closeModal;