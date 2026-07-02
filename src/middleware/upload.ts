import multer from "multer";
import { AppError } from "./errorHandler";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`File type ${file.mimetype} is not allowed. Only images are accepted.`, 400));
    }
  },
});

/**
 * Upload middleware for a single image field.
 * Usage: upload.single('image')
 */
export const uploadSingle = upload.single("image");

/**
 * Upload middleware for multiple images (up to 5).
 * Usage: upload.array('images', 5)
 */
export const uploadMultiple = upload.array("images", 5);

/**
 * Upload middleware for receipt images.
 * Usage: upload.single('receipt')
 */
export const uploadReceipt = upload.single("receipt");
