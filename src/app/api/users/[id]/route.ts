import { NextRequest, NextResponse } from 'next/server';
import { query, getRow } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getRow(
    `SELECT id, name, email, role, city, avatar, created_at,
     (SELECT AVG(rating) FROM reviews WHERE reviewee_id = users.id) as avg_rating,
     (SELECT COUNT(*) FROM reviews WHERE reviewee_id = users.id) as review_count
     FROM users WHERE id = ? AND is_active = 1`,
    [id]
  );

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const productCount = await query('SELECT COUNT(*) as count FROM products WHERE owner_id = ?', [id]);

  return NextResponse.json({
    user,
    productCount: (productCount as any[])[0]?.count || 0,
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  if (parseInt(id) !== auth.id && auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, city, phone, avatar } = await req.json();

  await query('UPDATE users SET name = ?, city = ?, phone = ?, avatar = ? WHERE id = ?',
    [name, city, phone, avatar, id]);

  return NextResponse.json({ success: true });
}
