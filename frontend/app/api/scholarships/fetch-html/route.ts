import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST - Fetch HTML content from URLs (proxy endpoint to avoid CORS)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'At least one URL is required' },
        { status: 400 }
      );
    }

    // Validate URLs
    for (const url of urls) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { error: `Invalid URL format: ${url}` },
          { status: 400 }
        );
      }
    }

    // Fetch HTML from all URLs with timeout
    const htmlContents: { url: string; html: string; error?: string }[] = [];

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          htmlContents.push({
            url,
            html: '',
            error: `HTTP ${response.status}: ${response.statusText}`,
          });
          continue;
        }

        const html = await response.text();
        htmlContents.push({
          url,
          html: html.substring(0, 100000), // Limit to 100KB per page
        });
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        if (error instanceof Error && error.name === 'AbortError') {
          htmlContents.push({
            url,
            html: '',
            error: 'Request timeout (30s)',
          });
        } else {
          htmlContents.push({
            url,
            html: '',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    // Combine all HTML content
    const combinedHtml = htmlContents
      .map((item, index) => {
        if (item.error) {
          return `<!-- URL ${index + 1}: ${item.url} - ERROR: ${item.error} -->`;
        }
        return `<!-- URL ${index + 1}: ${item.url} -->\n${item.html}`;
      })
      .join('\n\n<!-- ========== PAGE SEPARATOR ========== -->\n\n');

    return NextResponse.json({
      success: true,
      htmlContent: combinedHtml,
      results: htmlContents.map(item => ({
        url: item.url,
        success: !item.error,
        error: item.error,
        size: item.html.length,
      })),
    });
  } catch (error) {
    console.error('HTML fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch HTML content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

