const Category = require("../models/Category");

const {
  uploadToCloudinary,
} = require("../utils/uploadToCloudinary");


// CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const isActive =
      status === "Active" ||
      status === true ||
      status === "true";

    let image = "";

    // ================= CLOUDINARY UPLOAD =================
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          `category-${name}-${Date.now()}`
        );

        image = uploadResult.secure_url;

        console.log("✅ Category image uploaded:", image);

      } catch (cloudinaryError) {
        console.error("❌ Cloudinary upload error:", cloudinaryError);

        return res.status(500).json({
          success: false,
          message: "Image upload to Cloudinary failed",
        });
      }
    } else if (req.body.image) {
      image = req.body.image;
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const category = await Category.create({
      name,
      image,
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
  // FORMAT DATA
const formattedCategories = categories.map((category) => ({
  _id: category._id,
  name: category.name,
  slug: category.slug,
  description: category.description,

  // HANDLE BOTH STRING & CLOUDINARY OBJECT
  image:
    typeof category.image === "string"
      ? category.image
      : category.image?.url || "",

  public_id:
    typeof category.image === "object"
      ? category.image?.public_id || ""
      : "",

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
    const { name, status } = req.body;

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (status !== undefined) {
      updateData.isActive =
        status === "Active" ||
        status === true ||
        status === "true";
    }

    // ================= CLOUDINARY IMAGE UPDATE =================
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          `category-${name || "image"}-${Date.now()}`
        );

        updateData.image = uploadResult.secure_url;

        console.log("✅ Category image updated:", updateData.image);

      } catch (cloudinaryError) {
        console.error("❌ Cloudinary upload error:", cloudinaryError);

        return res.status(500).json({
          success: false,
          message: "Image upload to Cloudinary failed",
        });
      }
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });

  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
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
