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
 * @param {String} string example: Double Layer Chocolate Peanut Butter Pie
 * @returns double-layer-chocolate-peanut-butter-Pie
 */
module.exports.dashString = function (string) {
  return string
    .toLowerCase()
    .replace('ñ', 'n')
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

/**
 * @param req express http request
 * @returns true if the http request is secure (comes form https)
 */
module.exports.isSecure = function (req) {
  if (req.headers['x-forwarded-proto']) {
    return req.headers['x-forwarded-proto'] === 'https';
  }
  return req.secure;
};

/**
 * @param {[]} array
 * @returns {[]}
 */
module.exports.shuffle = function (array) {
  return array.sort(() => Math.random() - 0.5);
};
