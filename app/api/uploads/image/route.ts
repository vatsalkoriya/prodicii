import { NextResponse } from 'next/server';
import { uploadImage } from '../../../../lib/cloudinary';
import { authFromRequest } from '../../../../lib/auth';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: Request) {
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
    url = await uploadImage(buffer);
  } else {
    // JSON body with base64 or URL
    const body = await req.json();
    if (!body.image) return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    url = await uploadImage(body.image);
  }

  return NextResponse.json({ ok: true, url });
}
