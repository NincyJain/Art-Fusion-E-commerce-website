// routes/seller.js
const express = require('express');
const router = express.Router();
const { executeStoredProcedure } = require('../utils/dbhelpers');
const upload = require('../config/multer');


var Random_Id;

function generateNumericId(length) {
    let randomId = '';
    for (let i = 0; i < length; i++) {
        randomId += Math.floor(Math.random() * 10);
    }
    Random_Id = randomId;
    return Random_Id
}

// Get seller dashboard
router.get('/', async (req, res) => {
    console.log(req.session.user.email)
    try {
        const getId = await executeStoredProcedure('GetIdandUsernameSp', {
            email: req.session.user.email,
            usertype: 'seller'
        }); 

        const sellerId = getId[0]['ID']
        console.log(sellerId)
        
        // Get all dashboard data using single stored procedure
        const result = await executeStoredProcedure('sp_GetSellerDashboard', {
            artist_id: sellerId
        });

        let results = JSON.parse(result[0]['JSON_F52E2B61-18A1-11d1-B105-00805F49916B'])
        console.log("Results: ", results)
        
        // Extract data from results (stored procedure returns multiple result sets)
        //const artist = results[0][0];          
        const totalSales = results['totalSales'];   
        const totalArtworks = results['totalArtworks']; 
        const Artist__views_this_month = results['artistInfo'];   
        
        const displayArtworks = await executeStoredProcedure('[dbo].[GetAllArtworkDetailsSp]',{
            artistid: sellerId,
            username: req.session.user.username

        })

        res.render('seller-dashboard', {
            //artist,
            totalSales,
            totalArtworks,
            Artist__views_this_month,
            artworks: displayArtworks

        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('error', { 
            message: 'Error loading dashboard' 
        });
    }
});

//Add new artwork
router.post('/artwork/add', upload.single('image'), async (req, res) => {
    try {

        if (!req.session || !req.session.user.email) {
            return res.status(401).json({
                success: false,
                message: 'Please login to continue'
            });
        }

        const getId = await executeStoredProcedure('GetIdandUsernameSp', {
            email: req.session.user.email,
            usertype: 'seller'
        });

        if (!getId || !getId[0]) {
            return res.status(403).json({
                success: false,
                message: 'Seller account not found'
            });
        }

        const sellerId = getId[0]['ID'];

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Image upload is required'
            });
        }

        const { title, price, product_tag, description } = req.body;
        console.log("Title: ", title)
        if (!title || !price) {
            return res.status(400).json({
                success: false,
                message: 'Title and price are required'
            });
        }

        const imagePath = `/uploads/${req.file.filename}`;

        generateNumericId(4);

        const result = await executeStoredProcedure('[dbo].[UploadArtworksp]', {
            artistid: sellerId,
            artworkid: Random_Id,
            imageurl: imagePath,
            product_tag,
            title,
            price,
            bussiness_name: req.session.user.username
            
        });
        console.log(result)

        res.json({
            success: true,
            artworkId: Random_Id,
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

        const getId = await executeStoredProcedure('GetIdandUsernameSp', {
            email: req.session.user.email,
            usertype: 'seller'
        });

        if (!getId || !getId[0]) {
            return res.status(403).json({
                success: false,
                message: 'Seller account not found'
            });
        }

        const sellerId = getId[0]['ID'];

        const artworkId = parseInt(req.params.id);
        console.log(req.body);
        const { title, price, imageurl, Product_tag } = req.body;

        const result = await executeStoredProcedure('sp_UpdateArtwork', {
            
            sellerId,
            artworkId,
            imageurl,
            Product_tag,
            title,
            price

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
        if (!req.session || !req.session.user.email) {
            return res.status(401).json({
                success: false,
                message: 'Please login to continue'
            });
        }

        const getId = await executeStoredProcedure('GetIdandUsernameSp', {
            email: req.session.user.email,
            usertype: 'seller'
        });

        if (!getId || !getId[0]) {
            return res.status(403).json({
                success: false,
                message: 'Seller account not found'
            });
        }

        console.log('Successfully fetch the seller id')

        const sellerId = getId[0]['ID'];
        console.log(req.params)
        const artworkId = parseInt(req.params.id);

        console.log('>> Deletion Started!!')

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
