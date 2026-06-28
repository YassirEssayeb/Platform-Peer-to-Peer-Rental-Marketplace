import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const products = await query(
    `SELECT p.*, u.name as owner_name, u.city as owner_city, c.name as category_name, c.slug as category_slug,
     COALESCE((SELECT AVG(rating) FROM reviews WHERE reviewee_id = p.owner_id AND type = 'product'), 0) as avg_rating
     FROM products p
     JOIN users u ON p.owner_id = u.id
     JOIN categories c ON p.category_id = c.id
     WHERE p.status = 'approved'
     ORDER BY p.is_premium DESC, p.created_at DESC
     LIMIT 8`
  );
  return NextResponse.json({ products });
}
