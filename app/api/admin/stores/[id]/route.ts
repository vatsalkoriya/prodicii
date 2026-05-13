import { NextResponse } from 'next/server';
import { connect } from '../../../../../lib/mongodb';
import Store from '../../../../../models/Store';
import { authFromRequest } from '../../../../../lib/auth';
import { storeUpdateSchema } from '../../../../../lib/validators';

async function getOwnedStore(req: Request, id: string) {
  const payload = authFromRequest(req);
  if (!payload) return { error: 'Unauthorized', status: 401 };
  await connect();
  const store = await Store.findById(id);
  if (!store) return { error: 'Store not found', status: 404 };
  if (String(store.ownerId) !== payload.userId) return { error: 'Forbidden', status: 403 };
  return { store, payload };
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const result = await getOwnedStore(req, params.id);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ store: result.store });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const result = await getOwnedStore(req, params.id);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const body = await req.json();
  const parsed = storeUpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });

  const allowed: (keyof typeof parsed.data)[] = [
    'name', 'upiId', 'customDomain', 'theme', 'homepageSections',
    'description', 'logo', 'bannerImage', 'contactEmail', 'returnPolicy', 'socialLinks',
  ];

  const update: Record<string, any> = {};
  for (const key of allowed) {
    if (parsed.data[key] !== undefined) update[key] = parsed.data[key];
  }

  const updated = await Store.findByIdAndUpdate(params.id, update, { new: true });
  return NextResponse.json({ ok: true, store: updated });
}
