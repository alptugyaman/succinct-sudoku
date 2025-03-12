import { NextRequest, NextResponse } from 'next/server';
import { proofJobs } from '../../prove/route';

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
    const jobId = params.jobId;

    // Check if the job exists
    if (!proofJobs.has(jobId)) {
        return NextResponse.json(
            { error: 'Job not found' },
            { status: 404 }
        );
    }

    // Get the job data
    const job = proofJobs.get(jobId);

    // Return the job status
    return NextResponse.json({
        status: job.status,
        progress: job.progress,
        message: job.message,
        result: job.result || null
    });
} 