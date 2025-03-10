import { SudokuGrid } from './sudoku';

// Harici backend API URL'i
// Eğer backend API farklı bir portta çalışıyorsa, bu değeri güncelleyin
// veya .env.local dosyasında NEXT_PUBLIC_API_URL değişkenini ayarlayın
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

console.log('🌐 [Client] Using API URL:', API_BASE_URL);

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

        // Set a timeout for the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

        const response = await fetch(`${API_BASE_URL}/api/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                initial_board: processedInitialBoard,
                solution: processedSolution
            }),
            signal: controller.signal
        });

        // Clear the timeout
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error('❌ [Client] Verify API error:', response.status, response.statusText);
            throw new Error(`Verify API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ [Client] Verify API response:', data);
        return data;
    } catch (error: unknown) {
        console.error('❌ [Client] Error calling verify API:', error);

        // Daha açıklayıcı hata mesajları
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('API isteği zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
        } else if (error instanceof Error && error.message && error.message.includes('Failed to fetch')) {
            throw new Error('API sunucusuna bağlanılamadı. Lütfen backend API\'nin çalıştığından emin olun.');
        }

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

        // Set a timeout for the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

        const response = await fetch(`${API_BASE_URL}/api/prove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                initial_board: processedInitialBoard,
                solution: processedSolution
            }),
            signal: controller.signal
        });

        // Clear the timeout
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error('❌ [Client] Prove API error:', response.status, response.statusText);
            throw new Error(`Prove API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ [Client] Prove API response:', data);
        return data.job_id; // Return the job ID
    } catch (error: unknown) {
        console.error('❌ [Client] Error calling prove API:', error);

        // Daha açıklayıcı hata mesajları
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('API isteği zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
        } else if (error instanceof Error && error.message && error.message.includes('Failed to fetch')) {
            throw new Error('API sunucusuna bağlanılamadı. Lütfen backend API\'nin çalıştığından emin olun.');
        }

        throw error;
    }
}

/**
 * Checks the status of a proof generation job (single request, no polling)
 */
export async function trackProofStatus(jobId: string, onStatusChange: (status: any) => void) {
    console.log('🔍 [Client] Checking proof status for job:', jobId);

    try {
        // Set a timeout for the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

        // Make a single request to check the proof status
        const response = await fetch(`${API_BASE_URL}/api/proof-status/${jobId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal
        });

        // Clear the timeout
        clearTimeout(timeoutId);

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
    } catch (error: unknown) {
        console.error('❌ [Client] Error checking proof status:', error);

        // For any error, inform the user
        onStatusChange({
            status: 'processing',
            progress: 50,
            message: error instanceof Error && error.name === 'AbortError'
                ? 'Connection timeout. Still working on generating the proof...'
                : 'Still working on generating the proof...'
        });
    }

    // No need to return a close function since we're not polling
    return { close: () => { } };
}

/**
 * Connects to the WebSocket endpoint to stream logs for a proof job
 */
export function connectToLogStream(jobId: string, onLogReceived: (log: string) => void, onError?: (error: any) => void) {
    console.log('🔌 [Client] Connecting to log stream for job:', jobId);

    // Create WebSocket connection
    // Extract host and port from API_BASE_URL
    let wsUrl = '';
    try {
        // Parse the API_BASE_URL to get host and port
        const apiUrl = new URL(API_BASE_URL);
        // Determine WebSocket protocol (ws or wss)
        const wsProtocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
        // Construct WebSocket URL
        wsUrl = `${wsProtocol}//${apiUrl.host}/api/logs/${jobId}`;
    } catch (error) {
        // Fallback to default if URL parsing fails
        console.error('❌ [Client] Error parsing API_BASE_URL:', error);
        wsUrl = `ws://localhost:3000/api/logs/${jobId}`;
    }

    console.log('🔌 [Client] WebSocket URL:', wsUrl);

    let socket: WebSocket;
    try {
        socket = new WebSocket(wsUrl);
    } catch (error) {
        console.error('❌ [Client] Error creating WebSocket:', error);
        if (onError) onError(error);
        return {
            close: () => { },
            isConnected: () => false
        };
    }

    // Track last received message to avoid duplicates
    let lastReceivedMessage = '';
    let messageCount = 0;
    let duplicateCount = 0;

    // Connection opened
    socket.addEventListener('open', (event) => {
        console.log('📡 [Client] WebSocket connection established for job:', jobId);
    });

    // Listen for messages
    socket.addEventListener('message', (event) => {
        // Don't try to parse as JSON, treat as plain text
        const logData = event.data;

        // Skip if this is the exact same message as the last one
        if (logData === lastReceivedMessage) {
            duplicateCount++;
            // Only log every 10th duplicate to avoid console spam
            if (duplicateCount % 10 === 0) {
                console.log(`🔄 [Client] Skipped ${duplicateCount} duplicate messages`);
            }
            return;
        }

        // Update last received message
        lastReceivedMessage = logData;
        messageCount++;

        // Log every 10th message to avoid console spam
        if (messageCount % 10 === 0) {
            console.log(`📝 [Client] Received ${messageCount} log messages so far`);
        }

        // Pass the raw log data to the callback
        onLogReceived(logData);
    });

    // Handle errors
    socket.addEventListener('error', (event) => {
        // WebSocket error event genellikle detay içermez, bu yüzden ek bilgi ekliyoruz
        console.error('❌ [Client] WebSocket error for job:', jobId);
        console.error('❌ [Client] WebSocket URL:', wsUrl);
        console.error('❌ [Client] WebSocket readyState:', socket.readyState);
        console.error('❌ [Client] Error details (may be empty):', event);

        // Bağlantı durumunu kontrol et
        const connectionState = {
            0: 'CONNECTING',
            1: 'OPEN',
            2: 'CLOSING',
            3: 'CLOSED'
        }[socket.readyState] || 'UNKNOWN';

        console.error('❌ [Client] WebSocket connection state:', connectionState);

        // Hata mesajını oluştur
        const errorMessage = `WebSocket error: Connection state is ${connectionState}`;

        if (onError) onError({
            message: errorMessage,
            jobId,
            url: wsUrl,
            readyState: socket.readyState,
            originalEvent: event
        });

        // Bağlantı hatası durumunda kullanıcıya özel mesaj gösterme
        // Sadece loglama yap
    });

    // Handle connection close
    socket.addEventListener('close', (event) => {
        console.log('🔌 [Client] WebSocket connection closed for job:', jobId, event.code, event.reason);

        // If connection was closed abnormally and not by user, try to reconnect
        if (event.code !== 1000 && event.code !== 1001) {
            console.log('🔄 [Client] Attempting to reconnect WebSocket...');
            // Wait a bit before reconnecting
            setTimeout(() => {
                connectToLogStream(jobId, onLogReceived, onError);
            }, 3000);
        }

        // Bağlantı kapandığında özel mesaj gösterme
        // Sadece loglama yap
    });

    // Return functions to close the connection and check connection state
    return {
        close: () => {
            console.log('🔌 [Client] Closing WebSocket connection for job:', jobId);
            socket.close(1000, "User closed connection");
        },
        isConnected: () => socket.readyState === WebSocket.OPEN
    };
} 