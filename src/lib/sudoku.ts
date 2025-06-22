/**
 * Sudoku game logic utilities
 */

export type SudokuGrid = (number | null)[][];
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Creates a new solved Sudoku grid
 */
export function createSolvedGrid(): SudokuGrid {
    // Start with an empty 9x9 grid
    const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));

    // Fill the grid using backtracking algorithm
    solveSudoku(grid);

    return grid;
}

/**
 * Creates a new Sudoku puzzle with the specified difficulty
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createPuzzle(_difficulty: Difficulty): SudokuGrid {
    // Create a solved grid first
    const solvedGrid = createSolvedGrid();

    // Clone the grid
    const puzzle: SudokuGrid = solvedGrid.map(row => [...row]);

    // For testing, only remove 1 cell
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    puzzle[row][col] = null;

    return puzzle;
}

/**
 * Checks if a number can be placed at the specified position
 */
export function isValidPlacement(grid: SudokuGrid, row: number, col: number, num: number): boolean {
    // Check row
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num) {
            return false;
        }
    }

    // Check column
    for (let i = 0; i < 9; i++) {
        if (grid[i][col] === num) {
            return false;
        }
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[boxRow + i][boxCol + j] === num) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Solves a Sudoku grid using backtracking algorithm
 */
export function solveSudoku(grid: SudokuGrid): boolean {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            // Find an empty cell
            if (grid[row][col] === null) {
                // Try placing numbers 1-9
                for (let num = 1; num <= 9; num++) {
                    if (isValidPlacement(grid, row, col, num)) {
                        // Place the number if valid
                        grid[row][col] = num;

                        // Recursively try to solve the rest of the grid
                        if (solveSudoku(grid)) {
                            return true;
                        }

                        // If placing the number doesn't lead to a solution, backtrack
                        grid[row][col] = null;
                    }
                }

                // If no number can be placed, backtrack
                return false;
            }
        }
    }

    // If all cells are filled, the grid is solved
    return true;
}

/**
 * Checks if the current grid is a valid solution
 */
export function isValidSolution(grid: SudokuGrid): boolean {
    // Check if the grid is complete
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === null) {
                return false;
            }
        }
    }

    // Check rows
    for (let row = 0; row < 9; row++) {
        const seen = new Set<number>();
        for (let col = 0; col < 9; col++) {
            const num = grid[row][col];
            if (num === null || seen.has(num)) {
                return false;
            }
            seen.add(num);
        }
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
        const seen = new Set<number>();
        for (let row = 0; row < 9; row++) {
            const num = grid[row][col];
            if (num === null || seen.has(num)) {
                return false;
            }
            seen.add(num);
        }
    }

    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 9; boxRow += 3) {
        for (let boxCol = 0; boxCol < 9; boxCol += 3) {
            const seen = new Set<number>();
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const num = grid[boxRow + i][boxCol + j];
                    if (num === null || seen.has(num)) {
                        return false;
                    }
                    seen.add(num);
                }
            }
        }
    }

    return true;
}

/**
 * Creates a deep copy of a Sudoku grid
 */
export function cloneGrid(grid: SudokuGrid): SudokuGrid {
    return grid.map(row => [...row]);
} 