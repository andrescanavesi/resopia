/**
 * @param {string} email
 * @return {boolean} true if the email is valid, false otherwise
 *
 */
module.exports.isEmailvalid = function (email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 *
 * @param {String} recipeTitle example: Double Layer Chocolate Peanut Butter Pie
 * @returns double-layer-chocolate-peanut-butter-Pie
 */
module.exports.getTitleUrl = function (recipeTitle) {
  return recipeTitle
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};
