import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Simulated proof generation steps
const proofSteps = [
    { progress: 0.1, message: 'Setting up the proving system...' },
    { progress: 0.2, message: 'Generating the constraint system...' },
    { progress: 0.3, message: 'Encoding the Sudoku constraints...' },
    { progress: 0.4, message: 'Generating random values...' },
    { progress: 0.5, message: 'Computing the witness...' },
    { progress: 0.6, message: 'Generating the proof...' },
    { progress: 0.7, message: 'Verifying the proof...' },
    { progress: 0.8, message: 'Finalizing the proof...' },
    { progress: 0.9, message: 'Preparing the result...' },
    { progress: 1.0, message: 'Proof generation complete!' }
];

// In-memory store for proof jobs
const proofJobs = new Map();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        let { initial_board, solution } = body;

        // Convert any null values to 0
        if (initial_board) {
            initial_board = initial_board.map((row: (number | null)[]) =>
                row.map((cell: number | null) => cell === null ? 0 : cell)
            );
        }

        if (solution) {
            solution = solution.map((row: (number | null)[]) =>
                row.map((cell: number | null) => cell === null ? 0 : cell)
            );
        }

        // Generate a unique job ID
        const jobId = uuidv4();

        // Store the job with initial status
        proofJobs.set(jobId, {
            status: 'processing',
            progress: 0,
            message: 'Initializing proof generation...',
            startTime: Date.now(),
            initial_board,
            solution
        });

        // Simulate proof generation with progress updates
        simulateProofGeneration(jobId);

        // Return the job ID immediately
        return NextResponse.json({ job_id: jobId });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to start proof generation' },
            { status: 500 }
        );
    }
}

// Simulate proof generation process
function simulateProofGeneration(jobId: string) {
    const job = proofJobs.get(jobId);
    if (!job) return;

    let currentStep = 0;

    const interval = setInterval(() => {
        if (currentStep < proofSteps.length) {
            const step = proofSteps[currentStep];

            // Update job status
            job.progress = step.progress;
            job.message = step.message;

            currentStep++;
        } else {
            // Proof generation complete
            clearInterval(interval);

            // Generate a fake proof hash
            const hash = Array.from({ length: 32 }, () =>
                Math.floor(Math.random() * 16).toString(16)
            ).join('');

            // Update job status
            job.status = 'complete';
            job.progress = 1;
            job.message = 'Proof generation complete!';
            job.result = {
                hash,
                proof_file: `proof_${jobId}.json`,
                download_url: `/api/proofs/${jobId}/download`
            };
        }
    }, 1000); // Update every second
}

// Export the proofJobs map for use in other routes
export { proofJobs }; 