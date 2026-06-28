export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Booking Conflict Detection Algorithm
 *
 * Prevents double-booking by checking if requested dates overlap
 * with any existing approved booking for the same product.
 *
 * Two date ranges [a1, a2] and [b1, b2] overlap if:
 *   a1 <= b2 AND b1 <= a2
 */
export function datesOverlap(
  requestedStart: string,
  requestedEnd: string,
  existingStart: string,
  existingEnd: string
): boolean {
  const rs = new Date(requestedStart);
  const re = new Date(requestedEnd);
  const es = new Date(existingStart);
  const ee = new Date(existingEnd);

  return rs <= ee && es <= re;
}

export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export function calculateCost(
  dailyPrice: number,
  weeklyPrice: number | null,
  startDate: string,
  endDate: string
): { totalDays: number; totalCost: number } {
  const totalDays = calculateDays(startDate, endDate);

  let totalCost = 0;
  if (weeklyPrice && totalDays >= 7) {
    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;
    totalCost = weeks * weeklyPrice + remainingDays * dailyPrice;
  } else {
    totalCost = totalDays * dailyPrice;
  }

  return { totalDays, totalCost };
}
