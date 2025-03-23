import { SudokuGrid } from './sudoku';

// Harici backend API URL'i
// Eğer backend API farklı bir portta çalışıyorsa, bu değeri güncelleyin
// veya .env.local dosyasında NEXT_PUBLIC_API_URL değişkenini ayarlayın
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Validates a Sudoku solution
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
        const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes timeout

        // Prepare request body - correct data structure
        const requestBody = {
            board: processedInitialBoard,
            solution: processedSolution
        };

        console.log('Sending request with body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(`${API_BASE_URL}/validate-sudoku`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        // Clear the timeout
        clearTimeout(timeoutId);

        if (!response.ok) {
            // Try to extract detailed error message from response
            let errorDetail = '';
            try {
                const errorData = await response.json();
                errorDetail = errorData.message || errorData.error || JSON.stringify(errorData);
            } catch (e) {
                // If response is not JSON, just use status text
                errorDetail = response.statusText;
            }

            throw new Error(`Validate Sudoku API error: ${response.status} ${errorDetail}`);
        }

        const data = await response.json();

        // Check if validation was successful
        if (!data.is_valid) {
            throw new Error('Sudoku solution is not valid');
        }

        // Return the response data (it has the is_valid and proof_generated fields)
        return data;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('API request timed out. Please check your internet connection and try again later.');
        } else if (error instanceof Error && error.message && error.message.includes('Failed to fetch')) {
            throw new Error('Could not connect to the API server. Please ensure the backend API is running.');
        }

        throw error;
    }
} 