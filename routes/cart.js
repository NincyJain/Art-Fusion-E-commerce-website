// routes/cart.js
const express = require('express');
const router = express.Router();
const { executeStoredProcedure } = require('../utils/dbhelpers');

// Get cart items
router.get('/', async (req, res) => {
    try {
        const userId = 1; // TODO: Replace with actual user authentication
        const results = await executeStoredProcedure('sp_GetCartItems', {
            userId: userId
        });
        
        res.render('add_to_cart', { products: results });
    } catch (err) {
        console.error('Cart fetch error:', err);
        res.status(500).render('error', { 
            message: 'Unable to fetch cart items' 
        });
    }
});

// Add to cart
router.post('/add', async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = 1; // TODO: Replace with actual user authentication

        const result = await executeStoredProcedure('sp_AddToCart', {
            userId: userId,
            productId: productId
        });

        if (result[0].Status === 'EXISTS') {
            return res.status(400).json({
                success: false,
                message: 'Item already in cart'
            });
        }

        res.json({
            success: true,
            message: 'Product added to cart'
        });
    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart'
        });
    }
});

// Remove from cart
router.post('/remove', async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = 1; // TODO: Replace with actual user authentication

        await executeStoredProcedure('sp_RemoveFromCart', {
            userId: userId,
            productId: productId
        });

        res.json({
            success: true,
            message: 'Product removed from cart'
        });
    } catch (err) {
        console.error('Remove from cart error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart'
        });
    }
});

module.exports = router;