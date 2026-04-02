import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const os = require('os');
    const uploadsDir = process.env.VERCEL ? path.join(os.tmpdir(), 'stellr_uploads') : path.join(process.cwd(), 'public', 'uploads');
    
    
    // Check if the overall uploads directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      // If the directory hasn't even been generated yet, just return an empty array gracefully
      return NextResponse.json({ companies: [] });
    }

    const folders = await fs.readdir(uploadsDir, { withFileTypes: true });
    
    const companies = await Promise.all(
      folders
        .filter(dirent => dirent.isDirectory())
        .map(async (dirent) => {
          const folderPath = path.join(uploadsDir, dirent.name);
          const stat = await fs.stat(folderPath);
          const files = await fs.readdir(folderPath);
          const images = files.filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i));
          
          return {
            name: dirent.name,
            imageCount: images.length,
            createdAt: stat.birthtime // Date created logic mapped to disk folder birthtime
          };
        })
    );

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Error fetching backend company folders:', error);
    return NextResponse.json({ error: 'Failed to fetch companies metadata' }, { status: 500 });
  }
}
