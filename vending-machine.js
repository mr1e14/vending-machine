const { capacityPerDenomination } = require("./config");
const {
  validatePositiveInteger,
  validatePositiveFloat,
  validateDenomination
} = require("./validators");

/**
 * Function (closure) for generating vending machine instances
 *
 * @param {Object} coins Object containing initial denominations state
 * @returns {Object} Vending machine instance
 */
const createVendingMachine = coins => {
  console.log("Creating new vending machine");

  // validate coins
  Object.entries(coins).forEach(([denomination, quantity]) => {
    validateDenomination(denomination);
    if (quantity !== 0) {
      validatePositiveInteger(quantity);
    }

    if (capacityPerDenomination[denomination] < quantity) {
      throw new Error(
        `Quantity for denomination "${denomination}" (${quantity})
             exceeds capacity (${capacityPerDenomination[denomination]})`
      );
    }
  });

  /**
   * Function for adding coins to vending machine
   *
   * @param {int} denomination Coin denomination
   * @param {int} quantity Amount of coins
   */
  const deposit = (denomination, quantity) => {
    //console.debug(`Depositing ${quantity} of ${denomination}`);

    validatePositiveInteger(quantity);
    validateDenomination(denomination);

    const availableCapacity =
      capacityPerDenomination[denomination] - coins[denomination];

    if (availableCapacity < quantity) {
      throw new Error(
        `The amount you wish to deposit (${quantity}) exceeds remaining capacity (${availableCapacity})`
      );
    }
    coins[denomination] = coins[denomination]
      ? coins[denomination] + quantity
      : quantity;
  };

  /**
   * Getter for current state of coins
   *
   * @returns {Object} Read-only immutable state of coins
   */
  const getCoins = () => Object.freeze(Object.assign({}, coins));

  /**
   * Function for getting the best-possible offer of change
   * (based on coins availability and amount of currency desired)
   * It returns object with two attributes:
   * - 'balance' integer of currency sub-units, indicates outstanding amount that the machine cannot dispense
   * - 'coinsUsed' object, combination of coins used to produce this result
   *
   * @param {float} value Amount of change to dispense in full units (e.g. 1.20)
   * @returns {Object} Result object containing 'balance' and 'coinsUsed'
   */
  const getChange = value => {
    //console.debug(`Getting change for: £${value}`);
    validatePositiveFloat(value);
    const maxDenomination = Math.max(...Object.keys(coins));
    return calculateResult(
      { balance: Math.trunc(value * 100), coinsUsed: {} },
      Object.assign({}, coins),
      maxDenomination
    );
  };

  /**
   * Function for deducting coins from coins state
   *
   * @param {Object} coinsUsed Change approved to be dispensed
   */
  const deduct = coinsUsed => {
    //console.debug("Deducting coins");
    Object.entries(coinsUsed).forEach(([denomination, quantity]) => {
      coins[denomination] = Math.max(0, coins[denomination] - quantity);
    });
  };

  /**
   * Recursive function for obtaining the best-possible offer for change
   * Returns change using as few coins as possible
   * @see {@link getChange} for return object information
   *
   * @param {Object} currentResult Best offer at the time of invokation
   * @param {Object} coinsAvailable Clone of state of coins
   * @param {int} denomination Current denomination being processed
   *
   * @returns {Object} Result object containing 'balance' and 'coinsUsed'
   */
  const calculateResult = (currentResult, coinsAvailable, denomination) => {
    /*console.debug(
      `Calculating result. currentResult: ${JSON.stringify(
        currentResult
      )}, coinsAvailable: ${JSON.stringify(
        coinsAvailable
      )}, denomination: ${denomination}`
    );*/
    if (currentResult.balance === 0) {
      return currentResult;
    }
    const maxCoinsToUse = Math.trunc(currentResult.balance / denomination);
    const maxCoinsAvailable =
      coinsAvailable[denomination] < maxCoinsToUse
        ? coinsAvailable[denomination]
        : maxCoinsToUse;

    let newBalance;
    const isLowestDenomination = denomination === 1;
    if (isLowestDenomination) {
      newBalance = currentResult.balance - maxCoinsAvailable;
      return {
        balance: newBalance,
        coinsUsed: Object.assign({}, currentResult.coinsUsed, {
          [denomination]: maxCoinsAvailable
        })
      };
    }

    let nextDenomination, bestResult, finalResult;
    for (let i = maxCoinsAvailable; i >= 0; i--) {
      newBalance = currentResult.balance - i * denomination;
      newResult = {
        balance: newBalance,
        coinsUsed: Object.assign({}, currentResult.coinsUsed, {
          [denomination]: i
        })
      };
      nextDenomination = Math.max(
        ...Object.keys(coinsAvailable).filter(
          coinDenomination => coinDenomination < denomination
        )
      );
      finalResult = calculateResult(
        newResult,
        coinsAvailable,
        nextDenomination
      );

      if (finalResult.balance === 0) {
        return finalResult;
      }
      if (!bestResult || finalResult.balance < bestResult.balance) {
        bestResult = finalResult;
      }
    }
    return bestResult;
  };

  console.log("Vending machine has been initialised");
  return { getCoins, getChange, deposit, deduct };
};

module.exports = { createVendingMachine };
