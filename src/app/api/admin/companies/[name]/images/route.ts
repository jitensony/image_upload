import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);
    
    // Perform exact relational queries targeting specific client datasets deeply embedded in PostgreSQL
    const { data: images, error } = await supabaseAdmin.from('images')
      .select('*')
      .eq('company_name', decodedName);
      
    if (error) throw error;
    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'Postgres sequence unmatched. Null images acquired.' }, { status: 404 });
    }

    const mappedImages = images.map(img => ({
      filename: img.file_name,
      url: img.file_url,
      id: img.id
    }));

    return NextResponse.json({ images: mappedImages });
  } catch (error) {
    console.error('Supabase Deep Details Error:', error);
    return NextResponse.json({ error: 'Interlink failure reading detailed object datasets' }, { status: 500 });
  }
}
