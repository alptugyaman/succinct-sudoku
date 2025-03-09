import { SudokuGrid } from './sudoku';

// Harici backend API URL'i
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Verifies a Sudoku solution by sending it to the server
 */
export async function verifySudoku(initialBoard: SudokuGrid, solution: SudokuGrid) {
    console.log('🔍 [Client] Calling verify API with:', { initialBoard, solution });
    try {
        // Convert null values to 0 before sending to the server
        const processedInitialBoard = initialBoard.map(row =>
            row.map(cell => cell === null ? 0 : cell)
        );

        const processedSolution = solution.map(row =>
            row.map(cell => cell === null ? 0 : cell)
        );

        const response = await fetch(`${API_BASE_URL}/api/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                initial_board: processedInitialBoard,
                solution: processedSolution
            }),
        });

        if (!response.ok) {
            console.error('❌ [Client] Verify API error:', response.status, response.statusText);
            throw new Error(`Verify API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ [Client] Verify API response:', data);
        return data;
    } catch (error) {
        console.error('❌ [Client] Error calling verify API:', error);
        throw error;
    }
}

/**
 * Generates a ZKP proof for a Sudoku solution
 */
export async function generateProof(initialBoard: SudokuGrid, solution: SudokuGrid) {
    console.log('🔍 [Client] Calling prove API with:', { initialBoard, solution });
    try {
        // Convert null values to 0 before sending to the server
        const processedInitialBoard = initialBoard.map(row =>
            row.map(cell => cell === null ? 0 : cell)
        );

        const processedSolution = solution.map(row =>
            row.map(cell => cell === null ? 0 : cell)
        );

        const response = await fetch(`${API_BASE_URL}/api/prove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                initial_board: processedInitialBoard,
                solution: processedSolution
            }),
        });

        if (!response.ok) {
            console.error('❌ [Client] Prove API error:', response.status, response.statusText);
            throw new Error(`Prove API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ [Client] Prove API response:', data);
        return data.job_id; // Return the job ID
    } catch (error) {
        console.error('❌ [Client] Error calling prove API:', error);
        throw error;
    }
}

/**
 * Tracks the status of a proof generation job using polling
 */
export function trackProofStatus(jobId: string, onStatusChange: (status: any) => void) {
    console.log('🔍 [Client] Starting to track proof status for job:', jobId);
    let isActive = true;
    let retryCount = 0;
    let totalPollingTime = 0;

    // Polling configuration
    const pollingInterval = 10000; // 10 seconds
    const maxTimeout = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Progress mapping for different stages
    const progressStages = {
        'started': { progress: 10, message: 'Proof generation started...' },
        'validating': { progress: 20, message: 'Validating Sudoku solution...' },
        'creating_prover': { progress: 30, message: 'Creating zero-knowledge prover...' },
        'vk_verification': { progress: 40, message: 'Verifying verification key...' },
        'generating_proof': { progress: 60, message: 'Generating zero-knowledge proof...' },
        'verifying_proof': { progress: 80, message: 'Verifying generated proof...' },
        'completed': { progress: 100, message: 'Proof generation completed!' },
        'success': { progress: 100, message: 'Proof verified successfully!' },
    };

    // Parse log message to determine stage
    const determineStage = (log: string): { progress: number, message: string } => {
        if (log.includes('generate_proof started')) return progressStages['started'];
        if (log.includes('Validating solution')) return progressStages['validating'];
        if (log.includes('Creating ProverClient')) return progressStages['creating_prover'];
        if (log.includes('vk verification')) return progressStages['vk_verification'];
        if (log.includes('Generating proof')) return progressStages['generating_proof'];
        if (log.includes('Verifying proof')) return progressStages['verifying_proof'];

        // Default progress if we can't determine the stage
        return { progress: 50, message: 'Processing your proof...' };
    };

    const checkStatus = async () => {
        if (!isActive) return;

        // Check if we've exceeded the maximum timeout
        if (totalPollingTime >= maxTimeout) {
            console.log('⏱️ [Client] Maximum polling time reached (5 minutes)');
            onStatusChange({
                status: 'processing',
                progress: 70, // Show substantial progress even if it's taking long
                message: 'Still working on generating the proof. This may take longer than expected.'
            });
            isActive = false;
            return;
        }

        try {
            console.log('🔄 [Client] Checking proof status for job:', jobId);
            const response = await fetch(`${API_BASE_URL}/api/proof/${jobId}`);

            if (!response.ok) {
                console.error('❌ [Client] Proof status API error:', response.status, response.statusText);

                // For any error response, inform the user that processing is still ongoing
                // and continue polling until timeout
                onStatusChange({
                    status: 'processing',
                    progress: 50, // Show 50% progress to indicate we're still working
                    message: 'Still working on generating the proof...'
                });

                // Continue polling regardless of error status
                totalPollingTime += pollingInterval;
                setTimeout(checkStatus, pollingInterval);
                return;
            }

            // Reset retry count on successful response
            retryCount = 0;

            const data = await response.json();
            console.log('📊 [Client] Proof status update:', data);

            // Only pass completed or successful statuses to the UI
            // For any other status, show as processing
            if (data.status === 'completed' || data.status === 'success') {
                onStatusChange({
                    ...data,
                    progress: 100,
                    message: data.status === 'completed'
                        ? 'Proof generation completed!'
                        : 'Proof verified successfully!'
                });
                console.log('🏁 [Client] Proof tracking completed with status:', data.status);
                isActive = false;
            } else {
                // Determine progress stage from logs if available
                let progressInfo = { progress: 50, message: 'Generating proof...' };

                if (data.logs && Array.isArray(data.logs) && data.logs.length > 0) {
                    // Get the latest log entry
                    const latestLog = data.logs[data.logs.length - 1];
                    progressInfo = determineStage(latestLog);
                }

                // For any other status, show as processing and continue polling
                onStatusChange({
                    status: 'processing',
                    progress: progressInfo.progress,
                    message: progressInfo.message,
                    originalStatus: data.status, // Keep original status for debugging
                    logs: data.logs // Pass logs for debugging
                });

                totalPollingTime += pollingInterval;
                setTimeout(checkStatus, pollingInterval);
            }
        } catch (error) {
            console.error('❌ [Client] Error checking proof status:', error);

            // For any error, inform the user that processing is still ongoing
            onStatusChange({
                status: 'processing',
                progress: 50, // Show 50% progress to indicate we're still working
                message: 'Still working on generating the proof...'
            });

            // Continue polling regardless of error
            totalPollingTime += pollingInterval;
            setTimeout(checkStatus, pollingInterval);
        }
    };

    // Start polling
    checkStatus();

    // Return a function to stop polling
    return {
        close: () => {
            console.log('⏹️ [Client] Stopping proof status tracking for job:', jobId);
            isActive = false;
        }
    };
} 