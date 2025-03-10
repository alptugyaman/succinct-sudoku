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
 * Checks the status of a proof generation job (single request, no polling)
 */
export async function trackProofStatus(jobId: string, onStatusChange: (status: any) => void) {
    console.log('🔍 [Client] Checking proof status for job:', jobId);

    try {
        // Make a single request to check the proof status
        const response = await fetch(`${API_BASE_URL}/api/proof-status/${jobId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('❌ [Client] Proof status API error:', response.status, response.statusText);

            // For any error response, inform the user
            onStatusChange({
                status: 'processing',
                progress: 50,
                message: 'Still working on generating the proof...'
            });

            return;
        }

        const data = await response.json();
        console.log('📊 [Client] Proof status update:', data);

        // Determine if the proof is complete based on logs
        let isComplete = false;
        let progressInfo = { progress: 50, message: 'Generating proof...' };

        if (data.logs && Array.isArray(data.logs) && data.logs.length > 0) {
            // Check if we have vk verification: true in logs
            const hasVkVerification = data.logs.some((log: string) => log.includes('vk verification: true'));

            if (hasVkVerification) {
                progressInfo = {
                    progress: 100,
                    message: 'Proof generation completed! You can now download your proof.'
                };
                isComplete = true;
            } else {
                // Get the latest log entry to determine progress
                const latestLog = data.logs[data.logs.length - 1];

                if (latestLog.includes('generate_proof started')) {
                    progressInfo = { progress: 10, message: 'Proof generation started...' };
                } else if (latestLog.includes('Validating solution')) {
                    progressInfo = { progress: 20, message: 'Validating Sudoku solution...' };
                } else if (latestLog.includes('Creating ProverClient')) {
                    progressInfo = { progress: 30, message: 'Creating zero-knowledge prover...' };
                } else if (latestLog.includes('vk verification')) {
                    progressInfo = { progress: 40, message: 'Verifying verification key...' };
                } else if (latestLog.includes('Generating proof')) {
                    progressInfo = { progress: 60, message: 'Generating zero-knowledge proof...' };
                } else if (latestLog.includes('Verifying proof')) {
                    progressInfo = { progress: 80, message: 'Verifying generated proof...' };
                }
            }
        }

        // If the status is completed or success, or we've determined it's complete from logs
        if (data.status === 'completed' || data.status === 'success' || isComplete) {
            onStatusChange({
                status: 'completed',
                progress: 100,
                message: progressInfo.message,
                result: {
                    ...data,
                    proof_available: true
                },
                logs: data.logs
            });
        } else {
            // For any other status, show as processing
            onStatusChange({
                status: 'processing',
                progress: progressInfo.progress,
                message: progressInfo.message,
                originalStatus: data.status,
                logs: data.logs
            });
        }
    } catch (error) {
        console.error('❌ [Client] Error checking proof status:', error);

        // For any error, inform the user
        onStatusChange({
            status: 'processing',
            progress: 50,
            message: 'Still working on generating the proof...'
        });
    }

    // No need to return a close function since we're not polling
    return { close: () => { } };
} 