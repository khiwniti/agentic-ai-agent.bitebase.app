import { NextResponse } from 'next/server';
import { z } from 'zod';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const SCRAPING_API = `${API_BASE}/api/scraping-service`;

// Validation schema for cancellation request
const cancellationRequestSchema = z.object({
    reason: z.string().optional(),
    force: z.boolean().optional(),
    cleanup_resources: z.boolean().optional()
});

export async function POST(
    request: Request,
    { params }: { params: { jobId: string } }
) {
    try {
        const body = await request.json();
        const validatedData = cancellationRequestSchema.parse(body);

        // Initiate cancellation
        const response = await fetch(`${SCRAPING_API}/jobs/${params.jobId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...validatedData,
                timestamp: new Date().toISOString()
            })
        });

        const result = await response.json();

        // Check if cleanup is needed
        if (validatedData.cleanup_resources) {
            await fetch(`${SCRAPING_API}/jobs/${params.jobId}/cleanup`, {
                method: 'POST'
            });
        }

        return NextResponse.json({
            jobId: params.jobId,
            status: 'cancelled',
            cancellation_details: {
                timestamp: result.cancellation_time,
                reason: validatedData.reason || 'user_requested',
                forced: validatedData.force || false
            },
            cleanup_status: {
                resources_freed: result.resources_freed,
                connections_closed: result.connections_closed,
                storage_cleared: result.storage_cleared
            },
            performance_impact: {
                affected_tasks: result.affected_tasks,
                resource_recovery: result.resource_recovery,
                system_health: result.system_health
            }
        });

    } catch (error) {
        console.error('Job cancellation failed:', error);
        return NextResponse.json(
            { error: 'Failed to cancel job' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: { jobId: string } }
) {
    try {
        // Check cancellation status
        const response = await fetch(
            `${SCRAPING_API}/jobs/${params.jobId}/cancel/status`
        );
        
        const result = await response.json();

        return NextResponse.json({
            jobId: params.jobId,
            cancellation_status: result.status,
            progress: {
                tasks_terminated: result.terminated_tasks,
                resources_freed: result.freed_resources,
                pending_operations: result.pending_ops
            },
            estimated_completion: result.estimated_completion,
            system_status: {
                resource_availability: result.resource_status,
                system_load: result.system_load,
                queue_status: result.queue_status
            }
        });

    } catch (error) {
        console.error('Cancellation status check failed:', error);
        return NextResponse.json(
            { error: 'Failed to check cancellation status' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { jobId: string } }
) {
    try {
        // Force immediate cancellation and cleanup
        const response = await fetch(`${SCRAPING_API}/jobs/${params.jobId}`, {
            method: 'DELETE',
            headers: {
                'X-Force-Cancel': 'true',
                'X-Cleanup': 'true'
            }
        });

        const result = await response.json();

        return NextResponse.json({
            jobId: params.jobId,
            status: 'terminated',
            termination_details: {
                timestamp: new Date().toISOString(),
                method: 'force_delete',
                cleanup_performed: true
            },
            system_impact: {
                resources_recovered: result.recovered_resources,
                performance_restoration: result.performance_impact,
                system_stability: result.stability_status
            }
        });

    } catch (error) {
        console.error('Force termination failed:', error);
        return NextResponse.json(
            { error: 'Failed to force terminate job' },
            { status: 500 }
        );
    }
}
