// routes/wishlist.js
const express = require('express');
const router = express.Router();
const { executeStoredProcedure } = require('../utils/dbhelpers');

// Get wishlist items
router.get('/', async (req, res) => {
    try {
        const userId = 1; // TODO: Replace with actual user authentication
        const results = await executeStoredProcedure('sp_GetWishlistItems', {
            userId: userId
        });
        
        res.render('wishlist', { products: results });
    } catch (err) {
        console.error('Wishlist fetch error:', err);
        res.status(500).render('error', { 
            message: 'Unable to fetch wishlist items' 
        });
    }
});

// Add to wishlist
router.post('/add', async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = 1; // TODO: Replace with actual user authentication

        const result = await executeStoredProcedure('sp_AddToWishlist', {
            userId: userId,
            productId: productId
        });

        if (result[0].Status === 'EXISTS') {
            return res.status(400).json({
                success: false,
                message: 'Item already in wishlist'
            });
        }

        res.json({
            success: true,
            message: 'Product added to wishlist'
        });
    } catch (err) {
        console.error('Add to wishlist error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to wishlist'
        });
    }
});

// Remove from wishlist
router.post('/remove', async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = 1; // TODO: Replace with actual user authentication

        await executeStoredProcedure('sp_RemoveFromWishlist', {
            userId: userId,
            productId: productId
        });

        res.json({
            success: true,
            message: 'Product removed from wishlist'
        });
    } catch (err) {
        console.error('Remove from wishlist error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from wishlist'
        });
    }
});

// Toggle wishlist item
router.post('/toggle', async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = 1; // TODO: Replace with actual user authentication

        const result = await executeStoredProcedure('sp_ToggleWishlistItem', {
            userId: userId,
            productId: productId
        });

        res.json({
            success: true,
            status: result[0].Status.toLowerCase(),
            message: `Product ${result[0].Status.toLowerCase()} from wishlist`
        });
    } catch (err) {
        console.error('Toggle wishlist error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update wishlist'
        });
    }
});

module.exports = router;