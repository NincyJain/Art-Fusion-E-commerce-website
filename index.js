// importing necessary packages
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const { testConnection } = require('./config/database');
const session = require('express-session');
const stripe = require('./config/stripe');


// Port configuration
const port = process.env.PORT || 8000;

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files setup
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');//correct content type means 
        }
    }
}));

// Session setup
app.use(session({
    secret: 'sefqehw4ytyegw32363423tethr4gw4y',
    resave: false,
    saveUninitialized: false
}));


// Make session available to templates
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });

//   console.log("sessionssssss", req.session)


// View engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Import routes
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const sellerRoutes = require('./routes/seller');
const paymentRoutes = require('./routes/payment');
const ordersRoutes = require('./routes/order');
const analyticsRoutes = require('./routes/analytics');
const shopRoutes = require('./routes/shop');


// const uploadRoutes = require('./routes/upload');

// Basic page routes
app.get('/dashboard', (req, res) => {
    res.render("home");
});

// app.get('/shop', (req, res) => {
    
//     res.render("shop");
// });

app.get('/blog', (req, res) => {
    res.render("blog");
});

app.get('/about', (req, res) => {
    res.render("about");
});

app.get('/contactus', (req, res) => {
    res.render("contactus");
});

// app.get('/analytics', (req, res)=>{
//     res.render('analytics');
// })

// API Routes
//Parent routes
app.use('/', authRoutes.router);
app.use('/cart', cartRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/seller', sellerRoutes);
app.use('/logout', authRoutes.router);
app.use('/payment', paymentRoutes);
app.use('/my-orders', ordersRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/shop', shopRoutes);


app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { 
        message: 'Page not found' 
    });
});

// Database connection and server startup
async function startServer() {
    try {
        // Test database connection
        await testConnection();
        console.log('Database connection successful');

        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        }).on('error', (err) => {
            if (err.code === 'EACCES') {
                console.error(`Port ${port} requires elevated privileges`);
            } else if (err.code === 'EADDRINUSE') {
                console.error(`Port ${port} is already in use`);
            } else {
                console.error('Server startup error:', err);
            }
            process.exit(1);
        });
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    app.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});