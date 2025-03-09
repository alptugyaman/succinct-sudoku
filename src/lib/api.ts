import { SudokuGrid } from './sudoku';

// Harici backend API URL'i
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Verifies a Sudoku solution by sending it to the server
 */
export async function verifySudoku(initialBoard: SudokuGrid, solution: SudokuGrid) {
    console.log('🔍 [Client] Calling verify API with:', { initialBoard, solution });
    try {
        const response = await fetch(`${API_BASE_URL}/api/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                initial_board: initialBoard,
                solution: solution
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
        const response = await fetch(`${API_BASE_URL}/api/prove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                initial_board: initialBoard,
                solution: solution
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
    const maxRetries = 3;

    const checkStatus = async () => {
        if (!isActive) return;

        try {
            console.log('🔄 [Client] Checking proof status for job:', jobId);
            const response = await fetch(`${API_BASE_URL}/api/proof/${jobId}`);

            if (!response.ok) {
                console.error('❌ [Client] Proof status API error:', response.status, response.statusText);

                // If we get a 404, retry a few times before giving up
                // This helps with race conditions where the job might not be saved yet
                if (response.status === 404 && retryCount < maxRetries) {
                    retryCount++;
                    console.log(`⏱️ [Client] Job not found, retrying (${retryCount}/${maxRetries})...`);
                    setTimeout(checkStatus, 1000); // Wait a second before retrying
                    return;
                }

                onStatusChange({
                    status: 'failed',
                    error: `API error: ${response.status} ${response.statusText}`
                });
                return;
            }

            // Reset retry count on successful response
            retryCount = 0;

            const data = await response.json();
            console.log('📊 [Client] Proof status update:', data);

            onStatusChange(data);

            // Continue polling if the job is still in progress
            if (data.status === 'processing' || data.status === 'pending') {
                setTimeout(checkStatus, 1000); // Poll every second
            } else {
                console.log('🏁 [Client] Proof tracking completed with status:', data.status);
            }
        } catch (error) {
            console.error('❌ [Client] Error checking proof status:', error);

            // Retry on network errors
            if (retryCount < maxRetries) {
                retryCount++;
                console.log(`⏱️ [Client] Network error, retrying (${retryCount}/${maxRetries})...`);
                setTimeout(checkStatus, 1000);
                return;
            }

            onStatusChange({
                status: 'failed',
                error: 'Failed to check proof status'
            });
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