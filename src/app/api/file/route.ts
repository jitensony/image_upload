import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const company = url.searchParams.get('company');
  const file = url.searchParams.get('file');

  if (!company || !file) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const sanitizedCompany = company.replace(/[^a-z0-9_]/gi, '');
  const sanitizedFile = file.replace(/[^a-z0-9_.]/gi, '');
  
  const UPLOAD_BASE = process.env.VERCEL ? path.join(os.tmpdir(), 'stellr_uploads') : path.join(process.cwd(), 'public', 'uploads');
  const filePath = path.join(UPLOAD_BASE, sanitizedCompany, sanitizedFile);

  try {
    const fileBuffer = await fs.readFile(filePath);
    
    // Guess native MIME type dynamically
    let mimeType = 'image/jpeg';
    if (sanitizedFile.endsWith('.png')) mimeType = 'image/png';
    else if (sanitizedFile.endsWith('.gif')) mimeType = 'image/gif';
    else if (sanitizedFile.endsWith('.webp')) mimeType = 'image/webp';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'File not found on active storage' }, { status: 404 });
  }
}
