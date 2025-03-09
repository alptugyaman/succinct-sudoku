import { NextResponse } from 'next/server';
import { isValidSolution } from '@/lib/sudoku';

export async function POST(request: Request) {
    console.log('🔍 [API] Verify endpoint called');
    try {
        const body = await request.json();
        console.log('📥 [API] Verify request body:', body);
        const { initial_board, solution } = body;

        // Validate the solution using our existing Sudoku logic
        const isValid = isValidSolution(solution);
        console.log('✅ [API] Solution valid:', isValid);

        // Return the validation result
        return NextResponse.json({ valid: isValid });
    } catch (error) {
        console.error('❌ [API] Error verifying solution:', error);
        return NextResponse.json(
            { error: 'Failed to verify solution' },
            { status: 500 }
        );
    }
}
