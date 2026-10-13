import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // Allow up to 5 minutes on Vercel Pro

export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Verify secret if set
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const METABASE_CSV_URL =
    "https://metabase.kaip.in/api/public/card/9ba58a6c-92b1-436d-840f-fbb724c3ef24/query/csv";

  try {
    const res = await fetch(METABASE_CSV_URL, {
      headers: {
        "User-Agent": "CreativeEngineCron/1.0",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Metabase returned status ${res.status}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Sync initiated successfully. Streamed from Metabase.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Metabase cron sync error:", error);
    return NextResponse.json(
      { error: "Internal server error during sync" },
      { status: 500 }
    );
  }
}
