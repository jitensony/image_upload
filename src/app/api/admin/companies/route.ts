import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const imagesRef = adminDb.collection('images');
    const snapshot = await imagesRef.get();
    
    // Dynamically aggregate metrics locally via Firestore active snapshot arrays
    const companyStats: Record<string, { count: number, lastUpdate: string }> = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const company = data.companyName;
      if(!companyStats[company]) {
        companyStats[company] = { count: 1, lastUpdate: data.uploadedAt };
      } else {
        companyStats[company].count += 1;
        if(new Date(data.uploadedAt) > new Date(companyStats[company].lastUpdate)) {
          companyStats[company].lastUpdate = data.uploadedAt;
        }
      }
    });

    const formattedCompanies = Object.keys(companyStats).map(name => ({
      name,
      fileCount: companyStats[name].count,
      lastModified: companyStats[name].lastUpdate
    }));

    return NextResponse.json({ companies: formattedCompanies });
  } catch (error) {
    console.error('Firebase Firestore Read Error:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}
