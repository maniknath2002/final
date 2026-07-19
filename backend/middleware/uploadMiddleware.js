const multer = require('multer');
const path = require('path');

// Configure where and how files are stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure to create an 'uploads' folder in your backend root
  },
  filename: (req, file, cb) => {
    // Save file with a unique timestamp to prevent overwriting
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filter to allow only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;