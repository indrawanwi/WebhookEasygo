import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db';

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    console.error("GET /api/stats error:", err);
    return NextResponse.json({
      success: true,
      data: {
        totalMessages: 0,
        totalDO: 0,
        activeAlarms: 0,
        completedDO: 0,
        messagesToday: 0,
      },
    });
  }
}
