# Succinct Sudoku

A modern, interactive Sudoku game built with Next.js, TypeScript, and Tailwind CSS. This project implements a clean, responsive Sudoku game with a focus on user experience and performance.

## Features

- 🎮 Interactive Sudoku board with number pad
- 🎯 Multiple difficulty levels
- ⏱️ Timer functionality
- 🎨 Modern, responsive UI with dark mode support
- 🔄 Game controls for new game, undo, and hints
- 📱 Mobile-first design
- ⚡ Fast performance with Next.js and React Server Components
- 🔐 Zero-Knowledge Proof generation for solution verification

## Tech Stack

- **Framework**: Next.js 15.2.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Radix UI
- **Form Validation**: Zod
- **HTTP Client**: Axios

## Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sudoku.git
cd sudoku
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add any required environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── validate-sudoku/ # Sudoku validation endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── sudoku/           # Sudoku game components
│   │   ├── board.tsx     # Sudoku board component
│   │   ├── game.tsx      # Main game component
│   │   ├── game-controls.tsx
│   │   ├── game-status.tsx
│   │   ├── number-pad.tsx
│   │   ├── proof-status.tsx
│   │   ├── result-modal.tsx
│   │   └── start-screen.tsx
│   └── ui/               # Reusable UI components
└── lib/                  # Utility functions and core logic
    ├── api.ts           # API integration
    ├── sudoku.ts        # Sudoku game logic
    ├── store.ts         # Zustand store
    └── utils.ts         # Utility functions
```

## Technical Implementation

### Game Logic (`lib/sudoku.ts`)
- Implements core Sudoku algorithms:
  - `createSolvedGrid()`: Generates a valid solved Sudoku grid
  - `solveSudoku(grid)`: Solves a Sudoku grid using backtracking
  - `isValidPlacement(grid, row, col, num)`: Validates number placement
  - `isValidSolution(grid)`: Verifies complete solution validity

### API Integration (`lib/api.ts`)
The application communicates with a backend API for Sudoku validation:

```typescript
POST /validate-sudoku
Body: {
  board: number[][],
  solution: number[][]
}
Response: { job_id: string }
```

### Component Architecture

1. **Game Component (`components/sudoku/game.tsx`)**
   - Main game container
   - Manages game state and user interactions
   - Coordinates between board, controls, and number pad

2. **Board Component (`components/sudoku/board.tsx`)**
   - Renders the 9x9 Sudoku grid
   - Handles cell selection and highlighting
   - Manages visual feedback for valid/invalid moves

3. **Game Controls (`components/sudoku/game-controls.tsx`)**
   - Provides game management options:
     - New game
     - Undo move
     - Get hint
     - Pause/resume

4. **Number Pad (`components/sudoku/number-pad.tsx`)**
   - Input interface for numbers 1-9
   - Highlights available numbers
   - Handles number selection

5. **Proof Status (`components/sudoku/proof-status.tsx`)**
   - Displays ZKP generation progress
   - Shows proof status and result
   - Handles error states

### State Management
- Uses Zustand for global state management
- Stores:
  - Current game board
  - Game status (active/paused)
  - Timer state
  - Move history
  - Proof generation status

## Game Features

### Board
- Interactive 9x9 grid
- Cell highlighting for selected numbers
- Visual feedback for valid/invalid moves
- Responsive design that works on all screen sizes

### Controls
- Number pad (1-9) for input
- Game controls for:
  - Starting new games
  - Undoing moves
  - Getting hints
  - Pausing/resuming the game

### Game Logic
- Validates moves according to Sudoku rules
- Tracks game progress
- Provides difficulty levels
- Timer functionality

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write clean, maintainable code
- Use proper TypeScript types and interfaces

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js and React
- Styled with Tailwind CSS
- UI components from Radix UI
- State management with Zustand
