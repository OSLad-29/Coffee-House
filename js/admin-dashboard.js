// Constants
const ORDER_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    COMPLETED: 'completed'
};

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Authentication check
    if (!localStorage.getItem('adminLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize components
    initTabs();
    initModals();
    initFilters();
    setupEventListeners();
    
    // Load initial data
    loadDashboardData();
});

// Core Functions
function loadDashboardData() {
    updateStats();
    loadOrdersTable();
    loadReservationsTable();
    loadArchiveTable();
    renderSalesChart();
}

function updateStats() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    
    // Today's stats
    const todayOrders = orders.filter(order => 
        order.date.split('T')[0] === today && 
        order.status !== ORDER_STATUS.COMPLETED
    );
    
    const todayReservations = reservations.filter(res => res.date === today);
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Monthly stats
    const monthlyOrders = orders.filter(order => 
        new Date(order.date).getMonth() === currentMonth
    );
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Update DOM
    document.getElementById('today-orders').textContent = todayOrders.length;
    document.getElementById('today-reservations').textContent = todayReservations.length;
    document.getElementById('today-revenue').textContent = `R${todayRevenue.toFixed(2)}`;
    document.getElementById('monthly-revenue').textContent = `R${monthlyRevenue.toFixed(2)}`;
    
    // Calculate comparisons
    updateComparison('orders', todayOrders.length, getYesterdayCount(orders));
    updateComparison('reservations', todayReservations.length, getYesterdayCount(reservations));
    updateComparison('revenue', todayRevenue, getYesterdayRevenue(orders));
    updateComparison('monthly', monthlyRevenue, getLastMonthRevenue(orders));
}

