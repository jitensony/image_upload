import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(request: Request, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const sanitizedName = name.replace(/[^a-z0-9_]/gi, '');
    const os = require('os');
    const UPLOAD_BASE = process.env.VERCEL ? path.join(os.tmpdir(), 'stellr_uploads') : path.join(process.cwd(), 'public', 'uploads');
    const folderPath = path.join(UPLOAD_BASE, sanitizedName);

    try {
      await fs.access(folderPath);
    } catch {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Delete folder and all contents entirely
    await fs.rm(folderPath, { recursive: true, force: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}
