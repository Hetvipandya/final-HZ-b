const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getNewArrivals,
  getBestSellers,
  getSaleProducts
} = require('../controllers/productController');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/product-images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { files: 8, fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

const handleUpload = (uploadMiddleware, handler) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }
    return handler(req, res, next);
  });
};

// CREATE
router.post('/create', handleUpload(upload.array('images', 8), createProduct));


//new arrivals
router.get("/new-arrivals", getNewArrivals);
//best-sellers
router.get("/best-sellers", getBestSellers);
//sale-products
router.get("/sale-products",getSaleProducts);

// READ
router.get('/all', getProducts);
router.get('/:id', getProductById);

// UPDATE
router.put('/:id', handleUpload(upload.array('images', 8), updateProduct));

// DELETE
router.delete('/:id', deleteProduct);


module.exports = router;