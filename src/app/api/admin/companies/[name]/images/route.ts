import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);
    
    // Explicitly query Cloud Firestore locating specifically linked images
    const snapshot = await adminDb.collection('images')
      .where('companyName', '==', decodedName)
      .get();
      
    if (snapshot.empty) {
      return NextResponse.json({ error: 'Company not found or has no images' }, { status: 404 });
    }

    const images = snapshot.docs.map(doc => ({
      filename: doc.data().fileName,
      url: doc.data().url,
      id: doc.id
    }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Firebase Get Images Error:', error);
    return NextResponse.json({ error: 'Failed to fetch company images' }, { status: 500 });
  }
}
