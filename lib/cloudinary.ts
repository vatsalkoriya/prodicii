import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Upload a Buffer or base64 string to Cloudinary and return the secure URL */
export async function uploadImage(
  source: Buffer | string,
  folder = 'prodicii'
): Promise<string> {
  const input =
    Buffer.isBuffer(source)
      ? `data:image/webp;base64,${source.toString('base64')}`
      : source;

  const result = await cloudinary.uploader.upload(input, {
    folder,
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });

  return result.secure_url;
}

export async function uploadFile(
  source: Buffer,
  {
    folder = 'prodicii/attachments',
    filename,
    contentType,
  }: { folder?: string; filename: string; contentType?: string }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw',
        public_id: filename.replace(/\.[^/.]+$/, ''),
        use_filename: true,
        unique_filename: true,
        format: filename.includes('.') ? filename.split('.').pop() : undefined,
        ...(contentType ? { content_type: contentType } : {}),
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
          return;
        }
        resolve(result.secure_url);
      }
    );

    stream.end(source);
  });
}
