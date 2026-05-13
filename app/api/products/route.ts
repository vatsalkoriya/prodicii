import { NextResponse } from 'next/server';
import { connect } from '../../../lib/mongodb';
import Product from '../../../models/Product';
import Store from '../../../models/Store';
import { productSchema } from '../../../lib/validators';
import { authFromRequest } from '../../../lib/auth';

export async function POST(req: Request) {
  const payload = authFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });

  await connect();

  // Verify store ownership
  const store = await Store.findById(body.storeId);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  if (String(store.ownerId) !== payload.userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Ensure slug is unique within this store
  const slugExists = await Product.findOne({ slug: body.slug, storeId: body.storeId });
  if (slugExists)
    return NextResponse.json({ error: 'Slug already used in this store' }, { status: 409 });

  const product = await Product.create({ ...parsed.data });
  return NextResponse.json({ ok: true, product }, { status: 201 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const storeId = url.searchParams.get('storeId');
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const limit = Math.min(50, Number(url.searchParams.get('limit') || 20));
  const skip = (page - 1) * limit;

  await connect();

  const filter: Record<string, any> = { isActive: true };
  if (storeId) filter.storeId = storeId;

  const [products, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Product.countDocuments(filter),
  ]);

  return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
}
