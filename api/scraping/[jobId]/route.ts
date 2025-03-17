import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const SCRAPING_API = `${API_BASE}/api/scraping-service`;

export async function GET(
    request: Request,
    { params }: { params: { jobId: string } }
) {
    try {
        const [statusResponse, resultsResponse, logsResponse] = await Promise.all([
            fetch(`${SCRAPING_API}/status/${params.jobId}`),
            fetch(`${SCRAPING_API}/results/${params.jobId}`),
            fetch(`${SCRAPING_API}/logs/${params.jobId}`)
        ]);

        const [status, results, logs] = await Promise.all([
            statusResponse.json(),
            resultsResponse.json(),
            logsResponse.json()
        ]);

        return NextResponse.json({
            jobId: params.jobId,
            status: status.status,
            progress: {
                completed_targets: status.completed_targets,
                total_targets: status.total_targets,
                success_rate: status.success_rate
            },
            results: status.status === 'completed' ? {
                data_points: results.total_data_points,
                quality_score: results.quality_score,
                sample_data: results.data.slice(0, 5) // First 5 items as preview
            } : undefined,
            performance: {
                execution_time: status.execution_time,
                bypass_effectiveness: status.bypass_stats,
                resource_usage: status.resource_usage
            },
            error_summary: {
                error_count: logs.error_count,
                warning_count: logs.warning_count,
                recent_errors: logs.logs
                    .filter((log: any) => log.level === 'error')
                    .slice(0, 5)
            },
            _links: {
                results: `/api/scraping/${params.jobId}/results`,
                logs: `/api/scraping/${params.jobId}/logs`,
                cancel: `/api/scraping/${params.jobId}/cancel`
            }
        });

    } catch (error) {
        console.error('Job details fetch failed:', error);
        return NextResponse.json(
            { error: 'Failed to fetch job details' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { jobId: string } }
) {
    try {
        const response = await fetch(`${SCRAPING_API}/jobs/${params.jobId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        return NextResponse.json({
            jobId: params.jobId,
            status: 'cancelled',
            cancellation_time: new Date().toISOString(),
            cleanup_status: result.cleanup_status,
            resources_freed: result.resources_freed
        });

    } catch (error) {
        console.error('Job cancellation failed:', error);
        return NextResponse.json(
            { error: 'Failed to cancel job' },
            { status: 500 }
        );
    }
}
