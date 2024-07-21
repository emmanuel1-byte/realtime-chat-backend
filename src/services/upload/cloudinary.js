import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const {} = process.env;

cloudinary.config({
  cloud_name: "",
  api_key: "",
  api_secret: "",
});

async function cloudinaryUpload(files) {
  try {
    return cloudinary.uploader.upload_stream();
  } catch (err) {
    throw new Error(err);
  }
}
