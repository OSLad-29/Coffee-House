document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in
    if (!localStorage.getItem('adminLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load dashboard stats
    loadDashboardStats();
    
    // Load recent orders
    loadRecentOrders();
    
    // Logout button
    document.getElementById('logout').addEventListener('click', function() {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = '../index.html';
    });
});

function loadDashboardStats() {
    const orders = JSON.parse(localStorage.getItem('orders'));
    const reservations = JSON.parse(localStorage.getItem('reservations'));
    
    // Today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Today's orders
    const todayOrders = orders.filter(order => {
        return order.date.split('T')[0] === today;
    });
    document.getElementById('today-orders').textContent = todayOrders.length;
    
    // Today's revenue
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('today-revenue').textContent = `$${todayRevenue.toFixed(2)}`;
    
    // Pending reservations
    const pendingReservations = reservations.filter(res => res.status === 'pending');
    document.getElementById('pending-reservations').textContent = pendingReservations.length;
}

function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('orders'));
    const tableBody = document.querySelector('#orders-table tbody');
    
    // Sort by most recent
    const recentOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    tableBody.innerHTML = '';
    recentOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customer.name}</td>
            <td>${order.items.length} items</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>${new Date(order.date).toLocaleTimeString()}</td>
        `;
        tableBody.appendChild(row);
    });
}