import { NextRequest, NextResponse } from 'next/server';
import { getWebhookLogs } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || undefined;
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const vehicle = searchParams.get('vehicle') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const do_id = searchParams.get('do_id') ? parseInt(searchParams.get('do_id')!, 10) : undefined;

    const result = await getWebhookLogs({
      page,
      limit,
      search,
      type,
      status,
      vehicle,
      dateFrom,
      dateTo,
      do_id,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("GET /api/logs error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
