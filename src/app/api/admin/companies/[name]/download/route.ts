import { NextResponse } from 'next/server';
import path from 'path';
import archiver from 'archiver';
import { promises as fs } from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const sanitizedName = name.replace(/[^a-z0-9_]/gi, '');
    const folderPath = path.join(process.cwd(), 'public', 'uploads', sanitizedName);

    try {
      await fs.access(folderPath);
    } catch {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    
    // Convert Node stream to Web Stream natively for Next.js Response body
    const { PassThrough } = require('stream');
    const passThrough = new PassThrough();
    
    // Convert standard node readable stream into web-compliant ReadableStream
    const readableWebStream = new ReadableStream({
      start(controller) {
        passThrough.on('data', (chunk) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        passThrough.on('end', () => {
          controller.close();
        });
        passThrough.on('error', (err) => {
          controller.error(err);
        });
      }
    });

    archive.pipe(passThrough);
    archive.directory(folderPath, false); // bundle entirety of company folder
    archive.finalize();

    return new NextResponse(readableWebStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${sanitizedName}_images.zip"`,
      },
    });

  } catch (error) {
    console.error('Error generating ZIP:', error);
    return NextResponse.json({ error: 'Failed to generate archive' }, { status: 500 });
  }
}
