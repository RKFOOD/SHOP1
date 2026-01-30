// Cart functionality with event system
class Cart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.listeners = [];
    }
    
    // Subscribe to cart updates
    subscribe(callback) {
        this.listeners.push(callback);
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }
    
    // Notify all subscribers
    notify() {
        this.listeners.forEach(callback => callback(this.cart));
    }

    // Add item to cart
    addItem(product) {
        const existingItem = this.cart.find(item => 
            item.id === product.id && 
            (!item.weight || item.weight === product.weight)
        );

        if (existingItem) {
            existingItem.quantity += product.quantity;
        } else {
            this.cart.push({...product});
        }
        
        this.saveCart();
        this.updateCartCount();
        this.notify(); // Notify subscribers of the update
    }

    // Remove item from cart
    removeItem(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.updateCartCount();
        this.notify(); // Notify subscribers of the update
    }

    // Update item quantity
    updateQuantity(index, quantity) {
        if (quantity < 1) return;
        this.cart[index].quantity = quantity;
        this.saveCart();
        this.notify(); // Notify subscribers of the update
    }

    // Get cart items
    getItems() {
        return [...this.cart];
    }

    // Get cart total
    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Get total items in cart
    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Clear cart
    clear() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        this.notify(); // Notify subscribers of the update
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    // Update cart count in the UI
    updateCartCount() {
        const cartCounts = document.querySelectorAll('.cart-count');
        const totalItems = this.getTotalItems();
        
        cartCounts.forEach(count => {
            count.textContent = totalItems;
            count.style.display = totalItems > 0 ? 'flex' : 'none';
        });
    }

    // Format order message for Telegram
    getOrderMessage() {
        const orderItems = this.cart.map(item => 
            `${item.quantity}x ${item.name} - ₹${(item.price * item.quantity).toLocaleString('en-IN')}`
        ).join('\n');
        
        const total = this.getTotal();
        
        return `🛒 *New Order*\n\n` +
               `*Items:*\n${orderItems}\n\n` +
               `*Total: ₹${total.toLocaleString('en-IN')}*\n\n` +
               `_Please provide shipping details to complete the order._`;
    }
}

// Initialize cart
const cart = new Cart();

// Update cart count on page load and handle cart updates
document.addEventListener('DOMContentLoaded', () => {
    cart.updateCartCount();
    
    // Subscribe to cart updates to keep the UI in sync
    cart.subscribe((updatedCart) => {
        // This will be called whenever the cart is updated
        cart.updateCartCount();
        
        // If we're on the cart page, update the cart display
        if (document.getElementById('cartItems')) {
            renderCart(updatedCart);
        }
    });
});

// Function to render the cart (for cart.html)
function renderCart(cartItems) {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    if (!cartItems || cartItems.length === 0) {
        emptyCartMessage.style.display = 'flex';
        cartSummary.style.display = 'none';
        cartItemsContainer.innerHTML = '';
        return;
    }
    
    emptyCartMessage.style.display = 'none';
    cartSummary.style.display = 'block';
    
    // Calculate subtotal and total
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal; // Add shipping if needed
    
    // Update summary
    subtotalElement.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    totalElement.textContent = `₹${total.toLocaleString('en-IN')}`;
    
    // Render cart items
    cartItemsContainer.innerHTML = cartItems.map((item, index) => `
        <div class="cart-item" data-index="${index}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <span class="cart-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                <div class="quantity-selector">
                    <button class="quantity-btn minus">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                    <button class="quantity-btn plus">+</button>
                    <button class="remove-item">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to the new elements
    document.querySelectorAll('.quantity-btn.minus').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const newQty = Math.max(1, cartItems[index].quantity - 1);
            cart.updateQuantity(index, newQty);
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const newQty = cartItems[index].quantity + 1;
            cart.updateQuantity(index, newQty);
        });
    });
    
    document.querySelectorAll('.quantity-input').forEach((input, index) => {
        input.addEventListener('change', (e) => {
            const newQty = parseInt(e.target.value) || 1;
            cart.updateQuantity(index, newQty);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            cart.removeItem(index);
        });
    });
}

// If we're on the cart page, initialize the cart display
if (document.getElementById('cartItems')) {
    // Initial render
    renderCart(cart.getItems());
    
    // Handle checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            // Format the order message for Telegram
            const orderMessage = cart.getOrderMessage();
            const phoneNumber = 'YOUR_PHONE_NUMBER'; // Replace with your phone number
            const telegramUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(orderMessage)}`;
            
            // Open WhatsApp with the order message
            window.open(telegramUrl, '_blank');
            
            // Optional: Clear the cart after checkout
            // cart.clear();
        });
    }
}
