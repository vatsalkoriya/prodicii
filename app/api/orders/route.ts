import { NextResponse } from 'next/server';
import { connect } from '../../../lib/mongodb';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import Customer from '../../../models/Customer';
import { orderCreateSchema } from '../../../lib/validators';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = orderCreateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });

  await connect();

  // Resolve products and calculate server-side total (prevents price tampering)
  const productItems: { productId: any; qty: number; price: number; name: string }[] = [];
  let serverTotal = 0;

  for (const item of parsed.data.products) {
    const prod = await Product.findById(item.productId);
    if (!prod || !prod.isActive)
      return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
    if (String(prod.storeId) !== parsed.data.storeId)
      return NextResponse.json({ error: 'Product does not belong to this store' }, { status: 400 });
    if (prod.inventory !== undefined && prod.inventory < item.qty)
      return NextResponse.json({ error: `Insufficient inventory for: ${prod.name}` }, { status: 400 });

    productItems.push({ productId: prod._id, qty: item.qty, price: prod.price, name: prod.name });
    serverTotal += prod.price * item.qty;
  }

  // Create or upsert customer
  let customerId: any = undefined;
  let customerSnapshot: any = undefined;
  if (parsed.data.customer) {
    const c = parsed.data.customer;
    customerSnapshot = c;
    // Upsert by phone or email within the store
    const filter: any = { storeId: parsed.data.storeId };
    if (c.email) filter.email = c.email;
    else if (c.phone) filter.phone = c.phone;
    else filter.name = c.name;

    const customer = await Customer.findOneAndUpdate(
      filter,
      { $set: { name: c.name, email: c.email, phone: c.phone, storeId: parsed.data.storeId } },
      { upsert: true, new: true }
    );
    customerId = customer._id;
  }

  // Deduct inventory
  for (const item of productItems) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { inventory: -item.qty } });
  }

  const ipAddress =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const order = await Order.create({
    storeId: parsed.data.storeId,
    products: productItems,
    totalAmount: serverTotal,
    status: 'pending_payment',
    customer: customerId,
    customerSnapshot,
    shippingAddress: parsed.data.shippingAddress,
    ipAddress,
  });

  return NextResponse.json({ ok: true, orderId: order._id, orderNumber: order.orderNumber, totalAmount: serverTotal }, { status: 201 });
}
