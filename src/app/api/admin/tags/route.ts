import { NextResponse } from 'next/server';
import { findOrCreateTag } from '@/lib/tagUtils';

// Create new tag (with 90%+ similarity reuse)
export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    const result = await findOrCreateTag(name.trim(), 90);

    if (result.isReused) {
      return NextResponse.json({
        id: result.id,
        name: result.name,
        reused: true,
        message: `Similar tag "${result.name}" already exists and was returned instead`
      }, { status: 200 });
    }

    return NextResponse.json({
      id: result.id,
      name: result.name,
      reused: false
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
