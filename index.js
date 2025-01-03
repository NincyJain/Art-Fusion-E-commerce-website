// importing necessary packages:
var express = require('express');
var app = express();
const port = 80;
const pug = require('pug');
var path = require('path');
const bodyParser = require('body-parser');
const mssql = require('msnodesqlv8');
const multer = require('multer'); // For handling file uploads

// Middleware setup
app.use(bodyParser.json());
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

//#region Database connection string
const connectionstr = "Server=.;Database=Art_fusion_e_commerce_site;Trusted_Connection=Yes;Driver={SQL Server}";

// Test database connection before starting the server
mssql.query(connectionstr, "SELECT 1", (err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit if database connection fails
    }

    // Start the server after successful database connection
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log('Database connection successful');
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
});
//#endregion

// Your existing executeQuery helper function
function executeQuery(query, params) {
    return new Promise((resolve, reject) => {
        mssql.query(connectionstr, query, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

//#region Basic Routes setup
app.get('/', function (req, res) {
    res.render("../views/home.pug")
});
app.get('/login', function (req, res) {
    res.render("../views/login.pug")
});
app.get('/shop', function (req, res) {
    res.render("../views/shop.pug")
});
app.get('/blog', function (req, res) {
    res.render("../views/blog.pug")
});
app.get('/about', function (req, res) {
    res.render("../views/about.pug")
});
app.get('/contactus', function (req, res) {
    res.render("../views/contactus.pug")
});
//#endregion

//#region Get wishlist items
app.get('/wishlist', async (req, res) => {
    try {
        const userId = 1; // TODO: Replace with actual user authentication
        const query = `
          SELECT 
              P.Id,
              P.Name,
              P.Price,
              P.Image
          FROM Wishlist W
          JOIN Products P ON W.ProductId = P.Id
          WHERE W.UserId = ${userId}
      `;

        const results = await executeQuery(query, [userId]);
        res.render('wishlist', { products: results });
    }
    catch (err) {
        console.error('Wishlist fetch error:', err);
        res.status(500).render('error', { message: 'Unable to fetch wishlist items' });
    }
});
//#endregion

//#region Add item to wishlist
app.post('/wishlist/add', async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = 1; // TODO: Replace with actual user authentication

        // First check if item already exists
        // const checkQuery = `
        //     SELECT COUNT(*) as count 
        //     FROM Wishlist 
        //     WHERE UserId = ${userId} AND ProductId = ${productId}
        // `;

        // const checkResult = await executeQuery(checkQuery, [userId, productId]);

        // if (checkResult[0].count > 0) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Item already in wishlist'
        //     });
        // }

        // Add item to wishlist

        const insertQuery = `
          INSERT INTO Wishlist (UserId, ProductId) 
          VALUES (${userId},${productId})
      `;

        await executeQuery(insertQuery, [userId, productId]);

        res.json({
            success: true,
            message: 'Product added to wishlist'
        });
    }
    catch (err) {
        console.error('Add to wishlist error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to wishlist'
        });
    }
});
//#endregion

//#region Remove item from wishlist
app.post('/wishlist/remove', async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = 1; // TODO: Replace with actual user authentication

        const query = `
          DELETE FROM Wishlist 
          WHERE UserId = ${userId} AND ProductId = ${productId}
      `;

        await executeQuery(query, [userId, productId]);

        res.json({
            success: true,
            message: 'Product removed from wishlist'
        });
    }
    catch (err) {
        console.error('Remove from wishlist error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from wishlist'
        });
    }
});
//#endregion

//#region Toggle wishlist item (add/remove)
app.post('/wishlist/toggle', async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = 1; // TODO: Replace with actual user authentication

        // Check if item exists
        const checkQuery = `
          SELECT COUNT(*) as count 
          FROM Wishlist 
          WHERE UserId = ? AND ProductId = ?
      `;

        const checkResult = await executeQuery(checkQuery, [userId, productId]);

        if (checkResult[0].count > 0) {
            // Remove item
            const deleteQuery = `
              DELETE FROM Wishlist 
              WHERE UserId = ? AND ProductId = ?
          `;
            await executeQuery(deleteQuery, [userId, productId]);

            res.json({
                success: true,
                status: 'removed',
                message: 'Product removed from wishlist'
            });
        } else {
            // Add item
            const insertQuery = `
              INSERT INTO Wishlist (UserId, ProductId, DateAdded) 
              VALUES (?, ?, GETDATE())
          `;
            await executeQuery(insertQuery, [userId, productId]);

            res.json({
                success: true,
                status: 'added',
                message: 'Product added to wishlist'
            });
        }
    } catch (err) {
        console.error('Toggle wishlist error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update wishlist'
        });
    }
});
//#endregion


