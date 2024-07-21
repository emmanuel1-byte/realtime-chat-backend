import multer from "multer";
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const fileTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "audio/mpeg",
    "audio/wav",
    "video/mp4",
    "video/quicktime",
    "video/x-matroska",
  ];
  try {
    if (!fileTypes.includes(file.mimetype)) {
      return cb(null, false);
    }
    cb(null, true);
  } catch (err) {
    cb(new Error("File filter failed"));
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5242880 },
});

export default upload;
