'use strict';

const is = require('is-type-of');

module.exports = {
  /**
   * throw a biz error
   * @param {String} code  error code, default system_exception
   * @param {Error|String} error error or mesaage, default 'SYSTEM EXCEPTION'
   * @param {Object} addition additive attribute
   * @public
   *
   * @example
   *  ctx.throwBizError('system_exception')
   *  ctx.throwBizError(new Error())
   *  ctx.throwBizError({ id: 1, log: false })
   *  ctx.throwBizError('system_exception', { id: 1, log: false })
   *  ctx.throwBizError('system_exception', 'error message')
   *  ctx.throwBizError('system_exception', new Error())
   *  ctx.throwBizError(new Error(), { id: 1, log: false })
   *  ctx.throwBizError('system_exception', 'error message', { id: 1, log: false })
   *
   */
  throwBizError(code, error, addition) {
    const args = [ 'SYSTEM_EXCEPTION', '', null ];
    if (is.error(code)) {
      args[1] = code;
      if (is.object(error)) {
        args[2] = error;
      }
    } else if (is.object(code)) {
      args[2] = code;
    } else {
      args[0] = code;
      if (is.object(error) && !is.error(error)) {
        args[2] = error;
      } else {
        if (is.error(error) || is.string(error)) {
          args[1] = error;
        }
        if (is.object(addition)) {
          args[2] = addition;
        }
      }
    }

    ([ code, error, addition ] = args);

    if (!is.error(error)) {
      error = new Error(error);
    }

    extendErrorProperty(error, { code, bizError: true }, addition);

    Error.captureStackTrace(error, module.exports.throwBizError);

    throw error;
  },

  /**
   * handle error
   * @param {Error} error error
   * @param {Object} addition additive attribute
   */
  responseBizError(error, addition) {
    /* istanbul ignore if */
    if (!is.error(error)) {
      return;
    }

    // not biz error, throw
    if (error.bizError !== true && (addition || {}).bizError !== true) {
      Error.captureStackTrace(error, module.exports.responseBizError);
      throw error;
    }

    extendErrorProperty(error, addition);

    this.app.emit('responseBizError', this, error);
  },
};

function extendErrorProperty(error, ...properties) {
  /* istanbul ignore if */
  if (properties.length === 0) {
    return;
  }

  const addition = Object.assign({}, error.addition, ...properties);

  [ 'code', 'bizError', 'log' ].forEach(property => {
    if (addition[property]) {
      error[property] = addition[property];
      delete addition[property];
    }
  });

  error.addition = addition;
}