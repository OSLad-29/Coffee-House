// Initialize data in localStorage if not exists
function initializeStorage() {
    if (!localStorage.getItem('menuItems')) {
        const menuItems = [
            // Coffee
            { id: 1, name: "Espresso", category: "coffee", price: 3.50, description: "Strong black coffee" },
            { id: 2, name: "Cappuccino", category: "coffee", price: 4.50, description: "Espresso with steamed milk" },
            { id: 3, name: "Latte", category: "coffee", price: 4.75, description: "Espresso with lots of steamed milk" },
            
            // Tea
            { id: 4, name: "Green Tea", category: "tea", price: 3.00, description: "Traditional green tea" },
            { id: 5, name: "Chai Latte", category: "tea", price: 4.25, description: "Spiced tea with milk" },
            
            // Food
            { id: 6, name: "Croissant", category: "food", price: 3.50, description: "Buttery French pastry" },
            { id: 7, name: "Blueberry Muffin", category: "food", price: 3.75, description: "Fresh muffin with blueberries" }
        ];
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
    }
    
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('reservations')) {
        localStorage.setItem('reservations', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('admin')) {
        const admin = {
            username: "admin",
            password: "coffee123" // In a real app, this would be hashed
        };
        localStorage.setItem('admin', JSON.stringify(admin));
    }
}

// Load menu items by category
function loadMenuItems(category) {
    const menuItems = JSON.parse(localStorage.getItem('menuItems'));
    const filteredItems = menuItems.filter(item => item.category === category);
    
    const container = document.getElementById(category);
    container.innerHTML = '';
    
    filteredItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'menu-item';
        itemElement.innerHTML = `
            <h4>${item.name} - $${item.price.toFixed(2)}</h4>
            <p>${item.description}</p>
            <button class="add-to-cart" data-id="${item.id}">Add to Order</button>
        `;
        container.appendChild(itemElement);
    });
}

// Add item to cart
function addToCart(itemId) {
    const menuItems = JSON.parse(localStorage.getItem('menuItems'));
    const item = menuItems.find(i => i.id === itemId);
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartPreview();
}

// Update cart preview
function updateCartPreview() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsElement = document.getElementById('cart-items');
    
    if (cartItemsElement) {
        cartItemsElement.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsElement.innerHTML = '<p>Your cart is empty</p>';
            return;
        }
        
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <span>${item.name}</span>
                <span>$${item.price.toFixed(2)}</span>
            `;
            cartItemsElement.appendChild(itemElement);
        });
        
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const totalElement = document.createElement('div');
        totalElement.className = 'cart-total';
        totalElement.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
        cartItemsElement.appendChild(totalElement);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeStorage();
    updateCartPreview();
    
    // Menu category switching
    const categoryButtons = document.querySelectorAll('.menu-categories button');
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // Update active button
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Show selected category
                document.querySelectorAll('.menu-items').forEach(div => {
                    div.classList.add('hidden');
                });
                document.getElementById(category).classList.remove('hidden');
                
                // Load items for this category
                loadMenuItems(category);
            });
        });
        
        // Load first category by default
        const firstCategory = categoryButtons[0].getAttribute('data-category');
        loadMenuItems(firstCategory);
    }
    
    // Add to cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            addToCart(itemId);
        }
    });
    
    // View cart button
    const viewCartBtn = document.getElementById('view-cart');
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', function() {
            window.location.href = 'order.html';
        });
    }
});