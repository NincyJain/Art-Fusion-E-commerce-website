// importing necessary packages
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const { testConnection } = require('./config/database');

// Port configuration
const port = process.env.PORT || 80;

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files setup
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// View engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Import routes
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const sellerRoutes = require('./routes/seller');
// const uploadRoutes = require('./routes/upload');

// Basic page routes
app.get('/dashboard', (req, res) => {
    res.render("home");
});

// app.get('/dashboard', (req, res) => {
//     res.render("dash");
// });

// app.get('/login', (req, res) => {
//     res.render("login");
// });

app.get('/shop', (req, res) => {
    res.render("shop");
});

app.get('/blog', (req, res) => {
    res.render("blog");
});

app.get('/about', (req, res) => {
    res.render("about");
});

app.get('/contactus', (req, res) => {
    res.render("contactus");
});

// API Routes
app.use('/', authRoutes);
app.use('/cart', cartRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/seller', sellerRoutes);
// app.use('/upload', uploadRoutes);

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