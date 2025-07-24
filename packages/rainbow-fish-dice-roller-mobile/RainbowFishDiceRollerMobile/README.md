# 🎲 Rainbow Fish Dice Roller Mobile App

Enterprise-grade D&D dice rolling mobile application built with React Native and Expo.

## Features

- **Multiple Dice Types**: Support for d4, d6, d8, d10, d12, d20, and d100
- **Custom Expressions**: Roll complex dice expressions like "2d6+3", "1d20+5"
- **Roll History**: Track all your rolls with timestamps
- **Enterprise Architecture**: Modular design with shared business logic
- **Cross-Platform**: Runs on iOS, Android, and Web

## Project Structure

```
RainbowFishDiceRollerMobile/
├── App.tsx                 # Main React Native component
├── lib/
│   └── shared/
│       └── dice.ts         # Shared dice engine business logic
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Xcode (for iOS testing)
- Android Studio (for Android testing)
- Expo CLI

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install web dependencies (for web testing):
   ```bash
   npx expo install react-dom react-native-web @expo/metro-runtime
   ```

### Running the App

#### Web (Easiest for testing)
```bash
npm run web
```
Then visit: http://localhost:8081

#### iOS Simulator
```bash
npm run ios
```

#### Android Emulator
```bash
npm run android
```

### Testing the Dice Engine

You can test the core dice engine functionality:

```bash
node test-dice.js
```

## Architecture

### Shared Code Layer (`lib/shared/dice.ts`)

The app follows enterprise-grade modularity with a shared code layer containing:

- **DiceEngine**: Singleton class managing all dice operations
- **Types**: TypeScript interfaces for type safety
- **Business Logic**: Core dice rolling algorithms

### Key Classes and Interfaces

```typescript
// Core dice types
type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

// Individual dice result
interface DiceResult {
  id: string;
  type: DiceType;
  value: number;
  timestamp: Date;
  modifier?: number;
  advantage?: boolean;
  disadvantage?: boolean;
}

// Complete roll with multiple dice
interface DiceRoll {
  id: string;
  dice: DiceResult[];
  total: number;
  expression: string;
  timestamp: Date;
}
```

### Main Features

1. **Single Die Rolls**: Click any dice button (D4, D6, D8, etc.)
2. **Custom Expressions**: Enter expressions like "2d6+3" in the input field
3. **Roll History**: View all previous rolls with timestamps
4. **Clear History**: Reset all roll history

## UI Components

- **Dark Theme**: Enterprise-grade dark blue theme
- **Touch Optimized**: Large buttons for mobile interaction
- **Responsive Design**: Works on phones, tablets, and web
- **Real-time Updates**: Instant roll results and history updates

## Enterprise Features

- **Singleton Pattern**: Single dice engine instance
- **Type Safety**: Full TypeScript support
- **Modular Architecture**: Separated business logic and UI
- **History Management**: Persistent roll tracking
- **Cross-Platform**: React Native with Expo

## Next Steps

1. **Mobile-Specific Features**:
   - Haptic feedback for rolls
   - Sound effects
   - Camera integration for physical dice scanning
   - Biometric authentication

2. **Advanced Features**:
   - Character sheet integration
   - Campaign management
   - Cloud sync
   - Multiplayer support

## Testing

The app has been tested with:
- ✅ Individual dice rolls (d4, d6, d8, d10, d12, d20, d100)
- ✅ Custom dice expressions (2d6+3, 1d20+5, etc.)
- ✅ Roll history management
- ✅ Web platform compatibility
- ✅ TypeScript type safety

## Development

The app is ready for further development and can be extended with:
- Advanced game mechanics
- Integration with campaign tools
- Multiplayer features
- Cloud synchronization
- Advanced analytics

Built with ❤️ for the D&D community by ChaseWhiteRabbit NGO.
