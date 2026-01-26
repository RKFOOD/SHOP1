// DOM Elements
const productsContainer = document.getElementById('products-container');
const productTemplate = document.getElementById('product-template');

// Fetch products from the API
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Format price with currency
function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(price);
}

// Create product card HTML
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product._id;
    
    const discountBadge = product.discount > 0 
        ? `<span class="product-badge">${product.discount}% OFF</span>` 
        : '';
    
    const originalPrice = product.discount > 0
        ? `<span class="original-price">${formatPrice(product.price)}</span>`
        : '';
    
    const price = product.discount > 0
        ? product.discountedPrice || Math.round(product.price * (100 - product.discount) / 100)
        : product.price;

    card.innerHTML = `
        <div class="product-image">
            <img src="${product.imageUrl}" alt="${product.name}">
            <div class="product-overlay">
                <a href="/product-detail.html?id=${product._id}" class="btn btn-outline">View Details</a>
                <button class="add-to-cart" data-product-id="${product._id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
            ${discountBadge}
        </div>
        <div class="product-info">
            <span class="product-category">${product.category}</span>
            <h3>${product.name}</h3>
            <div class="product-rating">
                ${getStarRatingHTML(product.rating)}
                <span class="rating-count">(${product.reviews?.length || 0})</span>
            </div>
            <div class="price-container">
                <span class="price">${formatPrice(price)}</span>
                ${originalPrice}
            </div>
        </div>
    `;
    
    return card;
}

// Generate star rating HTML
function getStarRatingHTML(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Display products on the page
async function displayProducts() {
    const products = await fetchProducts();
    
    if (products.length === 0) {
        productsContainer.innerHTML = '<p class="no-products">No products found.</p>';
        return;
    }
    
    productsContainer.innerHTML = '';
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
    
    // Add event listeners to Add to Cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Add to cart function
function addToCart(event) {
    event.preventDefault();
    const productId = event.currentTarget.dataset.productId;
    // Implement your cart functionality here
    console.log('Added to cart:', productId);
    // Show a toast notification
    showToast('Product added to cart');
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
});
