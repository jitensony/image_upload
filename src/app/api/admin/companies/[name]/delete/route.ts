import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';

export async function DELETE(request: Request, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    // 1. Destroy explicitly tracked Firestore Document Metadata configurations systematically avoiding orphans
    const snapshot = await adminDb.collection('images')
      .where('companyName', '==', decodedName)
      .get();

    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // 2. Obliterate corresponding Google Storage Bucket elements utilizing native Prefix targeting
    await adminStorage.deleteFiles({ prefix: `companies/${decodedName}/` });

    return NextResponse.json({ message: 'Company radically permanently erased from Firebase Ecosystem' });
  } catch (error) {
    console.error('Firebase Wipe Error:', error);
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}
