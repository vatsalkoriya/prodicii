import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connect } from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { loginSchema } from '../../../../lib/validators';
import { signToken } from '../../../../lib/auth';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });

  await connect();
  const user = await User.findOne({ email: body.email }).select('+password');
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const ok = await bcrypt.compare(body.password, user.password);
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = signToken({ userId: user._id.toString(), email: user.email });
  return NextResponse.json({ ok: true, token });
}
