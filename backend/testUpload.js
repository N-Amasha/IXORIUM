const cloudinary = require("./config/cloudinary");

const testUpload = async () => {
  try {

    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      {
        folder: "ixorium-test"
      }
    );

    console.log("Upload Successful!");
    console.log("URL:", result.secure_url);
    console.log("Public ID:", result.public_id);

  } catch (error) {

    console.log("Upload Error:", error.message);

  }
};

testUpload();