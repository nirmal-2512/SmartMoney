import cloudinary from '../../config/cloudinary.js';

export const uploadReceipt = (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'smartmoney/receipts',
        public_id: `receipt_${Date.now()}_${fileName.replace(/\s/g, '_')}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const deleteReceipt = async (receiptUrl) => {
  try {
    const parts = receiptUrl.split('/');
    const publicIdWithExt = parts.slice(-2).join('/');
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // silently fail
  }
};