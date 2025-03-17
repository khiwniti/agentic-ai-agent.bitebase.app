import { NextResponse } from 'next/server';
import { z } from 'zod';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const SCRAPING_API = `${API_BASE}/api/scraping-service`;

// Validation schema for query parameters
const queryParamsSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    format: z.enum(['json', 'csv']).optional(),
    fields: z.string().optional()
});

export async function GET(
    request: Request,
    { params }: { params: { jobId: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const validatedParams = queryParamsSchema.parse(Object.fromEntries(searchParams));

        const queryString = new URLSearchParams({
            page: validatedParams.page || '1',
            limit: validatedParams.limit || '100',
            format: validatedParams.format || 'json',
            fields: validatedParams.fields || '*'
        }).toString();

        const response = await fetch(
            `${SCRAPING_API}/results/${params.jobId}?${queryString}`
        );

        const result = await response.json();

        // Handle CSV format requests
        if (validatedParams.format === 'csv') {
            return new Response(result.csv_data, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="scraping-${params.jobId}.csv"`
                }
            });
        }

        // Return JSON response with pagination and metadata
        return NextResponse.json({
            jobId: params.jobId,
            data: result.data,
            metadata: {
                total_records: result.total_records,
                total_pages: result.total_pages,
                current_page: parseInt(validatedParams.page || '1'),
                records_per_page: parseInt(validatedParams.limit || '100'),
                quality_metrics: result.quality_metrics
            },
            summary: {
                unique_domains: result.summary.unique_domains,
                data_types: result.summary.data_types,
                completion_rate: result.summary.completion_rate
            },
            _links: {
                first: `/api/scraping/${params.jobId}/results?page=1`,
                last: `/api/scraping/${params.jobId}/results?page=${result.total_pages}`,
                next: result.has_next ? `/api/scraping/${params.jobId}/results?page=${parseInt(validatedParams.page || '1') + 1}` : undefined,
                previous: parseInt(validatedParams.page || '1') > 1 ? `/api/scraping/${params.jobId}/results?page=${parseInt(validatedParams.page || '1') - 1}` : undefined
            }
        });

    } catch (error) {
        console.error('Results fetch failed:', error);
        return NextResponse.json(
            { error: 'Failed to fetch results' },
            { status: 500 }
        );
    }
}

export async function HEAD(
    request: Request,
    { params }: { params: { jobId: string } }
) {
    try {
        const response = await fetch(
            `${SCRAPING_API}/results/${params.jobId}/metadata`
        );
        
        const result = await response.json();
        
        // Return only headers with metadata
        return new Response(null, {
            headers: {
                'X-Total-Records': result.total_records.toString(),
                'X-Total-Pages': result.total_pages.toString(),
                'X-Records-Per-Page': '100',
                'X-Last-Updated': result.last_updated,
                'X-Data-Format': 'json'
            }
        });

    } catch (error) {
        console.error('Results metadata fetch failed:', error);
        return new Response(null, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { jobId: string } }
) {
    try {
        const body = await request.json();
        
        // Forward the update request to the scraping service
        const response = await fetch(`${SCRAPING_API}/results/${params.jobId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...body,
                updated_at: new Date().toISOString()
            })
        });

        const result = await response.json();

        return NextResponse.json({
            jobId: params.jobId,
            status: 'updated',
            affected_records: result.affected_records,
            update_timestamp: result.update_timestamp
        });

    } catch (error) {
        console.error('Results update failed:', error);
        return NextResponse.json(
            { error: 'Failed to update results' },
            { status: 500 }
        );
    }
}
