# Reactjack - Blackjack & Card Counting Simulator

A feature-rich Blackjack web application built with React, featuring configurable CPU opponents with unique AI personalities, dynamic table banter, keyboard shortcuts, and a card counting training suite.

## Features

### Classic & Multi-Hand Blackjack
- Full blackjack game mechanics: Deal, Hit, Stand, Double Down, and Split.
- Real-time hand evaluation (soft vs. hard totals, blackjack detection, bust detection).
- Dealer turn pacing and rules (dealer hits until soft 17+).
- Chip-based wagering with stack tracking.
- Multi-hand support for split decisions.
- Fixed bottom control dock with active turn indicators.

### CPU Opponents & AI Personalities
- Configurable table lineup supporting 0 to 4 CPU players.
- Four distinct AI personality archetypes with customized strategies:
  - **Alice (Basic Strategy)**: Follows mathematically optimal basic strategy.
  - **Bob (Risk Taker)**: Aggressive playstyle, taking high-risk hits and doubles.
  - **Chuck (Card Counter)**: Adjusts hit/stand thresholds and bet sizing based on the shoe count.
  - **Jim Bob (Rookie)**: Unpredictable, casual decision-making.
- Interactive table talk with character avatars, speech bubbles, and a searchable table log.

### Card Counting Training Suite
- **Hi-Lo Counting System**: Tracks Running Count, True Count, Cards Seen, and Decks Remaining.
- **Practice Drills**: Dedicated trainer mode to test and sharpen mental card counting speed and accuracy.
- **Strategy Insights**: Live statistics to verify plays against optimal count-based strategy.

### Keyboard Shortcuts
- `D` or `Space`: Deal
- `H`: Hit
- `S`: Stand
- `2` / `D`: Double Down
- `P`: Split
- `N` or `Enter`: New Round / Reset

### Audio & Visuals
- Synthesized sound effects (card deals, chips, wins, busts) via Web Audio API.
- Responsive table layout with card animations.

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jgl3hb/reactjack.git
   cd reactjack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Available Scripts

- `npm start`: Runs the development server.
- `npm test`: Runs the test suite in interactive watch mode.
- `npm run build`: Builds the production bundle in the `build/` directory.

## Project Structure

```
src/
├── components/
│   ├── CardCountingTrainer.jsx   # Card counting drill interface
│   ├── CharacterAvatar.jsx       # CPU avatar portraits and status
│   ├── ChipButton.jsx            # Betting chip selector
│   ├── GameControls.jsx          # Bottom dock with action buttons
│   ├── Hand.jsx                  # Player and dealer hand displays
│   ├── SpeechBubble.jsx          # Table dialogue display
│   └── TableTalkLog.jsx          # Scrollable table chat history
├── hooks/
│   ├── useBlackjackGame.js       # Game state machine and turn loop
│   └── useDeck.js                # Shoe generation, shuffle, and draw
├── utils/
│   ├── cardCounting.js           # Hi-Lo calculations and metrics
│   ├── characters.js             # CPU player profiles and setup
│   ├── cpuLogic.js               # AI decision engine per personality
│   ├── gameConstants.js          # Table limits and payout rules
│   ├── personalityDialogue.js    # Contextual dialogue engine
│   └── soundEffects.js           # Web Audio sound generator
├── App.js                        # Main application container
└── index.js                      # Application entry point
```

## License

MIT
