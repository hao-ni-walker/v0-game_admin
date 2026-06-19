import { NextRequest } from 'next/server';
import { successResponse } from '@/service/response';

export async function POST(_request: NextRequest) {
  return successResponse([]);
}
