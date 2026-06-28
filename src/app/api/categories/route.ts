import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const categories = await query('SELECT * FROM categories ORDER BY name ASC');
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { name, slug, icon } = await req.json();
  await query('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)', [name, slug, icon]);
  return NextResponse.json({ success: true });
}
