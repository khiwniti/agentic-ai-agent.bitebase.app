import { NextResponse } from 'next/server';
import { z } from 'zod';

// API endpoints
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const SCRAPING_API = `${API_BASE}/api/scraping-service`;

// Validation schemas
const selectorSchema = z.record(z.string());

const targetSchema = z.object({
    url: z.string().url(),
    selectors: selectorSchema,
    required_fields: z.array(z.string()),
    pagination: z.object({
        next_button: z.string(),
        max_pages: z.number().optional()
    }).optional(),
    dynamic_loading: z.boolean().optional(),
    authentication: z.object({
        type: z.string(),
        credentials: z.record(z.string())
    }).optional()
});

const scrapingRequestSchema = z.object({
    targets: z.array(targetSchema),
    bypass_methods: z.array(z.string()).optional(),
    rate_limit: z.object({
        requests_per_second: z.number()
    }).optional(),
    proxy_config: z.object({
        enabled: z.boolean().optional(),
        rotation_interval: z.number().optional(),
        max_retries: z.number().optional()
    }).optional()
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = scrapingRequestSchema.parse(body);

        // Send scraping request
        const response = await fetch(SCRAPING_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                request: validatedData,
                metadata: {
                    client_id: request.headers.get('x-client-id'),
                    session_id: request.headers.get('x-session-id'),
                    timestamp: new Date().toISOString()
                }
            })
        });

        const result = await response.json();

        return NextResponse.json({
            jobId: result.job_id,
            status: result.status,
            initialResults: result.initial_results,
            estimatedTime: result.estimated_time,
            targetCount: validatedData.targets.length,
            metadata: {
                bypass_methods: result.active_bypass_methods,
                proxy_enabled: result.proxy_status.enabled,
                rate_limit: result.rate_limit
            }
        });

    } catch (error) {
        console.error('Scraping request failed:', error);
        return NextResponse.json(
            { error: 'Failed to process scraping request' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
        return NextResponse.json(
            { error: 'Job ID is required' },
            { status: 400 }
        );
    }

    try {
        // Fetch job status
        const response = await fetch(`${SCRAPING_API}/status/${jobId}`);
        const result = await response.json();

        return NextResponse.json({
            jobId,
            status: result.status,
            progress: {
                completed_targets: result.completed_targets,
                total_targets: result.total_targets,
                success_rate: result.success_rate,
                errors: result.errors
            },
            results: result.status === 'completed' ? result.data : undefined,
            performance: {
                execution_time: result.execution_time,
                bypass_effectiveness: result.bypass_stats,
                data_quality: result.quality_metrics
            },
            _links: {
                self: `/api/scraping?jobId=${jobId}`,
                results: result.status === 'completed' ? `/api/scraping/${jobId}/results` : undefined,
                logs: `/api/scraping/${jobId}/logs`
            }
        });

    } catch (error) {
        console.error('Job status fetch failed:', error);
        return NextResponse.json(
            { error: 'Failed to fetch job status' },
            { status: 500 }
        );
    }
}

// Route for fetching specific job results
export async function GET_RESULTS(
    request: Request,
    { params }: { params: { jobId: string } }
) {
    try {
        const response = await fetch(`${SCRAPING_API}/results/${params.jobId}`);
        const result = await response.json();

        return NextResponse.json({
            jobId: params.jobId,
            results: result.data,
            metadata: {
                completed_at: result.completed_at,
                data_points: result.total_data_points,
                quality_score: result.quality_score
            },
            performance: {
                execution_time: result.execution_time,
                resource_usage: result.resource_usage
            }
        });

    } catch (error) {
        console.error('Results fetch failed:', error);
        return NextResponse.json(
            { error: 'Failed to fetch job results' },
            { status: 500 }
        );
    }
}

// Route for fetching job logs
export async function GET_LOGS(
    request: Request,
    { params }: { params: { jobId: string } }
) {
    try {
        const response = await fetch(`${SCRAPING_API}/logs/${params.jobId}`);
        const result = await response.json();

        return NextResponse.json({
            jobId: params.jobId,
            logs: result.logs.map((log: any) => ({
                timestamp: log.timestamp,
                level: log.level,
                message: log.message,
                context: log.context,
                target_url: log.target_url
            })),
            summary: {
                error_count: result.error_count,
                warning_count: result.warning_count,
                bypass_events: result.bypass_events
            }
        });

    } catch (error) {
        console.error('Logs fetch failed:', error);
        return NextResponse.json(
            { error: 'Failed to fetch job logs' },
            { status: 500 }
        );
    }
}
