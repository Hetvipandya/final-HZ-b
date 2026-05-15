const Category = require("../models/Category");

const {
  uploadToCloudinary,
} = require("../utils/uploadToCloudinary");


// CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {
    const { name, image, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const isActive = status === "Active" || status === true || status === "true";
    let imagePath = image;

    if (req.file) {
      imagePath = `/uploads/category-images/${req.file.filename}`;
    }

    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: "Image is required (upload file or provide image path)",
      });
    }

    const category = await Category.create({
      name,
      image: imagePath,
      isActive,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET ALL CATEGORIES
exports.getCategories = async (req, res) => {
  try {
    // GET ONLY ACTIVE CATEGORIES
    const categories = await Category.find({ isActive: true });

    // FORMAT DATA
    const formattedCategories = categories.map((category) => ({
      _id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,

      // CLOUDINARY IMAGE URL
      image: category.image?.url || "",

      // OPTIONAL
      public_id: category.image?.public_id || "",

      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: formattedCategories.length,
      data: formattedCategories,
    });

  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// GET CATEGORY BY ID
exports.getSingleCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error("GET SINGLE CATEGORY ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
  try {
    const { name, status, image } = req.body;
    const isActive = status === "Active" || status === true || status === "true";
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (status !== undefined) updateData.isActive = isActive;
    if (req.file) {
      updateData.image = `/uploads/category-images/${req.file.filename}`;
    } else if (image !== undefined) {
      updateData.image = image;
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
