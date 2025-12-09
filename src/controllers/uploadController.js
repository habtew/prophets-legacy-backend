const supabase = require('../config/supabase');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.'));
    }
  }
});

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.file;
    const bucket = req.body.bucket || 'avatars';
    const validBuckets = ['avatars', 'backgrounds', 'lesson-assets', 'sfx', 'animations', 'shareables'];

    if (!validBuckets.includes(bucket)) {
      return res.status(400).json({
        success: false,
        message: `Invalid bucket. Must be one of: ${validBuckets.join(', ')}`
      });
    }

    const timestamp = Date.now();
    const userId = req.user?.id || 'public';
    const fileExt = file.originalname.substring(file.originalname.lastIndexOf('.'));
    const uniqueFileName = `${userId}_${timestamp}${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload file',
        details: error.message
      });
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uniqueFileName);

    const publicUrl = urlData.publicUrl;

    if (bucket === 'avatars' && req.user?.role === 'child') {
      await supabase
        .from('children')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', req.user.id);
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: publicUrl,
      fileName: uniqueFileName,
      bucket: bucket
    });
  } catch (error) {
    console.error('Upload exception:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

module.exports = {
  upload,
  uploadImage
};
