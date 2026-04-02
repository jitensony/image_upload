import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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

    const files = await fs.readdir(folderPath);
    const images = files
      .filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .map(file => ({
        filename: file,
        url: `/uploads/${sanitizedName}/${file}`
      }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}
