import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const products = await query(
    `SELECT p.*, u.name as owner_name, u.email as owner_email, c.name as category_name
     FROM products p
     JOIN users u ON p.owner_id = u.id
     JOIN categories c ON p.category_id = c.id
     ORDER BY p.created_at DESC`
  );

  return NextResponse.json({ products });
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id, status, is_premium } = await req.json();

  if (status) {
    await query("UPDATE products SET status = ? WHERE id = ?", [status, id]);
  }
  if (is_premium !== undefined) {
    await query('UPDATE products SET is_premium = ? WHERE id = ?', [is_premium ? 1 : 0, id]);
  }

  return NextResponse.json({ success: true });
}
