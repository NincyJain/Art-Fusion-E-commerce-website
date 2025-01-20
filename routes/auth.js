const express = require('express');
const router = express.Router();
const { executeStoredProcedure } = require('../utils/dbhelpers');
let Random_Id;

function generateNumericId(length) {
    let randomId = '';
    for (let i = 0; i < length; i++) {
        randomId += Math.floor(Math.random() * 10);
    }
    Random_Id = randomId;
    return Random_Id
}

router.get('/', (req, res) => {
    res.render("login_page");
});

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
                // Store user info in session
                req.session.user = {
                    id: result[0].Id,
                    username: result[0].Username,
                    email: result[0].Email,
                    userType: result[0].UserType
                };
                console.log("Fetched while login: ", {
                    id: result[0].Id,
                    username: result[0].Username,
                    email: result[0].Email,
                    userType: result[0].UserType
                })

                console.log({ 
                    success: true, 
                    username: result[0].Username,
                    redirectUrl: type === 'buyer' ? '/dashboard' : '/seller-dashboard'
                });
                
                res.json({ 
                    success: true, 
                    username: req.session.user.Username,
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
            const userId = generateNumericId(4);
            const result = await executeStoredProcedure('User_Signup_sp', {
                id: userId,
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

            // Store user info in session after successful signup
            req.session.user = {
                id: userId,
                username: data.username,
                email: data.email,
                userType: type
            };
            console.log("Fetched while signup: ", {
                id: userId,
                username: data.username,
                email: data.email,
                userType: type
            });

            res.json({ 
                success: true,
                username: data.username,
                redirectUrl: type === 'buyer' ? '/' : '/'
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

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = {
    router,
    Random_Id
};

