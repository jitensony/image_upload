import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials mapping' }, { status: 400 });
    }

    // Leveraging the Admin Service Role Key natively bypasses EVERY Supabase Rate Limit & Email Verification wall!
    const { data: user, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-verifies the user instantly without sending confirmation emails
      user_metadata: { full_name: name, admin: false }
    });

    if (adminError) throw adminError;

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Admin Registration Bypass Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate user securely via Server bypass' }, { status: 500 });
  }
}
