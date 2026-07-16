const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const multer = require("multer");


// Store uploaded file temporarily
const storage = multer.memoryStorage();
const upload = multer({
    storage: multer.memoryStorage()
});


// Upload file to Cloudinary
router.post("/", upload.single("file"), async(req,res)=>{

console.log("FILE RECEIVED:", req.file);
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }


    const uploadResult = await new Promise((resolve, reject) => {

      cloudinary.uploader.upload_stream(
        {
          resource_type: "auto"
        },

        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }

      ).end(req.file.buffer);

    });


    res.json({
      message: "Upload successful",
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });


  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
});


module.exports = router;