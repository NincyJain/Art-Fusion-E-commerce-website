const express = require('express');
const router = express.Router();
const { executeStoredProcedure } = require('../utils/dbhelpers');

router.get('/', async (req, res) => {
    try {
        const userId = 1; // TODO: Replace with actual user authentication
        const results = await executeStoredProcedure('GetUserOrdersSp', {
            userId: userId
        });

        console.log("Orders", results);
        
        res.render('my-orders', { orders: results });

    } catch (err) {
        console.error('Orders fetch error:', err);
        res.status(500).render('error', { 
            message: 'Unable to fetch orders' 
        });
    }
});

module.exports = router;