import { NextResponse } from 'next/server';
import { connect } from '../../../../../lib/mongodb';
import Order from '../../../../../models/Order';
import Store from '../../../../../models/Store';
import Customer from '../../../../../models/Customer';
import { authFromRequest } from '../../../../../lib/auth';

export async function POST(req: Request) {
  const payload = authFromRequest(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { orderId, action } = body;
  if (!orderId || !['approve', 'reject'].includes(action))
    return NextResponse.json({ error: 'orderId and action (approve|reject) required' }, { status: 400 });

  await connect();

  const order = await Order.findById(orderId);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.status !== 'payment_submitted')
    return NextResponse.json({ error: 'Order is not awaiting verification' }, { status: 400 });

  // Verify the requester owns the store
  const store = await Store.findById(order.storeId);
  if (!store || String(store.ownerId) !== payload.userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (action === 'approve') {
    order.status = 'payment_verified';
    order.paymentVerifiedAt = new Date();
    order.paymentVerifiedBy = payload.userId as any;

    // Update customer stats
    if (order.customer) {
      await Customer.findByIdAndUpdate(order.customer, {
        $inc: { totalSpent: order.totalAmount, orderCount: 1 },
        $set: { lastOrderAt: new Date() },
      });
    }
  } else {
    order.status = 'payment_rejected';
    // Restore inventory on rejection
    for (const item of order.products) {
      const { default: Product } = await import('../../../../../models/Product');
      await Product.findByIdAndUpdate(item.productId, { $inc: { inventory: item.qty } });
    }
  }

  await order.save();
  return NextResponse.json({ ok: true, status: order.status });
}
