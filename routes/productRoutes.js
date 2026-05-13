const express = require('express');
const multer = require('multer');
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

// Configure multer for memory storage (Cloudinary uploads)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { files: 8, fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// CREATE
router.post('/create', upload.any(), createProduct);

//new arrivals
router.get("/new-arrivals", getNewArrivals);
//best-sellers
router.get("/best-sellers", getBestSellers);
//sale-products
router.get("/sale-products", getSaleProducts);

// READ
router.get('/all', getProducts);
router.get('/:id', getProductById);

// UPDATE
router.put('/:id', upload.any(), updateProduct);

// DELETE
router.delete('/:id', deleteProduct);

module.exports = router;