# Succinct Sudoku

A modern, interactive Sudoku game built with Next.js, TypeScript, and Tailwind CSS. This project implements a clean, responsive Sudoku game with integrated **Succinct Prover Network** support for generating Zero-Knowledge proofs on Sepolia testnet.

## Features

- 🎮 Interactive Sudoku board with number pad
- 🎯 Multiple difficulty levels
- ⏱️ Timer functionality
- 🎨 Modern, responsive UI with dark mode support
- 🔄 Game controls for new game, undo, and hints
- 📱 Mobile-first design
- ⚡ Fast performance with Next.js and React Server Components
- 🔐 **Zero-Knowledge Proof generation with Succinct Prover Network**
- 🌐 **Sepolia testnet integration for decentralized proving**
- 💰 **USDC payment system for proof generation**

## Tech Stack

- **Framework**: Next.js 15.2.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Radix UI
- **Form Validation**: Zod
- **HTTP Client**: Axios
- **ZK Proving**: Succinct SP1 + Prover Network
- **Blockchain**: Sepolia Testnet

## Prerequisites

- Node.js 18.x or later
- npm or yarn package manager
- **Succinct Prover Network invite code** (for ZK proof generation)
- **Sepolia testnet wallet** with USDC for proof payments

## Getting Started

### 1. Basic Setup

Clone the repository:
```bash
git clone https://github.com/yourusername/sudoku.git
cd sudoku
```

Install dependencies:
```bash
npm install
# or
yarn install
```

### 2. Succinct Prover Network Setup

#### Get Invite Code
- Visit [https://testnet.succinct.xyz](https://testnet.succinct.xyz)
- Get an invite code through X (Twitter)
- Join "Level 1: Crisis of Trust" testnet program

#### Setup Wallet
- Create a fresh Ethereum wallet for Sepolia testnet
- Get Sepolia ETH from faucets
- Deposit $10 USDC to Succinct Network for proof costs

#### Configure Private Key
Update `src/lib/prover-network.ts` with your private key:

```typescript
const PROVER_NETWORK_CONFIG = {
    privateKey: 'your_sepolia_private_key_here', // Replace with your actual key
    // ... other config
};
```

### 3. Environment Configuration

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Run the Application

Start the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## Zero-Knowledge Proof Features

### Proof Generation Options

The game offers two proof generation methods:

#### 1. Local Backend Proving
- Uses your local SP1 setup
- Requires running the Rust backend
- Free but requires local setup

#### 2. Succinct Prover Network
- **Decentralized proving on Sepolia testnet**
- No local setup required
- Costs ~$0.01-0.10 per proof in USDC
- Real-time proof generation with status updates

### Using the Prover Network

1. **Complete a Sudoku puzzle**
2. **Click "Generate Proof (Succinct Network)"**
3. **System checks your USDC balance**
4. **Proof request submitted to decentralized network**
5. **Real-time status updates during generation**
6. **Receive cryptographic proof of your solution**

### Network Balance Management

- **Check Balance**: View your current USDC credits
- **Deposit USDC**: Add $10 USDC for multiple proofs
- **Automatic Deduction**: Small amount deducted per proof

## Project Structure

```
src/
├── app/                    # Next.js app directory
├── components/sudoku/      # Sudoku game components
│   ├── proof-status.tsx   # ZK proof generation UI
│   └── ...
├── lib/                   # Core logic and utilities
│   ├── prover-network.ts  # Succinct Network integration
│   ├── api.ts            # Local backend integration
│   ├── sudoku.ts         # Game logic
│   └── store.ts          # State management
└── ...
```

## Backend Integration

This frontend integrates with the `sudoku-verifier` Rust backend that supports both:

1. **Local SP1 proving**
2. **Succinct Prover Network integration**

See `../sudoku-verifier/env-setup.md` for backend configuration.

## API Endpoints

### Local Backend
```
POST /validate-sudoku
```

### Succinct Prover Network
```
POST /prove           # Submit proof request
GET /proof/{job_id}   # Check proof status
POST /deposit         # Deposit USDC
GET /balance          # Check balance
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Components

1. **ProofStatus** - Manages ZK proof generation UI
2. **Prover Network Integration** - Handles Succinct Network API
3. **Game Store** - Zustand state management
4. **Sudoku Logic** - Core game algorithms

## Costs and Economics

### Proof Generation Costs
- **Network Proofs**: ~$0.01-0.10 USDC per proof
- **Local Proofs**: Free (requires local setup)

### Recommended Deposit
- **$10 USDC**: Covers 100-1000 proofs depending on complexity

## Security Notes

⚠️ **Important**: 
- Private keys are embedded in code for demo purposes
- **Never use this approach in production**
- Use proper environment variable management for production
- This is testnet only - no real value at risk

## Troubleshooting

### Common Issues

1. **"Insufficient credits"**
   - Deposit more USDC to the network
   - Check balance with "Check Network Balance"

2. **"Proof generation failed"**
   - Verify private key is correct
   - Ensure wallet has Sepolia ETH for gas
   - Check network connection

3. **"Could not connect to API"**
   - Ensure backend is running
   - Check API URL configuration

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built with [Succinct SP1](https://docs.succinct.xyz) for ZK proving
- Powered by [Succinct Prover Network](https://blog.succinct.xyz/the-succinct-prover-network-testnet-is-live/)
- UI components from Radix UI
- State management with Zustand
- Modern React patterns with Next.js

---

**🚀 Experience the future of Zero-Knowledge proofs with decentralized proving!**
