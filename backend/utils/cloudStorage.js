const cloudinary = require("cloudinary").v2;
const { randomUUID } = require("crypto");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadBuffer(buffer, originalName, folder, contentType) {
  const ext = path.extname(originalName);
  const uniqueName = `${Date.now()}-${randomUUID().slice(0, 8)}`;

  const isRaw = !contentType || (
    !contentType.startsWith("image/") &&
    !contentType.startsWith("video/")
  );

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `globalhealth/${folder}`,
        public_id: uniqueName,
        resource_type: isRaw ? "raw" : "auto",
        format: ext.replace(".", "") || undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}

async function deleteFile(fileUrl) {
  try {
    if (!fileUrl || !fileUrl.includes("cloudinary")) return;

    const parts = fileUrl.split("/upload/");
    if (parts.length < 2) return;

    let publicIdWithExt = parts[1].replace(/^v\d+\//, "");

    const lastDot = publicIdWithExt.lastIndexOf(".");
    const publicId = lastDot > -1 ? publicIdWithExt.substring(0, lastDot) : publicIdWithExt;

    const isRaw = !fileUrl.match(/\/(image|video)\/upload\//);
    const resourceType = isRaw ? "raw" : (fileUrl.includes("/video/upload/") ? "video" : "image");

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error("Cloudinary delete error:", err);
  }
}

module.exports = { uploadBuffer, deleteFile, cloudinary };
