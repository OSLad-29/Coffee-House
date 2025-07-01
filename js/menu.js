document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart if not exists
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }

    // Set up category switching
    const categoryButtons = document.querySelectorAll('.menu-categories button');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected category
            document.querySelectorAll('.menu-section').forEach(section => {
                section.classList.add('hidden');
            });
            document.getElementById(category).classList.remove('hidden');
        });
    });

    // Set up quantity controls
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            const isPlus = this.classList.contains('plus');
            updateQuantity(itemId, isPlus);
        });
    });

    // View cart button
    document.getElementById('view-cart').addEventListener('click', function() {
        window.location.href = 'order.html';
    });

    // Update cart preview
    updateCartPreview();
});

function updateQuantity(itemId, isPlus) {
    const quantityElement = document.querySelector(`.quantity[data-id="${itemId}"]`);
    let quantity = parseInt(quantityElement.textContent);
    const priceElement = quantityElement.closest('.menu-item').querySelector('.price');
    const price = parseFloat(priceElement.textContent.replace('R', ''));

    if (isPlus) {
        quantity++;
    } else {
        quantity = Math.max(0, quantity - 1);
    }

    quantityElement.textContent = quantity;

    // Update cart in localStorage
    const cart = JSON.parse(localStorage.getItem('cart'));
    const existingItemIndex = cart.findIndex(item => item.id === itemId);

    if (quantity > 0) {
        const item = {
            id: itemId,
            name: quantityElement.closest('.menu-item').querySelector('h3').textContent,
            price: price,
            quantity: quantity,
            image: quantityElement.closest('.menu-item').querySelector('img').src
        };

        if (existingItemIndex >= 0) {
            cart[existingItemIndex] = item;
        } else {
            cart.push(item);
        }
    } else {
        if (existingItemIndex >= 0) {
            cart.splice(existingItemIndex, 1);
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartPreview();
}

function updateCartPreview() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    cartItemsElement.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p>Your cart is empty</p>';
        cartTotalElement.textContent = '0.00';
        return;
    }
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <span class="cart-item-name">${item.name}</span>
                <div class="cart-item-quantity-price">
                    <span class="cart-item-quantity">${item.quantity}x</span>
                    <span class="cart-item-price">R${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            </div>
        `;
        cartItemsElement.appendChild(itemElement);
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = total.toFixed(2);
}