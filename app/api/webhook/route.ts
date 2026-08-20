import { NextRequest, NextResponse } from 'next/server';
import { H2HDOReplySchema } from '@/lib/schemas';
import { saveWebhookLog } from '@/lib/db';

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();

  // 1. Optional Secret Validation
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && secret.trim() !== '') {
    const reqSecret = req.headers.get('x-webhook-secret');
    if (reqSecret !== secret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized. Invalid webhook secret token.',
          timestamp,
        },
        { status: 401 }
      );
    }
  }

  // 2. Parse JSON body
  let rawBody: any;
  try {
    rawBody = await req.json();
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid JSON payload',
        timestamp,
      },
      { status: 400 }
    );
  }

  // 3. Schema Passthrough Validation
  const validation = H2HDOReplySchema.safeParse(rawBody);
  if (!validation.success) {
    // If Zod validation fails, we still accept raw body as per requirement ("Payload asli wajib tetap disimpan")
    // but log warning.
    console.warn("Zod validation warning:", validation.error.flatten());
  }

  const payload = rawBody;

  // 4. Save to Database / Persistence
  try {
    await saveWebhookLog(payload);
  } catch (err) {
    console.error("Error saving webhook payload:", err);
    // Don't fail the webhook response if DB save has transient error
  }

  // 5. Fast JSON Response
  return NextResponse.json({
    success: true,
    received: true,
    timestamp,
  });
}
