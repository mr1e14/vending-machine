const { createVendingMachine } = require("./vending-machine");
const { denominations } = require("./config");
const initialCoinsState = require("./initialState.json");

/* String representing denominations and their acceptable input format */
const denominationsHintText = denominations.reduce(
  (previous, current) =>
    previous.concat(
      ` ${current < 100 ? `${current}p` : `£${current / 100}`}`,
      ` => ${current} |`
    ),
  ""
);

/**
 * Function to filter out unavailable denominations
 *
 * @param {Object} coins Full state of coins
 * @returns State of coins without denominations with quantity = 0
 */
const excludeZeroCoins = coins => {
  return Object.entries(coins)
    .filter(([denomination, quantity]) => quantity > 0)
    .map(([denomination, quantity]) => ({
      [denomination]: quantity
    }));
};

/**
 * Function to transform an amount of currency to human-friendly format
 * E.g. 1 => 1p, 220 => £2.20
 *
 * @param {int} value Amount of currency in sub-units
 * @returns {string} Amount of currency in standard currency format
 */
const toCurrencyFormat = value => {
  if (value >= 1) {
    return `£${value}`;
  } else {
    return `${value * 100}p`;
  }
};

const vendingMachine = createVendingMachine(initialCoinsState);

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

const processInput = () => {
  console.log("Coins available:");
  console.log(excludeZeroCoins(vendingMachine.getCoins()));
  readline.question(`(d)eposit | (c)hange | (q)uit\n`, action => {
    switch (action) {
      case "d":
        readline.question(
          `What denomination would you like to deposit? ${denominationsHintText}\n`,
          denomination => {
            readline.question(`How many ${denomination}s?\n`, quantity => {
              try {
                vendingMachine.deposit(
                  parseInt(denomination, 10),
                  parseInt(quantity, 10)
                );
                console.log("Deposit accepted");
              } catch (err) {
                console.error(err.message);
              } finally {
                processInput();
              }
            });
          }
        );
        break;
      case "c":
        readline.question(
          `How much change do you need? (in full units e.g. 0.30 => 30p)\n`,
          value => {
            try {
              const { balance, coinsUsed } = vendingMachine.getChange(
                parseFloat(value)
              );
              if (balance === 0) {
                vendingMachine.deduct(coinsUsed);
                console.log("Change dispensed. Coins used: ");
                console.log(excludeZeroCoins(coinsUsed));
                processInput();
              } else {
                readline.question(
                  `This machine cannot dispense the required amount of currency. 
You can (a)ccept outstanding balance of ${toCurrencyFormat(
                    balance / 100
                  )} or cancel transaction by pressing any other key\n`,
                  answer => {
                    switch (answer) {
                      case "a":
                        vendingMachine.deduct(coinsUsed);
                        console.log("Change dispensed. Coins used: ");
                        console.log(excludeZeroCoins(coinsUsed));
                        break;
                      default:
                        console.log("Transaction canceled");
                    }
                    processInput();
                  }
                );
              }
            } catch (err) {
              console.error(err.message);
              processInput();
            }
          }
        );
        break;
      case "q":
        console.log("Bye.");
        readline.close();
        break;
      default:
        processInput();
    }
  });
};

processInput();
