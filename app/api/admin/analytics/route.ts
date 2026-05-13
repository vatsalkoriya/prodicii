import { NextResponse } from 'next/server';
import { connect } from '../../../../lib/mongodb';
import Order from '../../../../models/Order';
import Product from '../../../../models/Product';
import Customer from '../../../../models/Customer';
import Store from '../../../../models/Store';
import { authFromRequest } from '../../../../lib/auth';

export async function GET(req: Request) {
  const payload = authFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const storeId = url.searchParams.get('storeId');
  if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 });

  await connect();
  const store = await Store.findById(storeId);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  if (String(store.ownerId) !== payload.userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [orders, productCount, customerCount] = await Promise.all([
    Order.find({ storeId }),
    Product.countDocuments({ storeId, isActive: true }),
    Customer.countDocuments({ storeId }),
  ]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending_payment').length;
  const submittedOrders = orders.filter((o) => o.status === 'payment_submitted').length;
  const verifiedOrders = orders.filter((o) => o.status === 'payment_verified').length;
  const rejectedOrders = orders.filter((o) => o.status === 'payment_rejected').length;
  const revenue = orders
    .filter((o) => o.status === 'payment_verified')
    .reduce((s, o) => s + (o.totalAmount || 0), 0);

  // Last 7 days revenue breakdown
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentOrders = orders.filter(
    (o) => o.status === 'payment_verified' && new Date((o as any).createdAt) >= sevenDaysAgo
  );

  const dailyRevenue: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyRevenue[key] = 0;
  }
  for (const o of recentOrders) {
    const key = new Date((o as any).createdAt).toISOString().slice(0, 10);
    if (key in dailyRevenue) dailyRevenue[key] += (o as any).totalAmount || 0;
  }

  return NextResponse.json({
    ok: true,
    totalOrders,
    pendingOrders,
    submittedOrders,
    verifiedOrders,
    rejectedOrders,
    revenue,
    productCount,
    customerCount,
    dailyRevenue,
  });
}
