import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const companyName = formData.get('companyName') as string;
    
    if (!companyName || companyName.trim() === '') {
      return NextResponse.json({ error: 'Company Name is required' }, { status: 400 });
    }

    const files = formData.getAll('images') as File[];
    
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    if (files.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 files allowed per batch' }, { status: 400 });
    }

    // Sanitize company name to safely use as a folder name
    const sanitizedCompanyName = companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Safely shift directory references into OS /tmp if deployed firmly on Serverless Vercel
    const os = require('os');
    const UPLOAD_BASE = process.env.VERCEL ? path.join(os.tmpdir(), 'stellr_uploads') : path.join(process.cwd(), 'public', 'uploads');
    const uploadDir = path.join(UPLOAD_BASE, sanitizedCompanyName);
    
    await fs.mkdir(uploadDir, { recursive: true });

    let savedCount = 0;

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) continue; // Skip files > 5MB on backend as safeguard
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const ext = path.extname(file.name) || (file.type.includes('png') ? '.png' : '.jpg');
      const baseName = path.basename(file.name, ext).replace(/[^a-z0-9_]/gi, '');
      const safeName = `${baseName}_${Date.now()}${ext}`;
      
      await fs.writeFile(path.join(uploadDir, safeName), buffer);
      savedCount++;
    }

    return NextResponse.json({ success: true, saved: savedCount });

  } catch (error: any) {
    console.error('Upload Error processing form data:', error);
    return NextResponse.json({ error: 'Server failed to process the request' }, { status: 500 });
  }
}
