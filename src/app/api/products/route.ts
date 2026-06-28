import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const city = searchParams.get('city');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;
  const premium = searchParams.get('premium');

  let sql = `SELECT p.*, u.name as owner_name, u.city as owner_city, c.name as category_name, c.slug as category_slug,
             (SELECT AVG(rating) FROM reviews WHERE reviewee_id = p.owner_id AND type = 'product') as avg_rating,
             (SELECT COUNT(*) FROM reviews WHERE reviewee_id = p.owner_id AND type = 'product') as review_count
             FROM products p
             JOIN users u ON p.owner_id = u.id
             JOIN categories c ON p.category_id = c.id
             WHERE p.status = 'approved'`;

  const params: any[] = [];

  if (category) {
    sql += ' AND c.slug = ?';
    params.push(category);
  }
  if (city) {
    sql += ' AND (p.city LIKE ? OR u.city LIKE ?)';
    params.push(`%${city}%`, `%${city}%`);
  }
  if (minPrice) {
    sql += ' AND p.daily_price >= ?';
    params.push(parseFloat(minPrice));
  }
  if (maxPrice) {
    sql += ' AND p.daily_price <= ?';
    params.push(parseFloat(maxPrice));
  }
  if (search) {
    sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (premium === 'true') {
    sql += ' AND p.is_premium = 1';
  }

  const countResult = await query(
    `SELECT COUNT(*) as total FROM products p JOIN categories c ON p.category_id = c.id WHERE p.status = 'approved'` +
    (category ? ' AND c.slug = ?' : '') +
    (city ? ' AND p.city LIKE ?' : '') +
    (minPrice ? ' AND p.daily_price >= ?' : '') +
    (maxPrice ? ' AND p.daily_price <= ?' : '') +
    (search ? ' AND (p.name LIKE ? OR p.description LIKE ?)' : '') +
    (premium === 'true' ? ' AND p.is_premium = 1' : ''),
    (() => {
      const cp: any[] = [];
      if (category) cp.push(category);
      if (city) cp.push(`%${city}%`);
      if (minPrice) cp.push(parseFloat(minPrice));
      if (maxPrice) cp.push(parseFloat(maxPrice));
      if (search) { cp.push(`%${search}%`); cp.push(`%${search}%`); }
      return cp;
    })()
  );
  const total = (countResult as any[])[0]?.total || 0;

  switch (sort) {
    case 'price_asc': sql += ' ORDER BY p.daily_price ASC'; break;
    case 'price_desc': sql += ' ORDER BY p.daily_price DESC'; break;
    case 'rating': sql += ' ORDER BY avg_rating DESC'; break;
    default: sql += ' ORDER BY p.created_at DESC';
  }

  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const products = await query(sql, params);

  return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'owner') {
    return NextResponse.json({ error: 'Only owners can create listings' }, { status: 403 });
  }

  const { name, description, category_id, daily_price, weekly_price, security_deposit, city, images } = await req.json();

  if (!name || !daily_price || !category_id || !city) {
    return NextResponse.json({ error: 'Name, daily price, category, and city are required' }, { status: 400 });
  }

  const result = await query(
    `INSERT INTO products (owner_id, category_id, name, description, daily_price, weekly_price, security_deposit, city, images, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [auth.id, category_id, name, description, daily_price, weekly_price || null, security_deposit || 0, city, images ? JSON.stringify(images) : null]
  );

  const insertId = (result as any).insertId;

  return NextResponse.json({ success: true, productId: insertId, message: 'Product submitted for approval' });
}
