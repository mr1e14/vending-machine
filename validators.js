const { denominations } = require("./config");

/**
 * Function to validate for positive integer values
 * Throws exception if invalid
 *
 * @param {*} value Any value
 */
const validatePositiveInteger = value => {
  const errorMessageTemplate =
    "Illegal value - expected positive integer, received: ";
  const intValue = parseInt(value, 10);
  if (isNaN(intValue)) {
    throw new Error(errorMessageTemplate.concat("NaN"));
  }
  if (intValue <= 0) {
    throw new Error(errorMessageTemplate.concat(value));
  }
};

/**
 * Function to validate for positive float values
 * Throws exception if invalid
 *
 * @param {*} value Any value
 */
const validatePositiveFloat = value => {
  const errorMessageTemplate =
    "Illegal value - expected positive float, received: ";
  const floatValue = parseFloat(value);
  if (isNaN(floatValue)) {
    throw new Error(errorMessageTemplate.concat("NaN"));
  }
  if (floatValue <= 0) {
    throw new Error(errorMessageTemplate.concat(value));
  }
};

/**
 * Function for validating coin denomination
 * Throws exception if invalid
 *
 * @param {*} denomination Coin denomination - must be integer to pass validation
 */
const validateDenomination = denomination => {
  validatePositiveInteger(denomination);
  if (!denominations.includes(parseInt(denomination, 10))) {
    throw new Error(`Unsupported denomination: ${denomination}`);
  }
};

module.exports = {
  validatePositiveInteger,
  validatePositiveFloat,
  validateDenomination
};
