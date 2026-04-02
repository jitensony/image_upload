import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data: images, error } = await supabaseAdmin.from('images').select('company_name, created_at');
    if (error) throw error;
    
    // Aggregation matrices mapping structural groups seamlessly 
    const companyStats: Record<string, { count: number, lastUpdate: string }> = {};
    images?.forEach(img => {
      const company = img.company_name;
      if(!companyStats[company]) {
        companyStats[company] = { count: 1, lastUpdate: img.created_at };
      } else {
        companyStats[company].count += 1;
        if(new Date(img.created_at) > new Date(companyStats[company].lastUpdate)) {
          companyStats[company].lastUpdate = img.created_at;
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
    console.error('Supabase Postgres Read Error:', error);
    return NextResponse.json({ error: 'Failed to scrape Postgres aggregates via Serverless Functions' }, { status: 500 });
  }
}
