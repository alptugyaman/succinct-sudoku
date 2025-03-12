import { SudokuGrid } from './sudoku';

// Harici backend API URL'i
// Eğer backend API farklı bir portta çalışıyorsa, bu değeri güncelleyin
// veya .env.local dosyasında NEXT_PUBLIC_API_URL değişkenini ayarlayın
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Generates a ZKP proof for a Sudoku solution
 */
export async function generateProof(initialBoard: SudokuGrid, solution: SudokuGrid) {
    try {
        // Convert null values to 0 before sending to the server
        const processedInitialBoard = initialBoard.map(row =>
            row.map(cell => cell === null ? 0 : cell)
        );

        const processedSolution = solution.map(row =>
            row.map(cell => cell === null ? 0 : cell)
        );

        // Set a timeout for the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

        // Prepare request body
        const requestBody = {
            initial_board: processedInitialBoard,
            solution: processedSolution
        };

        const response = await fetch(`${API_BASE_URL}/api/prove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        // Clear the timeout
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Prove API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.job_id; // Return the job ID
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('API isteği zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
        } else if (error instanceof Error && error.message && error.message.includes('Failed to fetch')) {
            throw new Error('API sunucusuna bağlanılamadı. Lütfen backend API\'nin çalıştığından emin olun.');
        }

        throw error;
    }
}

/**
 * Polls the status of a proof generation job
 */
export async function pollProofStatus(jobId: string) {
    if (!jobId) {
        throw new Error('Invalid job ID');
    }

    try {
        // Set a timeout for the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

        const response = await fetch(`${API_BASE_URL}/api/status/${jobId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal
        });

        // Clear the timeout
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Status API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('API isteği zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
        } else if (error instanceof Error && error.message && error.message.includes('Failed to fetch')) {
            throw new Error('API sunucusuna bağlanılamadı. Lütfen backend API\'nin çalıştığından emin olun.');
        }

        throw error;
    }
} 