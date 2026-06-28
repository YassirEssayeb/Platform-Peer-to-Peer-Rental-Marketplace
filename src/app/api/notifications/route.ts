import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    [auth.id]
  );

  const unreadCount = await query(
    `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
    [auth.id]
  );

  return NextResponse.json({
    notifications,
    unreadCount: (unreadCount as any[])[0]?.count || 0,
  });
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();

  if (id) {
    await query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, auth.id]);
  } else {
    await query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [auth.id]);
  }

  return NextResponse.json({ success: true });
}
