// Store active proof jobs - use a global variable to ensure persistence between requests
// In a production environment, this should be replaced with a database or Redis
const globalThis: any = global;

// Define the job type
export type ProofJob = {
    status: 'pending' | 'processing' | 'complete' | 'failed';
    progress: number;
    step: string;
    result?: any;
    error?: string;
    startTime: number;
    proofId?: string;
};

// Initialize the store if it doesn't exist
globalThis.proofJobsStore = globalThis.proofJobsStore || new Map<string, ProofJob>();

// Export the proofJobs map so it can be accessed by route handlers
export const proofJobs = globalThis.proofJobsStore; 