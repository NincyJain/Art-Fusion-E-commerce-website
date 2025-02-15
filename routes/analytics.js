// routes/analytics.js
const express = require('express');
const router = express.Router();
const { executeStoredProcedure } = require('../utils/dbhelpers');

router.get('/', async (req, res) => {
    try {
        if (!req.session || !req.session.user.email) {
            return res.redirect('/login');
        }

        // Get seller ID using the existing stored procedure
        const getId = await executeStoredProcedure('GetIdandUsernameSp', {
            email: req.session.user.email,
            usertype: 'seller'
        });

        if (!getId || !getId[0]) {
            return res.status(403).render('error', {
                message: 'Seller account not found'
            });
        }

        const sellerId = getId[0]['ID'];

        // Get monthly views data
        const monthlyViewsQuery = await executeStoredProcedure('sp_GetArtistMonthlyViews', {
            artistId: sellerId
        });

        // Get monthly sales data
        const monthlySalesQuery = await executeStoredProcedure('sp_GetArtistMonthlySales', {
            artistId: sellerId
        });

        // Get current month's stats
        const currentStats = await executeStoredProcedure('sp_GetArtistCurrentStats', {
            artistId: sellerId
        });

        res.render('analytics', {
            totalSales: currentStats[0].TotalSales || 0,
            totalArtworks: currentStats[0].TotalArtworks || 0,
            Artist__views_this_month: currentStats[0].MonthlyViews || 0,
            monthlyViews: monthlyViewsQuery,
            monthlySales: monthlySalesQuery,
            user: req.session.user
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).render('error', {
            message: 'Error loading analytics'
        });
    }
});

module.exports = router;