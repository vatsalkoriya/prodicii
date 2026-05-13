import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connect } from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { registerSchema } from '../../../../lib/validators';
import { signToken } from '../../../../lib/auth';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });

  await connect();
  const existing = await User.findOne({ email: body.email });
  if (existing)
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

  const hashed = await bcrypt.hash(body.password, 12);
  const user = await User.create({ email: body.email, password: hashed });

  // Auto-sign in after registration
  const token = signToken({ userId: user._id.toString(), email: user.email });
  return NextResponse.json({ ok: true, token, userId: user._id }, { status: 201 });
}
