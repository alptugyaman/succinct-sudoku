import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';
import { proofJobs } from '@/lib/proof-store';

// Next.js 15 route handler format
export async function GET(
    request: Request,
    { params }: { params: Promise<{ jobId: string }> }
) {
    const { jobId } = await params;
    console.log('🔍 [API] Proof status endpoint called for job ID:', jobId);

    console.log('📋 [API] All active jobs:', Array.from(proofJobs.keys()));

    const job = proofJobs.get(jobId);

    if (!job) {
        console.log('❌ [API] Job not found:', jobId);
        return NextResponse.json(
            { status: 'not_found', error: 'Proof job not found' },
            { status: 404 }
        );
    }

    console.log('📊 [API] Current job status:', job.status, 'progress:', job.progress);

    // If the job is pending, start processing
    if (job.status === 'pending') {
        job.status = 'processing';
        job.step = 'Generating circuit...';
        job.progress = 0.1;

        console.log('🚀 [API] Starting proof generation simulation for job:', jobId);
        // Simulate proof generation progress
        simulateProofProgress(jobId);
    }

    return NextResponse.json(job);
}

// Simulate proof generation progress
async function simulateProofProgress(jobId: string) {
    const job = proofJobs.get(jobId);
    if (!job) return;

    const steps = [
        { progress: 0.2, step: 'Generating witness...' },
        { progress: 0.3, step: 'Computing constraints...' },
        { progress: 0.5, step: 'Generating proof...' },
        { progress: 0.7, step: 'Verifying proof...' },
        { progress: 0.9, step: 'Finalizing proof...' },
        { progress: 1.0, step: 'Proof generation complete!' }
    ];

    let currentStep = 0;

    const interval = setInterval(async () => {
        const job = proofJobs.get(jobId);
        if (!job || job.status !== 'processing') {
            console.log('⏹️ [API] Stopping proof simulation for job:', jobId);
            clearInterval(interval);
            return;
        }

        if (currentStep < steps.length) {
            const { progress, step } = steps[currentStep];
            job.progress = progress;
            job.step = step;
            console.log(`📈 [API] Job ${jobId} progress: ${progress * 100}%, step: ${step}`);
            currentStep++;
        } else {
            // Complete the job
            job.status = 'complete';
            job.progress = 1.0;

            try {
                // Generate a proof file
                const proofId = job.proofId;
                const proofFileName = `proof-${proofId}.proof`;
                const assetsDir = path.join(process.cwd(), 'public', 'assets');
                const proofFilePath = path.join(assetsDir, proofFileName);

                console.log('📝 [API] Generating proof file:', proofFileName);

                // Ensure the assets directory exists
                try {
                    await mkdir(assetsDir, { recursive: true });
                    console.log('📁 [API] Created assets directory:', assetsDir);
                } catch (error) {
                    // Ignore if directory already exists
                    console.log('📁 [API] Assets directory already exists or error:', error);
                }

                // Create a dummy proof file with some content
                const proofContent = JSON.stringify({
                    id: proofId,
                    timestamp: Date.now(),
                    job_id: jobId,
                    proof_data: {
                        // Simulated proof data
                        pi_a: [Math.random().toString(36), Math.random().toString(36), Math.random().toString(36)],
                        pi_b: [[Math.random().toString(36), Math.random().toString(36)], [Math.random().toString(36), Math.random().toString(36)], [Math.random().toString(36), Math.random().toString(36)]],
                        pi_c: [Math.random().toString(36), Math.random().toString(36), Math.random().toString(36)],
                        protocol: "groth16",
                        curve: "bn128"
                    }
                }, null, 2);

                // Write the proof file
                await writeFile(proofFilePath, proofContent);
                console.log('✅ [API] Proof file generated successfully:', proofFilePath);

                // Set the result with the proof file URL
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003';
                job.result = {
                    hash: `zkp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
                    proof_file: `/assets/${proofFileName}`,
                    download_url: `${baseUrl}/assets/${proofFileName}`
                };
                console.log('🏁 [API] Job completed successfully:', job.result);
            } catch (error) {
                console.error('❌ [API] Error generating proof file:', error);
                job.status = 'failed';
                job.error = 'Failed to generate proof file';
            }

            clearInterval(interval);
        }

        // Update the job in the map
        proofJobs.set(jobId, job);
    }, 2000); // Update every 2 seconds
} 