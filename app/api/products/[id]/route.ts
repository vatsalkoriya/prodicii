import { NextResponse } from 'next/server';
import { connect } from '../../../../lib/mongodb';
import Product from '../../../../models/Product';
import Store from '../../../../models/Store';
import { authFromRequest } from '../../../../lib/auth';
import { productSchema } from '../../../../lib/validators';

async function getOwnedProduct(req: Request, id: string) {
  const payload = authFromRequest(req);
  if (!payload) return { error: 'Unauthorized', status: 401 };
  await connect();
  const prod = await Product.findById(id);
  if (!prod) return { error: 'Not found', status: 404 };
  const store = await Store.findById(prod.storeId);
  if (!store || String(store.ownerId) !== payload.userId)
    return { error: 'Forbidden', status: 403 };
  return { prod, store, payload };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await connect();
  const prod = await Product.findById(params.id);
  if (!prod) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product: prod });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const result = await getOwnedProduct(req, params.id);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const body = await req.json();
  // Partial validation — only validate provided fields
  const partial = productSchema.partial().safeParse(body);
  if (!partial.success)
    return NextResponse.json({ error: 'Invalid input', details: partial.error.flatten() }, { status: 400 });

  Object.assign(result.prod, partial.data);
  await result.prod.save();
  return NextResponse.json({ ok: true, product: result.prod });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const result = await getOwnedProduct(req, params.id);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });

  await Product.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
