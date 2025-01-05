// routes/seller.js
const express = require('express');
const router = express.Router();
const { executeStoredProcedure } = require('../utils/dbhelpers');

// Seller dashboard
router.get('/', async (req, res) => {
    try {
        const userId = 1; // TODO: Replace with actual user authentication
        
        // Get artist info
        const artistResult = await executeStoredProcedure('sp_GetSellerInfo', {
            userId: userId
        });

        // Get artworks
        const artworksResult = await executeStoredProcedure('sp_GetSellerArtworks', {
            sellerId: userId
        });

        // Get activities
        const activitiesResult = await executeStoredProcedure('sp_GetSellerActivities', {
            sellerId: userId
        });

        // Get dashboard stats
        const statsResult = await executeStoredProcedure('sp_GetSellerDashboardStats', {
            sellerId: userId
        });

        res.render('seller-dashboard', {
            artist: artistResult[0],
            artworks: artworksResult,
            activities: activitiesResult,
            totalSales: statsResult[0].TotalSales,
            totalArtworks: statsResult[1].TotalArtworks,
            monthlyViews: statsResult[2].MonthlyViews
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('error', { 
            message: 'Error loading dashboard' 
        });
    }
});

module.exports = router;