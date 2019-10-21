## Language used 
Solution has been written in JavaScript (ES6), executable with Node.js

## Running application 
Node.js must be installed on the machine.
Initial state of coins is configurable through ./initialState.json. Keys indicate denominations, values indicate quantity.
Run with `node app.js`
For more verbose logging, uncomment console.debug statements

## Assumptions 

1. Vending machine has slots for all coin denominations i.e. physical capacity - this is configurable in ./config.js.
2. Vending machine cannot make a loss on a transaction due to not having enough coins to dispense change needed - I accept that this is controversial.
3. In scenario described in assumption 2., vending machine gives two options: purchase item knowing that the machine will dispense less than it owes (exact outstanding balance is displayed), or cancel transaction.
