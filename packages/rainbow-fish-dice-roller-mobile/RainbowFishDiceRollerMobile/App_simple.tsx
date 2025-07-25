import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

interface DiceResult {
  id: string;
  type: DiceType;
  value: number;
  timestamp: Date;
}

interface DiceRoll {
  id: string;
  dice: DiceResult[];
  total: number;
  expression: string;
  timestamp: Date;
}

// Simple dice rolling function
const rollDie = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
import DiceConfig from './src/components/DiceConfig';

export default function App() {
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);
  const [customExpression, setCustomExpression] = useState('1d20');

  const rollSingleDie = (type: DiceType) => {
    const sides = {
      'd4': 4,
      'd6': 6,
      'd8': 8,
      'd10': 10,
      'd12': 12,
      'd20': 20,
      'd100': 100
    };

    const value = rollDie(sides[type]);
    const result: DiceResult = {
      id: generateId(),
      type,
      value,
      timestamp: new Date(),
    };

    const roll: DiceRoll = {
      id: generateId(),
      dice: [result],
      total: value,
      expression: `1${type}`,
      timestamp: new Date(),
    };

    setRollHistory(prev => [...prev, roll]);
  };

  const rollExpression = () => {
    // Simple expression parser for testing
    const match = customExpression.match(/(\d*)d(\d+)([+-]\d+)?/);
    if (match) {
      const count = parseInt(match[1]) || 1;
      const sides = parseInt(match[2]);
      const modifier = match[3] ? parseInt(match[3]) : 0;

      const results: DiceResult[] = [];
      let total = modifier;

      for (let i = 0; i < count; i++) {
        const value = rollDie(sides);
        results.push({
          id: generateId(),
          type: `d${sides}` as DiceType,
          value,
          timestamp: new Date(),
        });
        total += value;
      }

      const roll: DiceRoll = {
        id: generateId(),
        dice: results,
        total,
        expression: customExpression,
        timestamp: new Date(),
      };

      setRollHistory(prev => [...prev, roll]);
    }
  };

  const clearHistory = () => {
    setRollHistory([]);
  };

  const diceTypes: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🎲 Rainbow Fish Dice Roller</Text>
      
{/* Dice Configuration */}
      <DiceConfig />

      {/* Quick dice buttons */}
      <View style={styles.diceGrid}>
        {diceTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={styles.diceButton}
            onPress={() => rollSingleDie(type)}
          >
            <Text style={styles.diceButtonText}>{type.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom expression input */}
      <View style={styles.expressionContainer}>
        <TextInput
          style={styles.expressionInput}
          value={customExpression}
          onChangeText={setCustomExpression}
          placeholder="Enter dice expression (e.g., 2d6+3)"
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.rollButton} onPress={rollExpression}>
          <Text style={styles.rollButtonText}>Roll</Text>
        </TouchableOpacity>
      </View>

      {/* Roll history */}
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Roll History</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.historyScroll}>
          {rollHistory.slice().reverse().map((roll) => (
            <View key={roll.id} style={styles.rollItem}>
              <Text style={styles.rollExpression}>{roll.expression}</Text>
              <Text style={styles.rollTotal}>= {roll.total}</Text>
              <Text style={styles.rollTime}>
                {roll.timestamp.toLocaleTimeString()}
              </Text>
            </View>
          ))}
          {rollHistory.length === 0 && (
            <Text style={styles.emptyHistory}>No rolls yet. Start rolling!</Text>
          )}
        </ScrollView>
      </View>
      
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1428',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4fc3f7',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  diceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  diceButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 5,
    shadowColor: '#4fc3f7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  diceButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expressionContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  expressionInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    color: '#ffffff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 10,
  },
  rollButton: {
    backgroundColor: '#059669',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  rollButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyContainer: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4fc3f7',
  },
  clearButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyScroll: {
    flex: 1,
  },
  rollItem: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rollExpression: {
    color: '#94a3b8',
    fontSize: 16,
  },
  rollTotal: {
    color: '#4fc3f7',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rollTime: {
    color: '#64748b',
    fontSize: 12,
  },
  emptyHistory: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
});