//#region adding items into cart
app.post("/cart/add", async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = 1;
        const query = `Insert into cart (UserId, ProductID) VALUES (${userId},${productId})`
        await executeQuery(query, [userId, productId]);

        res.json({
            success: true,
            message: "Product added to cart"
        })

    }
    catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to add item in cart'
        });

    }
})
//#endregion


//#region cart feature
app.get("/cart", async (req, res) => {
    try {
        const userId = 1;
        const query = `Select 
            P.Id,
            P.Name,
            P.Price,
            P.Image from cart c inner join Products P on c.ProductId = P.Id
            WHERE c.UserId = ${userId}`;

        const result = await executeQuery(query, [userId]);
        console.log(result)
        res.render("add_to_cart", { products: result });
    }
    catch (err) {
        console.error('Wishlist fetch error:', err);
        res.status(500).render('error', { message: 'Unable to fetch wishlist items' });
    }
})
//#endregion

//#region remove items from cart
app.post("/cart/remove", async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = 1;
        const query = `Delete from cart where userId = ${userId} AND ProductId = ${productId}`;
        await executeQuery(query, [userId, productId]);

        res.json({
            success: true,
            message: "Product removed from cart"
        });

    }
    catch (err) {
        console.error('Remove from cart error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart'
        });

    }
});
//#endregion



//#region
// Method 1: Store image files on filesystem and paths in database

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads/';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});


// API Endpoint to upload image (Method 1: Store path)
app.post('/upload/path', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const imagePath = '/uploads/' + req.file.filename;

        // Store the image path in database
        const query = `INSERT INTO ProductImages (ProductId, ImagePath, UploadDate) VALUES (?, ?, GETDATE())`;

        await executeQuery(query, [req.body.productId, imagePath]);

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            path: imagePath
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});
//#endregion


// #region Adding route for login/signup
app.get('/auth', (req, res) => {
    res.render("login_page");
});

app.post('/api/auth', async (req, res) => {
    const { type, action, data } = req.body;
    
    try {
        
        
        if (action === 'login')
        {
            const query = `Select * from Users_data_tbl where [Username] = @username and [Password] = @pwd and Usertype = @usertype`

            const results = await executeQuery(query, [
                data.email,
                data.password,
                type // buyer or seller
            ]);

            if (results && results.length > 0) {
                // User found - create session

                
                res.json({ 
                    success: true, 
                    redirectUrl: type === 'buyer' ? '/dashboard' : '/seller-dashboard'
                });
            } 
            else {
                res.status(401).json({ 
                    success: false, 
                    error: 'Invalid credentials' 
                });
            }
            
        } 
        else if (action === 'signup') {
            // First check if user already exists
            const checkUser = `('SELECT 1 FROM Users_data_tbl WHERE Email = @email')`;

            const existing = await executeQuery(checkUser, [data.email]);
            
            if (existing && existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Email already registered'
                });
            }
    
            // Insert new user
            const insertQuery = `INSERT INTO Users_data_tbl (Email, Username, Password, UserType, Created_dt) 
            VALUES ( @email,  @username, @password, @userType, GETDATE())`;

            await executeQuery(insertQuery, [data.email, data.username, data.password, type]);


            res.json({ 
                success: true, 
                redirectUrl: type === 'buyer' ? '/dashboard' : '/seller-dashboard'
            });
        }
    } 
        
    catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Authentication failed. Please try again.' 
        });
    }
        
        
});

//#region Sellers dashboard

app.get('/seller-dashboard', async (req, res) => {
    try {
        // Fetch seller's data (replace with actual user ID from session)
        const userId = 1; 
        
        // Get artist info
        const artistQuery = `
            SELECT * FROM Users_data_tbl 
            WHERE Id = ? AND UserType = 'seller'
        `;
        const artist = await executeQuery(artistQuery, [userId]);

        // Get artworks
        const artworksQuery = `
            SELECT * FROM Products 
            WHERE SellerId = ?
            ORDER BY Created_dt DESC
        `;
        const artworks = await executeQuery(artworksQuery, [userId]);

        // Get activity
        const activitiesQuery = `SELECT * FROM SellerActivity WHERE SellerId = ? 
        ORDER BY ActivityDate DESCLIMIT 5`;

        const activities = await executeQuery(activitiesQuery, [userId]);

        res.render('seller-dashboard', {
            artist: artist[0],
            artworks: artworks,
            activities: activities,
            totalSales: 0, // Add calculation
            totalArtworks: artworks.length,
            monthlyViews: 0 // Add calculation
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('error', { 
            message: 'Error loading dashboard' 
        });
    }
});
//#endregion









