import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    // Filter precise URLs from PostgreSQL directly
    const { data: images, error } = await supabaseAdmin.from('images')
      .select('file_name, file_url')
      .eq('company_name', decodedName);
      
    if (error || !images || images.length === 0) {
      return NextResponse.json({ error: 'Archive query failed mapping postgres references completely blank' }, { status: 404 });
    }

    const archive = archiver('zip', { zlib: { level: 5 } });
    const passThrough = new PassThrough();

    // Fire robust fetching functions processing binary array structures piped inherently
    (async () => {
      for (const img of images) {
        try {
          const res = await fetch(img.file_url);
          const arrayBuffer = await res.arrayBuffer();
          archive.append(Buffer.from(arrayBuffer), { name: img.file_name });
        } catch(e) { 
          console.error('Buffer streaming intercept exception:', e); 
        }
      }
      archive.finalize();
    })();

    const readableWebStream = new ReadableStream({
      start(controller) {
        passThrough.on('data', chunk => controller.enqueue(new Uint8Array(chunk)));
        passThrough.on('end', () => controller.close());
        passThrough.on('error', err => controller.error(err));
      }
    });

    archive.pipe(passThrough);

    return new NextResponse(readableWebStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${decodedName}_archive.zip"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed validating buffer generation natively in API pipeline.' }, { status: 500 });
  }
}
