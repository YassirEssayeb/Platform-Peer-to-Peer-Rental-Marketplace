import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const { status, is_premium } = await req.json();

  if (status) {
    await query("UPDATE products SET status = ? WHERE id = ?", [status, id]);
  }
  if (is_premium !== undefined) {
    await query('UPDATE products SET is_premium = ? WHERE id = ?', [is_premium ? 1 : 0, id]);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  await query('DELETE FROM products WHERE id = ?', [id]);

  return NextResponse.json({ success: true, message: 'Product deleted' });
}
