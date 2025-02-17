const express = require('express');
const router = express.Router();
const { executeStoredProcedure } = require('../utils/dbhelpers');

// In your routes file (e.g., shop.js)
router.get('/', async (req, res) => {
    try {
        // Fetch seller products
        const sellerProducts = await executeStoredProcedure('GetArtist_details_Sp',{
            artist_id :'1340'
        });

        console.log('Artistsssss products >>>>>> ', sellerProducts)
        
        // Render the shop page with seller products
        res.render('shop', {
            sellerProducts
        });

        
    } catch (error) {
        console.error('Error fetching shop data:', error);
        res.status(500).render('error', { 
            message: 'Error loading shop page' 
        });
    }
});


module.exports = router