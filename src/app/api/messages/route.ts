import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const productId = searchParams.get('productId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const messages = await query(
    `SELECT m.*, sender.name as sender_name, receiver.name as receiver_name
     FROM messages m
     JOIN users sender ON m.sender_id = sender.id
     JOIN users receiver ON m.receiver_id = receiver.id
     WHERE (m.sender_id = ? AND m.receiver_id = ?)
        OR (m.sender_id = ? AND m.receiver_id = ?)
     ${productId ? 'AND (m.product_id = ? OR m.product_id IS NULL)' : ''}
     ORDER BY m.created_at ASC`,
    productId
      ? [auth.id, userId, userId, auth.id, productId]
      : [auth.id, userId, userId, auth.id]
  );

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { receiver_id, product_id, message } = await req.json();

  if (!receiver_id || !message) {
    return NextResponse.json({ error: 'Receiver and message are required' }, { status: 400 });
  }

  await query(
    'INSERT INTO messages (sender_id, receiver_id, product_id, message) VALUES (?, ?, ?, ?)',
    [auth.id, receiver_id, product_id || null, message]
  );

  return NextResponse.json({ success: true });
}
