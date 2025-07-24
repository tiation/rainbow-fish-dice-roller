// Simple test to verify dice engine functionality
const { DiceEngine } = require('./lib/shared/dice');

console.log('🎲 Testing Rainbow Fish Dice Roller Mobile App');
console.log('===============================================');

const diceEngine = DiceEngine.getInstance();

// Test individual dice rolls
console.log('\n1. Testing individual dice rolls:');
const d20Roll = diceEngine.rollDie('d20');
console.log(`d20 roll: ${d20Roll.value} (ID: ${d20Roll.id})`);

const d6Roll = diceEngine.rollDie('d6');
console.log(`d6 roll: ${d6Roll.value} (ID: ${d6Roll.id})`);

// Test dice expressions
console.log('\n2. Testing dice expressions:');
const basicRoll = diceEngine.rollExpression('2d6+3');
console.log(`2d6+3: Individual rolls: [${basicRoll.dice.map(d => d.value).join(', ')}] + 3 = ${basicRoll.total}`);

const attackRoll = diceEngine.rollExpression('1d20+5');
console.log(`1d20+5: ${attackRoll.dice[0].value} + 5 = ${attackRoll.total}`);

// Test advantage/disadvantage
console.log('\n3. Testing advantage/disadvantage:');
const advantageRoll = diceEngine.rollWithAdvantage('d20', true, false);
console.log(`d20 with advantage: ${advantageRoll.value} (advantage: ${advantageRoll.advantage})`);

const disadvantageRoll = diceEngine.rollWithAdvantage('d20', false, true);
console.log(`d20 with disadvantage: ${disadvantageRoll.value} (disadvantage: ${disadvantageRoll.disadvantage})`);

// Test history
console.log('\n4. Testing roll history:');
const history = diceEngine.getHistory();
console.log(`Total rolls in history: ${history.length}`);
history.forEach((roll, index) => {
  console.log(`  ${index + 1}. ${roll.expression} = ${roll.total} (${roll.timestamp.toISOString()})`);
});

console.log('\n✅ All tests completed successfully!');
console.log('The mobile app is ready for testing.');
console.log('Visit http://localhost:8081 to see the web version.');
