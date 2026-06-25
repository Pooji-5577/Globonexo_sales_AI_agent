import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const settingsUrl = new URL('/settings', request.url);

  if (error) {
    settingsUrl.searchParams.set('gmail', 'denied');
    return NextResponse.redirect(settingsUrl);
  }

  if (!code) {
    settingsUrl.searchParams.set('gmail', 'missing_code');
    return NextResponse.redirect(settingsUrl);
  }

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiBase}/gmail/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('cookie') || '',
      },
      body: JSON.stringify({ code }),
    });

    settingsUrl.searchParams.set('gmail', response.ok ? 'connected' : 'error');
  } catch {
    settingsUrl.searchParams.set('gmail', 'error');
  }

  return NextResponse.redirect(settingsUrl);
}
