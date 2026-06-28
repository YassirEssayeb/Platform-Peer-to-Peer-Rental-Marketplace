import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const users = await query(
    `SELECT id, name, email, role, city, wallet_balance, is_active, created_at,
     (SELECT COUNT(*) FROM products WHERE owner_id = users.id) as product_count,
     (SELECT COUNT(*) FROM bookings WHERE renter_id = users.id OR owner_id = users.id) as booking_count
     FROM users ORDER BY created_at DESC`
  );

  return NextResponse.json({ users });
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id, is_active, role } = await req.json();

  if (is_active !== undefined) {
    await query('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
  }
  if (role) {
    await query("UPDATE users SET role = ? WHERE id = ? AND role != 'admin'", [role, id]);
  }

  return NextResponse.json({ success: true });
}
