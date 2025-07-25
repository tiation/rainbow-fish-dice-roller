import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

interface DiceConfiguration {
  id: string;
  name: string;
  type: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
  count: number;
  modifier: number;
}

const initialConfigurations: DiceConfiguration[] = [
  { id: '1', name: 'Generic 1', type: 'd6', count: 1, modifier: 0 },
  { id: '2', name: 'Generic 2', type: 'd8', count: 1, modifier: 0 },
  { id: '3', name: 'Generic 3', type: 'd10', count: 1, modifier: 0 },
  { id: '4', name: 'Generic 4', type: 'd12', count: 1, modifier: 0 },
  { id: '5', name: 'Generic 5', type: 'd20', count: 1, modifier: 0 },
];

const DiceConfig = () => {
  const [configurations, setConfigurations] = useState(initialConfigurations);

  const handleNameChange = (id: string, newName: string) => {
    setConfigurations((prevConfigs) =>
      prevConfigs.map((config) =>
        config.id === id ? { ...config, name: newName } : config
      )
    );
  };

  const handleTypeChange = (id: string, newType: DiceConfiguration['type']) => {
    setConfigurations((prevConfigs) =>
      prevConfigs.map((config) =>
        config.id === id ? { ...config, type: newType } : config
      )
    );
  };

  const handleCountChange = (id: string, newCount: number) => {
    setConfigurations((prevConfigs) =>
      prevConfigs.map((config) =>
        config.id === id ? { ...config, count: newCount } : config
      )
    );
  };

  const handleModifierChange = (id: string, newModifier: number) => {
    setConfigurations((prevConfigs) =>
      prevConfigs.map((config) =>
        config.id === id ? { ...config, modifier: newModifier } : config
      )
    );
  };

  const rollDice = (config: DiceConfiguration) => {
    const total = Array(config.count)
      .fill(0)
      .reduce(sum => sum + Math.floor(Math.random() * parseInt(config.type.substring(1))) + 1, 0)
      + config.modifier;

    alert(`Rolled ${config.name}: Total = ${total}`);
  };

  const addConfiguration = () => {
    const newConfig: DiceConfiguration = {
      id: Math.random().toString(),
      name: `New Dice ${configurations.length + 1}`,
      type: 'd6',
      count: 1,
      modifier: 0,
    };
    setConfigurations([...configurations, newConfig]);
  };

  const removeConfiguration = (id: string) => {
    setConfigurations((prevConfigs) => prevConfigs.filter((config) => config.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dice Configuration</Text>
      <DraggableFlatList
        data={configurations}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => setConfigurations(data)}
        renderItem={({ item, drag }: RenderItemParams<DiceConfiguration>) => (
          <View style={styles.configItem}>
            <TextInput
              style={styles.input}
              value={item.name}
              onChangeText={(text) => handleNameChange(item.id, text)}
            />
            <TextInput
              style={styles.input}
              value={item.type}
              onChangeText={(text) => handleTypeChange(item.id, text as DiceConfiguration['type'])}
            />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={item.count.toString()}
              onChangeText={(text) => handleCountChange(item.id, parseInt(text) || 1)}
            />
            <View style={styles.modifierContainer}>
              <Text>{item.modifier >= 0 ? '+' : '-'}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={Math.abs(item.modifier).toString()}
                onChangeText={(text) => handleModifierChange(item.id, parseInt(text) || 0)}
              />
            </View>
            <TouchableOpacity onPress={() => rollDice(item)}>
              <Text style={styles.rollButton}>Roll</Text>
            </TouchableOpacity>
            <TouchableOpacity onLongPress={drag} onPress={() => removeConfiguration(item.id)}>
              <Text style={styles.removeButton}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity onPress={addConfiguration} style={styles.addButton}>
        <Text>Add Dice</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  configItem: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  input: {
    flex: 1,
    margin: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 4,
    borderRadius: 4,
  },
  modifierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rollButton: {
    color: 'blue',
    marginLeft: 8,
  },
  removeButton: {
    color: 'red',
    marginLeft: 8,
  },
  addButton: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#28a745',
    borderRadius: 4,
    alignItems: 'center',
  },
});

export default DiceConfig;

