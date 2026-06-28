import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const conversations = await query(
    `SELECT
       CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as other_user_id,
       CASE WHEN m.sender_id = ? THEN receiver.name ELSE sender.name END as other_user_name,
       MAX(m.created_at) as last_message_time,
       (SELECT m2.message FROM messages m2 WHERE (m2.sender_id = ? OR m2.receiver_id = ?) AND (m2.sender_id = m.sender_id OR m2.receiver_id = m.sender_id) ORDER BY m2.created_at DESC LIMIT 1) as last_message,
       SUM(CASE WHEN m.receiver_id = ? AND m.is_read = 0 THEN 1 ELSE 0 END) as unread_count
     FROM messages m
     JOIN users sender ON m.sender_id = sender.id
     JOIN users receiver ON m.receiver_id = receiver.id
     WHERE m.sender_id = ? OR m.receiver_id = ?
     GROUP BY other_user_id, other_user_name
     ORDER BY last_message_time DESC`,
    [auth.id, auth.id, auth.id, auth.id, auth.id, auth.id, auth.id]
  );

  return NextResponse.json({ conversations });
}
