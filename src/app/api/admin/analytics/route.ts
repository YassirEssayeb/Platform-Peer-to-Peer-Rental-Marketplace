import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const totalUsers = await query('SELECT COUNT(*) as count FROM users');
  const totalProducts = await query('SELECT COUNT(*) as count FROM products');
  const approvedProducts = await query("SELECT COUNT(*) as count FROM products WHERE status = 'approved'");
  const pendingProducts = await query("SELECT COUNT(*) as count FROM products WHERE status = 'pending'");
  const totalBookings = await query('SELECT COUNT(*) as count FROM bookings');
  const completedBookings = await query("SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'");
  const totalRevenue = await query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE type = 'commission' AND status = 'completed'");
  const bookingRevenue = await query("SELECT COALESCE(SUM(total_cost), 0) as total FROM bookings WHERE status = 'completed'");

  const bookingsByMonth = await query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count, SUM(total_cost) as revenue
     FROM bookings GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month DESC LIMIT 12`
  );

  const topProducts = await query(
    `SELECT p.id, p.name, COUNT(b.id) as rental_count, SUM(b.total_cost) as revenue
     FROM products p
     JOIN bookings b ON p.id = b.product_id
     WHERE b.status = 'completed'
     GROUP BY p.id, p.name
     ORDER BY rental_count DESC LIMIT 10`
  );

  const usersByRole = await query(
    "SELECT role, COUNT(*) as count FROM users GROUP BY role"
  );

  return NextResponse.json({
    stats: {
      totalUsers: (totalUsers as any[])[0]?.count || 0,
      totalProducts: (totalProducts as any[])[0]?.count || 0,
      approvedProducts: (approvedProducts as any[])[0]?.count || 0,
      pendingProducts: (pendingProducts as any[])[0]?.count || 0,
      totalBookings: (totalBookings as any[])[0]?.count || 0,
      completedBookings: (completedBookings as any[])[0]?.count || 0,
      totalRevenue: parseFloat((totalRevenue as any[])[0]?.total || '0'),
      bookingRevenue: parseFloat((bookingRevenue as any[])[0]?.total || '0'),
    },
    bookingsByMonth,
    topProducts,
    usersByRole,
  });
}
