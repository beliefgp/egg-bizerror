# egg-bizerror

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-bizerror.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-bizerror
[travis-image]: https://img.shields.io/travis/beliefgp/egg-bizerror.svg?style=flat-square
[travis-url]: https://travis-ci.org/beliefgp/egg-bizerror
[codecov-image]: https://img.shields.io/codecov/c/github/beliefgp/egg-bizerror.svg?style=flat-square
[codecov-url]: https://codecov.io/github/beliefgp/egg-bizerror?branch=master
[david-image]: https://img.shields.io/david/beliefgp/egg-bizerror.svg?style=flat-square
[david-url]: https://david-dm.org/beliefgp/egg-bizerror
[snyk-image]: https://snyk.io/test/npm/egg-bizerror/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-bizerror
[download-image]: https://img.shields.io/npm/dm/egg-bizerror.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-bizerror

handle biz error for Egg.

## Install

```bash
$ npm i egg-bizerror --save
```

## Usage

```js
// config/plugin.js
exports.bizerror = {
  enable: true,
  package: 'egg-bizerror',
};
```

## Configuration

```js
// config/config.default.js
exports.bizerror = {
  breakDefault: false, // disable default error handler
  sendClientAllParams: false, // return error bizParams to user
  interceptAllError: false, // handle all exception, not only bizError exception
};

// config/errorcode.js
module.exports = {
  'USER_NOT_EXIST': {
    status: 400,
    code: '400' // override code value
    message: 'can`t find user info',
    errorPageUrl: '', // app will redirect this url when accepts is html 
    addtion1: 'a', // any, will return to browser
  },
  'NOT_FOUND': {
    errorPageUrl: (ctx, error) => {
      return '/404.html';
    }
  }
  '404': (ctx, error) => {
    ctx.redirect('/404.html');
    return false; // you can return false, break default logic
  }
}
```

## API

* ctx.throwBizError(code, error, bizParams)

  throw an biz error

  * code - `error.code`, default `SYSTEM_EXCEPTION`, read errorcode config with this value when handle error.
  * error - error message or `Error` object.
  * bizParams - `error.bizParams`, extra data, can help you solve the problem.
  * bizParams.sendClient - object, this object will copy to the property `errors` of json object and send to client.
  * bizParams.code - it will cover `error.code`.
  * bizParams.log - `error.log`, if false, not log this error, defalut true.

```js
// throw an error object
// error.code
// error.message
// error.log
// error.bizParams
// error.bizError
ctx.throwBizError('system_exception')
ctx.throwBizError(new Error())
ctx.throwBizError({ code: 'system_exception', log: false })
ctx.throwBizError('system_exception', { userId: 1, log: false })
ctx.throwBizError('system_exception', 'error message')
ctx.throwBizError('system_exception', new Error())
ctx.throwBizError(new Error(), { userId: 1, log: false })
ctx.throwBizError('system_exception', 'error message', { userId: 1, log: false })
```

* ctx.responseBizError(error, bizParams)

  handle the error

  * bizParams - supports the above
  * bizParams.bizError - if you want the plugin to handle this error, you must be set `bizError: true`, otherwise, the plugin will throw this error.

* app.on('responseBizError', (ctx, error) => {})

  you can add listener to do some thing.

* app.BizErrorHandler - default handler class, you can override it

## Example

```js
// app/service/user.js
module.exports = app => {
  class User extends app.Service {
    async getUserId() {
      let userInfo;
      try {
        userInfo = await this.getUser();
      } catch (error) {
        ctx.responseBizError(error, { bizError: true, code: 'USER_NOT_EXIST' })
        return;
      }
      
      if (!userInfo || !userInfo.id) {
        ctx.throwBizError('USER_NOT_EXIST');
      }
      return userInfo.id;
    }
  }
  return User;
};

// app.js
// add handle logic
module.exports = app => {
  app.on('responseBizError', (ctx, error) => {
    if (error.bizParams && error.bizParams.bizType === 'getUser') {
      errorCount++;
    }
  });
};

// app.js
// override default handler
module.exports = app => {
  app.BizErrorHandler = class extends app.BizErrorHandler {
    json(ctx, error, config) {
      ctx.body = {
        code: config.code,
        msg: config.message,
      };
    }
  }
};

```

## License

[MIT](LICENSE)
