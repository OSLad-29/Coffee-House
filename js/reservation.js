document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reservation-form');
    const confirmation = document.getElementById('reservation-confirmation');
    const dateInput = document.getElementById('res-date');
    const timeInput = document.getElementById('res-time');

    // Set minimum time based on selected date
    dateInput.addEventListener('change', function() {
        const today = new Date();
        const selectedDate = new Date(dateInput.value);
        
        // If selected date is today, set min time to current hour
        if (selectedDate.toDateString() === today.toDateString()) {
            const currentHour = today.getHours();
            const nextHour = currentHour < 23 ? currentHour + 1 : currentHour;
            timeInput.min = `${nextHour.toString().padStart(2, '0')}:00`;
        } else {
            timeInput.min = '08:00';
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const reservation = {
            id: Date.now(),
            name: document.getElementById('res-name').value,
            email: document.getElementById('res-email').value,
            phone: document.getElementById('res-phone').value,
            date: document.getElementById('res-date').value,
            time: document.getElementById('res-time').value,
            guests: document.getElementById('res-guests').value,
            notes: document.getElementById('res-notes').value || 'None',
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        reservations.push(reservation);
        localStorage.setItem('reservations', JSON.stringify(reservations));
        
        // Show confirmation
        document.getElementById('reservation-id').textContent = reservation.id;
        document.getElementById('reservation-date-time').textContent = 
            `${formatDate(reservation.date)} at ${reservation.time}`;
        document.getElementById('reservation-guests').textContent = 
            `${reservation.guests} ${reservation.guests === '1' ? 'person' : 'people'}`;
        
        form.classList.add('hidden');
        confirmation.classList.remove('hidden');
        
        // Log email simulation
        console.log(`Email sent to ${reservation.email}:\n
            Subject: Reservation Confirmation #${reservation.id}\n
            Dear ${reservation.name},\n
            Your table for ${reservation.guests} on ${formatDate(reservation.date)} at ${reservation.time} is confirmed.\n
            Thank you for choosing The Coffee House!`);
    });

    function formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
});