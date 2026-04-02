import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { company_name, file_name, file_url, created_at } = await request.json();

    if (!company_name || !file_name || !file_url) {
      return NextResponse.json({ error: 'Missing metadata parameters' }, { status: 400 });
    }

    // Utilizing the Admin Service Role Key natively bypasses EVERY Row-Level Security policy!
    const { error: dbError } = await supabaseAdmin
      .from('images')
      .insert([{ company_name, file_name, file_url, created_at }]);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin Bypass Synchronization Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to map row natively via Server bypass' }, { status: 500 });
  }
}
