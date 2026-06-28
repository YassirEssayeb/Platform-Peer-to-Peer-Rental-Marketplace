import { NextRequest, NextResponse } from 'next/server';
import { query, getRow } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const type = searchParams.get('type') || 'product';

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const reviews = await query(
    `SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar
     FROM reviews r
     JOIN users u ON r.reviewer_id = u.id
     WHERE r.reviewee_id = ? AND r.type = ?
     ORDER BY r.created_at DESC`,
    [userId, type]
  );

  const stats = await getRow(
    `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
     FROM reviews WHERE reviewee_id = ? AND type = ?`,
    [userId, type]
  );

  return NextResponse.json({ reviews, stats });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { booking_id, rating, comment, type } = await req.json();

  if (!booking_id || !rating || !type) {
    return NextResponse.json({ error: 'Booking, rating, and type are required' }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
  }

  const booking = await getRow('SELECT * FROM bookings WHERE id = ?', [booking_id]);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  const b = booking as any;
  if (b.status !== 'completed') {
    return NextResponse.json({ error: 'Can only review completed rentals' }, { status: 400 });
  }

  const existing = await getRow(
    'SELECT id FROM reviews WHERE booking_id = ? AND reviewer_id = ? AND type = ?',
    [booking_id, auth.id, type]
  );
  if (existing) {
    return NextResponse.json({ error: 'You already submitted a review for this booking' }, { status: 409 });
  }

  const revieweeId = type === 'product' ? b.owner_id : b.renter_id;

  await query(
    'INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, rating, comment, type) VALUES (?, ?, ?, ?, ?, ?)',
    [booking_id, auth.id, revieweeId, rating, comment || null, type]
  );

  return NextResponse.json({ success: true, message: 'Review submitted' });
}
