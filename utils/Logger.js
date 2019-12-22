const log4js = require('log4js');

/**
 * Use it as:
 *
 * const {Logger} = require("./util/Logger");
 * const log = new Logger("my_module");
 * log.info('hello');
 */
module.exports.Logger = function (moduleName) {
  const logger = log4js.getLogger(moduleName);
  logger.level = process.env.RESOPIA_LOG_LEVEL || 'info';
  return logger;
};
