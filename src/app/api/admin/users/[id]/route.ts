import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const { is_active, role } = await req.json();

  if (is_active !== undefined) {
    await query('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
  }
  if (role) {
    await query("UPDATE users SET role = ? WHERE id = ? AND role != 'admin'", [role, id]);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  await query('DELETE FROM users WHERE id = ? AND role != ?', [id, 'admin']);

  return NextResponse.json({ success: true, message: 'User deleted' });
}
