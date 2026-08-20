import { NextRequest, NextResponse } from 'next/server';
import { getWebhookLogById } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const log = await getWebhookLogById(id);

    if (!log) {
      return NextResponse.json(
        { success: false, error: 'Log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: log,
    });
  } catch (err) {
    console.error("GET /api/logs/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch log details" },
      { status: 500 }
    );
  }
}
