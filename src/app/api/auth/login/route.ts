import { NextRequest, NextResponse } from 'next/server';
import { query, getRow } from '@/lib/db';
import { comparePassword, generateToken, JWTPayload } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await getRow('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    if (!user || !comparePassword(password, (user as any).password_hash)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const payload: JWTPayload = {
      id: (user as any).id,
      email: (user as any).email,
      role: (user as any).role,
      name: (user as any).name,
    };

    const token = generateToken(payload);

    const response = NextResponse.json({
      user: {
        id: (user as any).id,
        name: (user as any).name,
        email: (user as any).email,
        role: (user as any).role,
        city: (user as any).city,
        avatar: (user as any).avatar,
        wallet_balance: (user as any).wallet_balance,
      },
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
