import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { adminStorage } from '@/lib/firebase-admin';

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    // Query active specific file buffer sequences strictly from active Google Cloud Servers
    const [files] = await adminStorage.getFiles({ prefix: `companies/${decodedName}/` });
    
    if (files.length === 0) {
      return NextResponse.json({ error: 'Company essentially empty on Firebase' }, { status: 404 });
    }

    const archive = archiver('zip', { zlib: { level: 5 } });
    const passThrough = new PassThrough();

    archive.on('error', (err) => {
      console.error('Archiver internal breakdown mapping:', err);
    });

    files.forEach((file) => {
      // Isolate strict native filename bypassing deep structural paths
      const fileName = file.name.split('/').pop() || 'unknown.jpg';
      
      // Feed Google Cloud remote bucket chunks natively downstream
      const readStream = file.createReadStream();
      archive.append(readStream as any, { name: fileName });
    });

    archive.finalize();

    const readableWebStream = new ReadableStream({
      start(controller) {
        passThrough.on('data', (chunk: any) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        passThrough.on('end', () => {
          controller.close();
        });
        passThrough.on('error', (err: any) => {
          controller.error(err);
        });
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
    return NextResponse.json({ error: 'Failed to reconstruct native Google remote ZIP' }, { status: 500 });
  }
}
