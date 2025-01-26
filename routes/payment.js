const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const { executeStoredProcedure } = require('../utils/dbhelpers');
var OrderID = ''

function generateOrderId(length) {
    let orderId = '';
    for (let i = 0; i < length; i++) {
        orderId += Math.floor(Math.random() * 10);
    }
    OrderID = orderId;
}

router.post('/create-checkout-session', async (req, res) => {
    try {
        console.log('Checkout session route hit');
        
        const { cartItems, finalPrice } = req.body;
        
        if (!cartItems || cartItems.length === 0) {
            throw new Error('No items in cart');
        }

        // Calculate the total amount in paise
        const totalAmount = Math.round(finalPrice * 100);

        // Create a single line item for the total amount
        const lineItems = [{
            price_data: {
                currency: 'inr',
                product_data: {
                    name: 'Order Total (Including all fees and discounts)',
                },
                unit_amount: totalAmount,
            },
            quantity: 1,
        }];

        console.log('Creating checkout session with final price:', finalPrice);

        // Create Stripe checkout session with the final calculated amount
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.DOMAIN}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.DOMAIN}/cart`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Payment Error:', error);
        res.status(500).json({ 
            error: 'Payment session creation failed',
            details: error.message 
        });
    }
});

router.get('/success', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        if (session.payment_status === 'paid') {
            // Get user ID from session
            const userId = 1;
            
            if (!userId) {
                throw new Error('User ID not found in session');
            }

            try {
                // Get the SQL pool from your connection
                generateOrderId(6);
                console.log("order ID:", OrderID)
                await executeStoredProcedure('after_payment_clear_cart_sp', {userId: userId, orderid: OrderID});
                
                console.log('Cart cleared successfully for user:', userId);
                
                // Clear cart from session as well
                req.session.cart = [];
                
                // Create order record
                const order = {
                    userId: userId,
                    total: session.amount_total / 100,
                    paymentId: OrderID,
                    status: 'paid'
                };
                
                // TODO: Save order to your database here
                
                res.render('payment-success', {
                    orderId: order.paymentId,
                    total: order.total
                });
            } catch (sqlError) {
                console.error('SQL Error:', sqlError);
                // Even if cart clearing fails, show success to user but log the error
                res.render('payment-success', {
                    message: 'Payment successful!'
                });
            }
        } else {
            throw new Error('Payment not completed');
        }
    } catch (error) {
        console.error('Success route error:', error);
        res.status(500).render('error', { 
            message: 'There was a problem processing your payment'
        });
    }
});

module.exports = router;