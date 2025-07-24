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
import { DiceEngine, DiceType, DiceRoll } from './lib/shared/dice';

export default function App() {
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);
  const [customExpression, setCustomExpression] = useState('1d20');
  const diceEngine = DiceEngine.getInstance();

  const rollDie = (type: DiceType) => {
    const result = diceEngine.rollDie(type);
    const roll: DiceRoll = {
      id: result.id,
      dice: [result],
      total: result.value,
      expression: `1${type}`,
      timestamp: new Date(),
    };
    
    const history = diceEngine.getHistory();
    setRollHistory([...history]);
  };

  const rollExpression = () => {
    const roll = diceEngine.rollExpression(customExpression);
    const history = diceEngine.getHistory();
    setRollHistory([...history]);
  };

  const clearHistory = () => {
    diceEngine.clearHistory();
    setRollHistory([]);
  };

  const diceTypes: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🎲 Rainbow Fish Dice Roller</Text>
      
      {/* Quick dice buttons */}
      <View style={styles.diceGrid}>
        {diceTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={styles.diceButton}
            onPress={() => rollDie(type)}
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
