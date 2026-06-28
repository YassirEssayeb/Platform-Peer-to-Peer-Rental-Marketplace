import { NextRequest, NextResponse } from 'next/server';
import { query, getRow } from '@/lib/db';
import { hashPassword, generateToken, JWTPayload } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role = 'renter', city } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const existing = await getRow('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const password_hash = hashPassword(password);

    const result = await query(
      'INSERT INTO users (name, email, password_hash, role, city) VALUES (?, ?, ?, ?, ?)',
      [name, email, password_hash, role, city || null]
    );

    const insertId = (result as any).insertId;

    const payload: JWTPayload = { id: insertId, email, role: role as any, name };
    const token = generateToken(payload);

    const response = NextResponse.json({
      user: { id: insertId, name, email, role, city: city || null, avatar: null, wallet_balance: 0 },
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
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
