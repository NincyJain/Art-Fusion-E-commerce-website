// routes/auth.js
const express = require('express');
const router = express.Router();
const { executeStoredProcedure } = require('../utils/dbhelpers');

function generateNumericId(length) {
    let randomId = '';
    for (let i = 0; i < length; i++) {
        randomId += Math.floor(Math.random() * 10); // Append a random digit (0-9)
    }
    return randomId;
}

// Login/Signup page render
router.get('/', (req, res) => {
    res.render("login_page");
});

// Authentication API
router.post('/', async (req, res) => {
    const { type, action, data } = req.body;
    
    try {
        if (action === 'login') {
            const result = await executeStoredProcedure('User_login_sp', {
                email: data.email,
                password: data.password,
                usertype: type
            });

            if (result && result.length > 0) {
                // User found - create session
                res.json({ 
                    success: true, 
                    redirectUrl: type === 'buyer' ? '/dashboard' : '/seller-dashboard'
                });
            } else {
                res.status(401).json({ 
                    success: false, 
                    error: 'Invalid credentials' 
                });
            }
        } 
        else if (action === 'signup') {
            const result = await executeStoredProcedure('User_Signup_sp', {
                id: generateNumericId(4),
                email: data.email,
                username: data.username,
                password: data.password,
                userType: type
            });

            if (result[0].Status === 'EXISTS') {
                return res.status(400).json({
                    success: false,
                    error: 'Email already registered'
                });
            }

            res.json({ 
                success: true, 
                redirectUrl: type === 'buyer' ? '/dashboard' : '/seller-dashboard'
            });
        }
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Authentication failed. Please try again.' 
        });
    }
});

module.exports = router;