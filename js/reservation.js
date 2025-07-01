document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reservation-form');
    const confirmation = document.getElementById('reservation-confirmation');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const reservation = {
            id: Date.now(),
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            guests: document.getElementById('guests').value,
            notes: document.getElementById('notes').value,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        const reservations = JSON.parse(localStorage.getItem('reservations'));
        reservations.push(reservation);
        localStorage.setItem('reservations', JSON.stringify(reservations));
        
        // Show confirmation
        form.style.display = 'none';
        confirmation.classList.remove('hidden');
    });
});