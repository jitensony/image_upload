import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE(request: Request, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    // 1. Storage Wipes require absolute filename extractions logically inside Supabase bounds
    const { data: filesData, error: listError } = await supabaseAdmin.storage
      .from('companies')
      .list(decodedName, { limit: 10000 });
      
    if (listError) throw listError;
    
    if (filesData && filesData.length > 0) {
      const pathsToDelete = filesData.map(f => `${decodedName}/${f.name}`);
      const { error: removeError } = await supabaseAdmin.storage
        .from('companies')
        .remove(pathsToDelete);
      if (removeError) throw removeError;
    }

    // 2. Cascade deletion hooks logically into PostgreSQL mappings directly targeting target column vectors
    const { error: dbError } = await supabaseAdmin.from('images')
      .delete()
      .eq('company_name', decodedName);
      
    if (dbError) throw dbError;

    return NextResponse.json({ message: 'Relational data structures completely dropped.' });
  } catch (error) {
    console.error('Supabase Drop Operation Protocol Error:', error);
    return NextResponse.json({ error: 'Supabase Data wipe failure.' }, { status: 500 });
  }
}
