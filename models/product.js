const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true,
        min: 0
    },
    category: { 
        type: String, 
        required: true,
        enum: ['spices', 'herbs', 'blends', 'seasonings']
    },
    imageUrl: { 
        type: String, 
        required: true 
    },
    inStock: { 
        type: Boolean, 
        default: true 
    },
    rating: { 
        type: Number, 
        min: 0, 
        max: 5, 
        default: 0 
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true
        },
        date: { 
            type: Date, 
            default: Date.now 
        }
    }],
    featured: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add text index for search functionality
productSchema.index({ name: 'text', description: 'text', category: 'text' });

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
    return this.discount > 0 
        ? Math.round(this.price * (100 - this.discount) / 100)
        : this.price;
});

// Method to add a review
productSchema.methods.addReview = async function(userId, name, rating, comment) {
    const review = {
        user: userId,
        name,
        rating: Number(rating),
        comment
    };

    this.reviews.push(review);
    this.rating = this.reviews.reduce((acc, item) => item.rating + acc, 0) / this.reviews.length;
    
    await this.save();
    return this;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
