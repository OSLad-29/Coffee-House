document.addEventListener('DOMContentLoaded', function() {
    const orderItemsContainer = document.getElementById('order-items');
    const emptyCartMessage = document.getElementById('empty-cart');
    const subtotalElement = document.getElementById('subtotal');
    const orderTotalElement = document.getElementById('order-total');
    const checkoutForm = document.getElementById('checkout-form');
    const orderConfirmation = document.getElementById('order-confirmation');
    const confirmationNumber = document.getElementById('confirmation-number');

    // Load cart items from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Display cart items
    function displayCartItems() {
        orderItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            return;
        }
        
        emptyCartMessage.classList.add('hidden');
        
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="order-item-image">
                <div class="order-item-details">
                    <h4>${item.name}</h4>
                    <div class="order-item-price">R${item.price.toFixed(2)}</div>
                    <div class="order-item-controls">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                        <button class="remove-btn" data-index="${index}">× Remove</button>
                    </div>
                </div>
            `;
            orderItemsContainer.appendChild(itemElement);
        });
        
        updateOrderSummary();
    }
    
    // Update order summary (subtotal and total)
    function updateOrderSummary() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + 10; // Adding R10 service fee
        
        subtotalElement.textContent = `R${subtotal.toFixed(2)}`;
        orderTotalElement.textContent = `R${total.toFixed(2)}`;
    }
    
    // Handle quantity changes and item removal
    orderItemsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('minus')) {
            const index = e.target.getAttribute('data-index');
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
            } else {
                cart.splice(index, 1);
            }
            saveCart();
        }
        
        if (e.target.classList.contains('plus')) {
            const index = e.target.getAttribute('data-index');
            cart[index].quantity++;
            saveCart();
        }
        
        if (e.target.classList.contains('remove-btn')) {
            const index = e.target.getAttribute('data-index');
            cart.splice(index, 1);
            saveCart();
        }
    });
    
    // Save cart to localStorage and refresh display
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
    }
    
    // Handle form submission
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const order = {
            id: Date.now(),
            customer: {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value
            },
            items: [...cart],
            notes: document.getElementById('notes').value,
            subtotal: parseFloat(subtotalElement.textContent.replace('R', '')),
            total: parseFloat(orderTotalElement.textContent.replace('R', '')),
            date: new Date().toISOString(),
            status: 'pending'
        };
        
        // Save order to localStorage
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Show confirmation
        confirmationNumber.textContent = order.id;
        checkoutForm.reset();
        document.querySelector('.order-container').classList.add('hidden');
        orderConfirmation.classList.remove('hidden');
    });
    
    // Initial display
    displayCartItems();
});