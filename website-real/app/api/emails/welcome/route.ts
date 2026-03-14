import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { hasUserEmailEvent, recordUserEmailEvent } from '@/lib/email/userEmailEvents';
import { sendTransactionalTemplate } from '@/lib/email/transactional';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ ok: false, error: 'Missing or invalid Authorization header' }, { status: 401 });
  }
  const token = auth.slice('Bearer '.length);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: async () => [],
        setAll: async (_cookiesToSet) => {},
      },
    }
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ ok: false, error: 'Invalid user' }, { status: 401 });
  }
  if (!user.email) {
    return NextResponse.json({ ok: false, error: 'User email missing' }, { status: 400 });
  }

  const alreadySent = await hasUserEmailEvent(user.id, 'welcome');
  if (alreadySent) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const result = await sendTransactionalTemplate({
    templateName: 'welcome',
    toEmail: user.email,
    mergeVars: {
      ACCOUNT_URL: `${process.env.APP_BASE_URL}/account`
    }
  });

  await recordUserEmailEvent(user.id, 'welcome');
  return NextResponse.json({ ok: true });
}
