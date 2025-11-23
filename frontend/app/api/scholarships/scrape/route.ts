import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Simulate scraping delay (in production, this would be actual scraping)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // TODO: In production, use actual web scraper (cheerio/puppeteer) to extract:
    // - Scholarship name/title
    // - Description
    // - Deadline
    // - Requirements
    // - Amount information
    // For now, create a placeholder scholarship
    
    const hostname = parsedUrl.hostname;
    const scrapedScholarship = await prisma.scholarship.create({
      data: {
        name: `Scholarship from ${hostname}`,
        description: `This scholarship was scraped from ${url}. In production, this would contain the actual scraped content including requirements, deadlines, and criteria. Please update the details manually.`,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        sourceUrl: url,
        isPreloaded: false,
        source: 'manual_scrape',
      },
    });

    return NextResponse.json({ 
      scholarshipId: scrapedScholarship.id, 
      scholarship: scrapedScholarship 
    });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape scholarship', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

