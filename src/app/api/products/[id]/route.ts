import { NextRequest, NextResponse } from 'next/server';
import { query, getRow } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await getRow(
    `SELECT p.*, u.name as owner_name, u.email as owner_email, u.city as owner_city, u.avatar as owner_avatar,
     c.name as category_name, c.slug as category_slug,
     COALESCE((SELECT AVG(rating) FROM reviews WHERE reviewee_id = p.owner_id AND type = 'product'), 0) as avg_rating,
     COALESCE((SELECT COUNT(*) FROM reviews WHERE reviewee_id = p.owner_id AND type = 'product'), 0) as review_count
     FROM products p
     JOIN users u ON p.owner_id = u.id
     JOIN categories c ON p.category_id = c.id
     WHERE p.id = ?`,
    [id]
  );

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const reviews = await query(
    `SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar
     FROM reviews r JOIN users u ON r.reviewer_id = u.id
     WHERE r.reviewee_id = ? AND r.type = 'product'
     ORDER BY r.created_at DESC LIMIT 10`,
    [(product as any).owner_id]
  );

  return NextResponse.json({ product, reviews });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const product = await getRow('SELECT * FROM products WHERE id = ?', [id]);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  if ((product as any).owner_id !== auth.id && auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, description, daily_price, weekly_price, security_deposit, city, images } = await req.json();

  await query(
    `UPDATE products SET name = ?, description = ?, daily_price = ?, weekly_price = ?, security_deposit = ?, city = ?, images = ? WHERE id = ?`,
    [name, description, daily_price, weekly_price, security_deposit, city, images ? JSON.stringify(images) : null, id]
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const product = await getRow('SELECT * FROM products WHERE id = ?', [id]);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  if ((product as any).owner_id !== auth.id && auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await query('DELETE FROM products WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
