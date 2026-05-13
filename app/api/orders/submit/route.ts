import { NextResponse } from 'next/server';
import { connect } from '../../../../lib/mongodb';
import Order from '../../../../models/Order';
import { paymentSubmitSchema } from '../../../../lib/validators';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = paymentSubmitSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });

  const { orderId, utr, screenshotUrl } = parsed.data;

  await connect();

  const order = await Order.findById(orderId);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.status !== 'pending_payment')
    return NextResponse.json({ error: 'Payment already submitted or order is closed' }, { status: 400 });

  // Fraud: check duplicate UTR within the same store
  const duplicate = await Order.findOne({
    utr: utr.toUpperCase(),
    storeId: order.storeId,
    _id: { $ne: order._id },
  });
  if (duplicate)
    return NextResponse.json({ error: 'This UTR has already been used' }, { status: 409 });

  order.utr = utr.toUpperCase();
  order.screenshotUrl = screenshotUrl ?? undefined;
  order.status = 'payment_submitted';
  await order.save();

  return NextResponse.json({ ok: true, status: order.status, orderNumber: order.orderNumber });
}
