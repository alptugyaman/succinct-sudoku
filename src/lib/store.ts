import { create } from 'zustand';
import { createPuzzle, cloneGrid, isValidSolution, SudokuGrid, Difficulty } from './sudoku';

interface GameState {
    // Game state
    grid: SudokuGrid;
    originalGrid: SudokuGrid;
    selectedCell: [number, number] | null;
    difficulty: Difficulty;
    isComplete: boolean;
    startTime: number | null;
    endTime: number | null;

    // Actions
    startNewGame: (difficulty: Difficulty, startTimer?: boolean) => void;
    selectCell: (row: number, col: number) => void;
    setNumber: (num: number) => void;
    clearCell: () => void;
    checkSolution: () => boolean;
    getElapsedTime: () => number;
    isGridFilled: () => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
    // Initial state
    grid: Array(9).fill(null).map(() => Array(9).fill(null)),
    originalGrid: Array(9).fill(null).map(() => Array(9).fill(null)),
    selectedCell: null,
    difficulty: 'easy',
    isComplete: false,
    startTime: null,
    endTime: null,

    // Actions
    startNewGame: (difficulty: Difficulty, startTimer = true) => {
        const puzzle = createPuzzle(difficulty);
        set({
            grid: cloneGrid(puzzle),
            originalGrid: cloneGrid(puzzle),
            selectedCell: null,
            difficulty,
            isComplete: false,
            startTime: startTimer ? Date.now() : null,
            endTime: null,
        });
    },

    selectCell: (row: number, col: number) => {
        // Only allow selecting empty cells or cells that were not in the original puzzle
        const { originalGrid } = get();
        if (originalGrid[row][col] === null) {
            set({ selectedCell: [row, col] });
        }
    },

    setNumber: (num: number) => {
        const { selectedCell, grid, originalGrid, startTime } = get();

        if (!selectedCell) return;

        const [row, col] = selectedCell;

        // Only allow setting numbers in empty cells or cells that were not in the original puzzle
        if (originalGrid[row][col] === null) {
            const newGrid = cloneGrid(grid);
            newGrid[row][col] = num;

            // If this is the first move and the timer hasn't started, start it now
            const newState: Partial<GameState> = { grid: newGrid };
            if (startTime === null) {
                newState.startTime = Date.now();
            }

            set(newState);
        }
    },

    clearCell: () => {
        const { selectedCell, grid, originalGrid } = get();

        if (!selectedCell) return;

        const [row, col] = selectedCell;

        // Only allow clearing cells that were not in the original puzzle
        if (originalGrid[row][col] === null) {
            const newGrid = cloneGrid(grid);
            newGrid[row][col] = null;

            set({ grid: newGrid });
        }
    },

    checkSolution: () => {
        const { grid } = get();
        const isComplete = isValidSolution(grid);

        if (isComplete) {
            set({
                isComplete,
                endTime: Date.now()
            });
        }

        return isComplete;
    },

    getElapsedTime: () => {
        const { startTime, endTime } = get();

        if (!startTime) return 0;

        const end = endTime || Date.now();
        return Math.floor((end - startTime) / 1000);
    },

    isGridFilled: () => {
        const { grid } = get();

        // Check if all cells are filled
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === null) {
                    return false;
                }
            }
        }

        return true;
    }
})); 