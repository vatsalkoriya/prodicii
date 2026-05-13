import { NextResponse } from 'next/server';
import { connect } from '../../../lib/mongodb';
import Store from '../../../models/Store';
import { authFromRequest } from '../../../lib/auth';
import { storeCreateSchema } from '../../../lib/validators';

export async function POST(req: Request) {
  const payload = authFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = storeCreateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });

  await connect();

  // Reserved subdomains
  const reserved = ['www', 'api', 'admin', 'app', 'mail', 'dashboard'];
  if (reserved.includes(body.subdomain))
    return NextResponse.json({ error: 'Subdomain is reserved' }, { status: 409 });

  const existing = await Store.findOne({ subdomain: body.subdomain });
  if (existing) return NextResponse.json({ error: 'Subdomain already taken' }, { status: 409 });

  const store = await Store.create({
    name: body.name,
    subdomain: body.subdomain,
    description: body.description || '',
    upiId: body.upiId || null,
    ownerId: payload.userId,
  });

  return NextResponse.json({ ok: true, storeId: store._id, subdomain: store.subdomain }, { status: 201 });
}

export async function GET(req: Request) {
  const payload = authFromRequest(req);
  await connect();

  if (payload) {
    const stores = await Store.find({ ownerId: payload.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ stores });
  }

  // Public: return minimal store list for homepage
  const stores = await Store.find({ isActive: true })
    .select('name subdomain description logo')
    .limit(20)
    .sort({ createdAt: -1 });
  return NextResponse.json({ stores });
}
