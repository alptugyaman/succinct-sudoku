import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { proofJobs } from '@/lib/proof-store';

export async function POST(request: Request) {
    console.log('🔍 [API] Prove endpoint called');
    try {
        const body = await request.json();
        console.log('📥 [API] Prove request body:', body);
        const { initial_board, solution } = body;

        // Generate a unique job ID
        const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        // Generate a unique proof ID (UUID)
        const proofId = uuidv4();
        console.log('🆔 [API] Generated job ID:', jobId);
        console.log('🆔 [API] Generated proof ID:', proofId);

        // Store the job with initial status
        proofJobs.set(jobId, {
            status: 'pending',
            progress: 0,
            step: 'Initializing proof generation...',
            startTime: Date.now(),
            proofId
        });

        // Debug: Log all active jobs after adding the new one
        console.log('📋 [API] All active jobs after adding new job:', Array.from(proofJobs.keys()));

        // Return the job ID immediately
        return NextResponse.json({ job_id: jobId });
    } catch (error) {
        console.error('❌ [API] Error starting proof generation:', error);
        return NextResponse.json(
            { error: 'Failed to start proof generation' },
            { status: 500 }
        );
    }
} 