import { NextResponse } from 'next/server';
import { uploadFile } from '../../../../lib/cloudinary';
import { authFromRequest } from '../../../../lib/auth';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const payload = authFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (file.size > MAX_SIZE_BYTES)
    return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^\w.\-]+/g, '-');
  const url = await uploadFile(buffer, {
    filename: safeName || `file-${Date.now()}`,
    contentType: file.type || undefined,
  });

  return NextResponse.json({
    ok: true,
    file: {
      name: file.name,
      url,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
    },
  });
}
