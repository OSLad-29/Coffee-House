document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('admin-login');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const admin = JSON.parse(localStorage.getItem('admin'));
            
            if (username === admin.username && password === admin.password) {
                localStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid credentials. Please try again.');
            }
        });
    }
});