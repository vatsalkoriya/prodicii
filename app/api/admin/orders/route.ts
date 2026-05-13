import { NextResponse } from 'next/server';
import { connect } from '../../../../lib/mongodb';
import Order from '../../../../models/Order';
import Store from '../../../../models/Store';
import { authFromRequest } from '../../../../lib/auth';

export async function GET(req: Request) {
  const payload = authFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const storeId = url.searchParams.get('storeId');
  const status = url.searchParams.get('status');
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const limit = Math.min(50, Number(url.searchParams.get('limit') || 20));
  const skip = (page - 1) * limit;

  if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 });

  await connect();
  const store = await Store.findById(storeId);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  if (String(store.ownerId) !== payload.userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const filter: Record<string, any> = { storeId };
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) });
}
