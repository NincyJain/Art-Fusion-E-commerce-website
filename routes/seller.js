// routes/seller.js
const express = require('express');
const router = express.Router();
const { executeStoredProcedure } = require('../utils/dbhelpers');
const upload = require('../config/multer');
const { Random_Id } = require('./auth');

// Get seller dashboard
router.get('/', async (req, res) => {
    try {
        const sellerId = Random_Id; // TODO: Replace with actual user authentication
        
        // Get all dashboard data using single stored procedure
        const results = await executeStoredProcedure('sp_GetSellerDashboard', {
            sellerId: sellerId
        });
        
        // Extract data from results (stored procedure returns multiple result sets)
        const artist = results[0][0];          // First result set: artist info
        const totalSales = results[1][0].totalSales;    // Second result set: total sales
        const totalArtworks = results[2][0].totalArtworks; // Third result set: artwork count
        const monthlyViews = results[3][0].monthlyViews;   // Fourth result set: monthly views
        const artworks = results[4];           // Fifth result set: artworks
        const activities = results[5];         // Sixth result set: activities
        
        res.render('seller-dashboard', {
            artist,
            totalSales,
            totalArtworks,
            monthlyViews,
            artworks,
            activities
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('error', { 
            message: 'Error loading dashboard' 
        });
    }
});

// Add new artwork
router.post('/artwork/add', upload.single('image'), async (req, res) => {
    try {
        const sellerId = 1; // TODO: Replace with actual user authentication
        const { title, price, description } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const result = await executeStoredProcedure('sp_AddArtwork', {
            sellerId,
            title,
            price,
            image: imagePath,
            description
        });

        res.json({
            success: true,
            artworkId: result[0].NewArtworkId,
            message: 'Artwork added successfully'
        });
    } catch (error) {
        console.error('Add artwork error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add artwork'
        });
    }
});

// Update artwork
router.put('/artwork/:id', async (req, res) => {
    try {
        const sellerId = 1; // TODO: Replace with actual user authentication
        const artworkId = parseInt(req.params.id);
        const { title, price, description } = req.body;

        const result = await executeStoredProcedure('sp_UpdateArtwork', {
            artworkId,
            sellerId,
            title,
            price,
            description
        });

        res.json({
            success: true,
            message: 'Artwork updated successfully'
        });
    } catch (error) {
        console.error('Update artwork error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update artwork'
        });
    }
});

// Delete artwork
router.delete('/artwork/:id', async (req, res) => {
    try {
        const sellerId = 1; // TODO: Replace with actual user authentication
        const artworkId = parseInt(req.params.id);

        await executeStoredProcedure('sp_DeleteArtwork', {
            artworkId,
            sellerId
        });

        res.json({
            success: true,
            message: 'Artwork deleted successfully'
        });
    } catch (error) {
        console.error('Delete artwork error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete artwork'
        });
    }
});

module.exports = router;