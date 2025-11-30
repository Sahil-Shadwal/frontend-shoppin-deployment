import { NextResponse } from 'next/server';

const DJANGO_BACKEND_URL = process.env.DJANGO_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || searchParams.get('category');

  if (!query) {
    return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${DJANGO_BACKEND_URL}/api/gallery/?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Map backend ScrapedImage to frontend Pin format
    const pins = data.images.map((img: any) => ({
      id: img.id,
      imageUrl: img.image_url,
      thumbnailUrl: img.thumbnail_url,
      title: img.caption || 'Pinterest Pin',
      sourceUrl: img.source_url || '#',
      query: img.query
    }));

    return NextResponse.json({ success: true, pins: pins });
  } catch (error) {
    console.error('Error fetching pins:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pins' }, { status: 500 });
  }
}