function loadOrdersTable() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const searchTerm = document.getElementById('orders-search').value.toLowerCase();
    const statusFilter = document.getElementById('orders-filter').value;
    
    // Filter out completed orders and apply filters
    let filteredOrders = orders.filter(order => order.status !== ORDER_STATUS.COMPLETED);
    
    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    if (searchTerm) {
        filteredOrders = filteredOrders.filter(order => 
            order.id.toString().includes(searchTerm) ||
            order.customer.name.toLowerCase().includes(searchTerm) ||
            order.customer.email.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Render table
    const tbody = document.getElementById('orders-table');
    tbody.innerHTML = filteredOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customer.name}</td>
            <td>${order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
            <td>R${order.total.toFixed(2)}</td>
            <td>${formatDate(order.date)}</td>
            <td><span class="status-badge ${order.status}">${capitalizeFirstLetter(order.status)}</span></td>
            <td>
                <button class="btn-sm view-order" data-id="${order.id}">View</button>
                ${order.status === ORDER_STATUS.PENDING ? `
                    <button class="btn-sm accept-order" data-id="${order.id}">Accept</button>
                ` : ''}
                ${order.status === ORDER_STATUS.ACCEPTED ? `
                    <button class="btn-sm complete-order" data-id="${order.id}">Complete</button>
                ` : ''}
                <button class="btn-sm delete-order" data-id="${order.id}">Delete</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="7">No orders found</td></tr>';
    
    // Add event listeners
    addOrderEventListeners();
}

function loadReservationsTable() {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const searchTerm = document.getElementById('reservations-search').value.toLowerCase();
    const statusFilter = document.getElementById('reservations-filter').value;
    
    let filteredReservations = reservations;
    
    if (statusFilter !== 'all') {
        filteredReservations = filteredReservations.filter(res => res.status === statusFilter);
    }
    
    if (searchTerm) {
        filteredReservations = filteredReservations.filter(res => 
            res.id.toString().includes(searchTerm) ||
            res.name.toLowerCase().includes(searchTerm) ||
            res.email.toLowerCase().includes(searchTerm) ||
            res.phone.includes(searchTerm)
        );
    }
    
    // Sort by date (newest first)
    filteredReservations.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
    
    // Render table
    const tbody = document.getElementById('reservations-table');
    tbody.innerHTML = filteredReservations.map(res => `
        <tr>
            <td>${res.id}</td>
            <td>${res.name}</td>
            <td>${formatDate(res.date)} at ${res.time}</td>
            <td>${res.guests}</td>
            <td>${res.phone}<br>${res.email}</td>
            <td><span class="status-badge ${res.status}">${capitalizeFirstLetter(res.status)}</span></td>
            <td>
                ${res.status !== 'confirmed' ? `
                    <button class="btn-sm confirm-reservation" data-id="${res.id}">Confirm</button>
                ` : ''}
                <button class="btn-sm cancel-reservation" data-id="${res.id}">Cancel</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="7">No reservations found</td></tr>';
    
    // Add event listeners
    addReservationEventListeners();
}

function loadArchiveTable() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const searchTerm = document.getElementById('archive-search').value.toLowerCase();
    
    // Filter and sort completed orders
    let archivedOrders = orders.filter(order => order.status === ORDER_STATUS.COMPLETED);
    
    if (searchTerm) {
        archivedOrders = archivedOrders.filter(order => 
            order.id.toString().includes(searchTerm) ||
            order.customer.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort by completion date (newest first)
    archivedOrders.sort((a, b) => new Date(b.completedAt || b.date) - new Date(a.completedAt || a.date));
    
    // Render table
    const tbody = document.getElementById('archive-table');
    tbody.innerHTML = archivedOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customer.name}</td>
            <td>R${order.total.toFixed(2)}</td>
            <td>${formatDateTime(order.completedAt || order.date)}</td>
            <td>
                <button class="btn-sm view-history" data-id="${order.id}">
                    <i class="fas fa-history"></i> View
                </button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="5">No completed orders yet</td></tr>';
    
    // Add history view handlers
    document.querySelectorAll('.view-history').forEach(btn => {
        btn.addEventListener('click', () => showStatusHistory(btn.dataset.id));
    });
}

// Order Management
function updateOrderStatus(orderId, status) {
    const orders = JSON.parse(localStorage.getItem('orders'));
    const orderIndex = orders.findIndex(o => o.id == orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        
        // Add to status history
        if (!orders[orderIndex].statusHistory) {
            orders[orderIndex].statusHistory = [];
        }
        
        orders[orderIndex].statusHistory.push({
            status: status,
            timestamp: new Date().toISOString(),
            changedBy: 'admin'
        });
        
        // Set completed time if applicable
        if (status === ORDER_STATUS.COMPLETED) {
            orders[orderIndex].completedAt = new Date().toISOString();
        }
        
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrdersTable();
        loadArchiveTable();
        updateStats();
        
        // Close modal if open
        if (status === ORDER_STATUS.COMPLETED) {
            document.getElementById('order-modal').style.display = 'none';
        }
    }
}

function deleteOrder(orderId) {
    if (confirm('Permanently delete this order?')) {
        const orders = JSON.parse(localStorage.getItem('orders'));
        const updatedOrders = orders.filter(order => order.id != orderId);
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        
        loadOrdersTable();
        loadArchiveTable();
        updateStats();
        document.getElementById('order-modal').style.display = 'none';
    }
}

// Reservation Management
function updateReservationStatus(reservationId, status) {
    const reservations = JSON.parse(localStorage.getItem('reservations'));
    const reservationIndex = reservations.findIndex(res => res.id == reservationId);
    
    if (reservationIndex !== -1) {
        reservations[reservationIndex].status = status;
        localStorage.setItem('reservations', JSON.stringify(reservations));
        loadReservationsTable();
        updateStats();
    }
}

function cancelReservation(reservationId) {
    if (confirm('Permanently cancel this reservation?')) {
        const reservations = JSON.parse(localStorage.getItem('reservations'));
        const updatedReservations = reservations.filter(res => res.id != reservationId);
        localStorage.setItem('reservations', JSON.stringify(updatedReservations));
        
        loadReservationsTable();
        updateStats();
    }
}

// Archive Management
function clearArchive() {
    if (confirm('Permanently delete ALL completed orders? This cannot be undone!')) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const activeOrders = orders.filter(order => order.status !== ORDER_STATUS.COMPLETED);
        localStorage.setItem('orders', JSON.stringify(activeOrders));
        loadArchiveTable();
        updateStats();
    }
}

// UI Helpers
function showOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders'));
    const order = orders.find(o => o.id == orderId);
    
    if (order) {
        document.getElementById('order-id').textContent = order.id;
        
        // Populate modal body
        document.querySelector('#order-modal .modal-body').innerHTML = `
            <div class="customer-info">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> ${order.customer.name}</p>
                <p><strong>Email:</strong> ${order.customer.email}</p>
                <p><strong>Phone:</strong> ${order.customer.phone}</p>
            </div>
            
            <div class="order-items">
                <h4>Items</h4>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>R${item.price.toFixed(2)}</td>
                                <td>R${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="order-summary">
                <h4>Summary</h4>
                <p><strong>Subtotal:</strong> R${order.subtotal?.toFixed(2) || order.total.toFixed(2)}</p>
                <p><strong>Service Fee:</strong> R10.00</p>
                <p><strong>Total:</strong> R${order.total.toFixed(2)}</p>
                <p><strong>Status:</strong> <span class="status-badge ${order.status}">${capitalizeFirstLetter(order.status)}</span></p>
                <p><strong>Date:</strong> ${formatDateTime(order.date)}</p>
            </div>
            
            ${order.notes ? `
            <div class="order-notes">
                <h4>Special Instructions</h4>
                <p>${order.notes}</p>
            </div>
            ` : ''}
        `;
        
        // Set up action buttons
        document.getElementById('accept-order').onclick = () => {
            updateOrderStatus(order.id, ORDER_STATUS.ACCEPTED);
        };
        
        document.getElementById('complete-order').onclick = () => {
            updateOrderStatus(order.id, ORDER_STATUS.COMPLETED);
        };
        
        document.getElementById('delete-order').onclick = () => {
            deleteOrder(order.id);
        };
        
        // Show modal
        document.getElementById('order-modal').style.display = 'block';
    }
}

function showStatusHistory(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders'));
    const order = orders.find(o => o.id == orderId);
    
    if (order && order.statusHistory) {
        document.getElementById('history-id').textContent = orderId;
        
        const historyContent = document.getElementById('history-content');
        historyContent.innerHTML = order.statusHistory.map(entry => `
            <div class="history-entry">
                <span class="history-status ${entry.status}">${capitalizeFirstLetter(entry.status)}</span>
                <span class="history-time">${formatDateTime(entry.timestamp)}</span>
                ${entry.changedBy ? `<span class="history-admin">by ${entry.changedBy}</span>` : ''}
            </div>
        `).join('');
        
        document.getElementById('history-modal').style.display = 'block';
    }
}

// Chart Functions
function renderSalesChart() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const ctx = document.getElementById('sales-chart').getContext('2d');
    const timePeriod = document.getElementById('time-period').value;
    
    // Prepare data based on selected timeframe
    let labels = [];
    let data = [];
    
    if (timePeriod === 'day') {
        // Last 7 days
        labels = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return formatDate(d.toISOString());
        });
        
        data = labels.map(date => {
            return orders.filter(order => order.date.split('T')[0] === date)
                .reduce((sum, order) => sum + order.total, 0);
        });
    } 
    else if (timePeriod === 'week') {
        // Last 12 weeks
        labels = Array.from({length: 12}, (_, i) => `Week ${12 - i}`);
        
        data = Array(12).fill(0);
        orders.forEach(order => {
            const orderDate = new Date(order.date);
            const today = new Date();
            const weekDiff = Math.floor((today - orderDate) / (7 * 24 * 60 * 60 * 1000));
            if (weekDiff >= 0 && weekDiff < 12) {
                data[11 - weekDiff] += order.total;
            }
        });
    }
    else if (timePeriod === 'month') {
        // Last 6 months
        labels = Array.from({length: 6}, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            return d.toLocaleString('default', { month: 'short' });
        });
        
        data = Array(6).fill(0);
        orders.forEach(order => {
            const orderDate = new Date(order.date);
            const today = new Date();
            const monthDiff = (today.getFullYear() - orderDate.getFullYear()) * 12 + today.getMonth() - orderDate.getMonth();
            if (monthDiff >= 0 && monthDiff < 6) {
                data[5 - monthDiff] += order.total;
            }
        });
    }
    
    // Destroy previous chart if exists
    if (window.salesChart) {
        window.salesChart.destroy();
    }
    
    // Create new chart
    window.salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue (R)',
                data: data,
                backgroundColor: '#6F4E37',
                borderColor: '#4A3526',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R' + value;
                        }
                    }
                }
            }
        }
    });
}

// Utility Functions
function updateComparison(type, current, previous) {
    const element = document.getElementById(`${type}-comparison`);
    if (!previous || previous === 0) {
        element.textContent = 'No previous data';
        return;
    }
    
    const difference = current - previous;
    const percentage = Math.round((difference / previous) * 100);
    
    if (difference > 0) {
        element.innerHTML = `<i class="fas fa-arrow-up trend-up"></i> ${Math.abs(percentage)}% from previous`;
    } else if (difference < 0) {
        element.innerHTML = `<i class="fas fa-arrow-down trend-down"></i> ${Math.abs(percentage)}% from previous`;
    } else {
        element.textContent = 'No change from previous';
    }
}

function getYesterdayCount(items) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    return items.filter(item => {
        const itemDate = 'date' in item ? item.date : item.date.split('T')[0];
        return itemDate === yesterdayStr;
    }).length;
}

function getYesterdayRevenue(orders) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    return orders.filter(order => order.date.split('T')[0] === yesterdayStr)
        .reduce((sum, order) => sum + order.total, 0);
}

function getLastMonthRevenue(orders) {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthIndex = lastMonth.getMonth();
    
    return orders.filter(order => new Date(order.date).getMonth() === lastMonthIndex)
        .reduce((sum, order) => sum + order.total, 0);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatDateTime(dateString) {
    const options = { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.getElementById('logout').addEventListener('click', logout);
    document.getElementById('refresh-data').addEventListener('click', loadDashboardData);
    document.getElementById('time-period').addEventListener('change', renderSalesChart);
    
    // Archive
    document.getElementById('clear-archive').addEventListener('click', clearArchive);
    document.getElementById('archive-search').addEventListener('input', loadArchiveTable);
    
    // Modal close buttons
    document.querySelectorAll('.modal .close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function addOrderEventListeners() {
    document.querySelectorAll('.view-order').forEach(btn => {
        btn.addEventListener('click', () => showOrderDetails(btn.dataset.id));
    });
    
    document.querySelectorAll('.accept-order').forEach(btn => {
        btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, ORDER_STATUS.ACCEPTED));
    });
    
    document.querySelectorAll('.complete-order').forEach(btn => {
        btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, ORDER_STATUS.COMPLETED));
    });
    
    document.querySelectorAll('.delete-order').forEach(btn => {
        btn.addEventListener('click', () => deleteOrder(btn.dataset.id));
    });
}

function addReservationEventListeners() {
    document.querySelectorAll('.confirm-reservation').forEach(btn => {
        btn.addEventListener('click', () => updateReservationStatus(btn.dataset.id, 'confirmed'));
    });
    
    document.querySelectorAll('.cancel-reservation').forEach(btn => {
        btn.addEventListener('click', () => cancelReservation(btn.dataset.id));
    });
}

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active tab
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${this.dataset.tab}-tab`).classList.add('active');
            
            // Load data if needed
            if (this.dataset.tab === 'archive') {
                loadArchiveTable();
            }
        });
    });
}

function initModals() {
    // Already handled in setupEventListeners
}

function initFilters() {
    // Orders filter
    document.getElementById('orders-search').addEventListener('input', loadOrdersTable);
    document.getElementById('orders-filter').addEventListener('change', loadOrdersTable);
    
    // Reservations filter
    document.getElementById('reservations-search').addEventListener('input', loadReservationsTable);
    document.getElementById('reservations-filter').addEventListener('change', loadReservationsTable);
}

function logout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = '../index.html';
}