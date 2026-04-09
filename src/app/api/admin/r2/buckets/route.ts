import { NextResponse } from 'next/server';
import { STORAGE_BUCKETS } from '@/constants/storage-buckets';

export async function GET() {
  return NextResponse.json({
    code: 0,
    data: {
      items: STORAGE_BUCKETS.map((b) => ({ name: b.name, title: b.title, description: b.description }))
    }
  });
}

