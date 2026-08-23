import { NextResponse, type NextRequest } from 'next/server';
import { createPrivilegedClient } from '@/lib/supabase/privileged';

const visitorCookieName = 'blog_visitor_id';
const visitorCookieLifetime = 60 * 60 * 24 * 365;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const requestOrigin = request.headers.get('origin');

  if (requestOrigin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { slug } = await params;

  if (slug.length > 160 || !slugPattern.test(slug)) {
    return NextResponse.json({ error: 'Invalid post slug' }, { status: 400 });
  }

  const existingVisitorId = request.cookies.get(visitorCookieName)?.value;
  const visitorId =
    existingVisitorId && uuidPattern.test(existingVisitorId)
      ? existingVisitorId
      : crypto.randomUUID();

  try {
    const visitorHash = await createVisitorHash(slug, visitorId);
    const supabase = createPrivilegedClient();
    const { data: viewCount, error } = await supabase.rpc('record_post_view', {
      p_post_slug: slug,
      p_visitor_hash: visitorHash,
    });

    if (error) {
      console.error('Unable to record post view:', error.message);
      return NextResponse.json(
        { error: 'Unable to record post view' },
        { status: 500 },
      );
    }

    if (viewCount === null) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const response = NextResponse.json(
      { viewCount },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );

    if (existingVisitorId !== visitorId) {
      response.cookies.set(visitorCookieName, visitorId, {
        httpOnly: true,
        maxAge: visitorCookieLifetime,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return response;
  } catch (error) {
    console.error(
      'Unable to initialize post view tracking:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return NextResponse.json(
      { error: 'View tracking is unavailable' },
      { status: 503 },
    );
  }
}

async function createVisitorHash(slug: string, visitorId: string) {
  const value = new TextEncoder().encode(`${slug}:${visitorId}`);
  const digest = await crypto.subtle.digest('SHA-256', value);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}
