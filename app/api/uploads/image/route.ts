import { NextResponse } from 'next/server';
import { uploadImage } from '../../../../lib/cloudinary';
import { authFromRequest } from '../../../../lib/auth';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: Request) {
  try {
    const payload = authFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const contentType = req.headers.get('content-type') || '';

    let url: string;

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file') as File | null;
      if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      if (!ALLOWED_TYPES.includes(file.type))
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
      if (file.size > MAX_SIZE_BYTES)
        return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 });

      const buffer = Buffer.from(await file.arrayBuffer());
      console.log(`[uploads/image] Uploading multipart image file: ${file.name} (${file.size} bytes, type: ${file.type})`);
      url = await uploadImage(buffer, 'prodicii', file.type);
    } else {
      // JSON body with base64 or URL
      const body = await req.json();
      if (!body.image) return NextResponse.json({ error: 'No image provided' }, { status: 400 });
      console.log('[uploads/image] Uploading JSON image (base64 or URL)');
      url = await uploadImage(body.image);
    }

    console.log(`[uploads/image] Upload successful! URL: ${url}`);
    return NextResponse.json({ ok: true, url });
  } catch (error: any) {
    console.error('[uploads/image] Unexpected error during upload:', error?.stack || error?.message || error);
    return NextResponse.json({ error: 'Internal Server Error', details: error?.message }, { status: 500 });
  }
}
