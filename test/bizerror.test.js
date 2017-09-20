'use strict';

const request = require('supertest');

describe('test/bizerror.test.js', () => {
  describe('response error and not ouput addition', () => {
    createApp('apps/bizerror-test');

    it('should handle biz error with throwBizError', () => {
      return request(app.callback())
        .get('/throwError')
        .set('Accept', 'application/json')
        .expect(200)
        .expect({ code: 'USER_NOT_EXIST', message: 'user not exsit' });
    });

    it('should return 404 with config is function', () => {
      return request(app.callback())
        .get('/notFoundData')
        .set('Accept', 'application/json')
        .expect(404)
        .expect({ code: 'NOT_FOUND_DATA', message: 'not found' });
    });

    it('should redirect 404 page', () => {
      return request(app.callback())
        .get('/notFoundPage')
        .expect(302)
        .expect(/404/);
    });

    it('should redirect error page', () => {
      return request(app.callback())
        .get('/redirectErrorPage')
        .expect(302)
        .expect(/404/);
    });

    it('should handle biz error with responseNoBizError', () => {
      return request(app.callback())
        .get('/responseBizError')
        .set('Accept', 'application/json')
        .expect(500)
        .expect({ code: 'SYSTEM_EXCEPTION', message: 'System Exception' });
    });

    it('should not handle biz error', () => {
      return request(app.callback())
        .get('/responseNoBizError')
        .set('Accept', 'application/json')
        .expect(500)
        .expect({ message: 'Internal Server Error' });
    });
  });

  describe('response error and ouput addition', () => {
    createApp('apps/bizerror-output-addition');

    it('should handle biz error with throwBizError', () => {
      return request(app.callback())
        .get('/throwError')
        .set('Accept', 'application/json')
        .expect(200)
        .expect({ code: 'USER_NOT_EXIST', message: 'user not exsit', errorAddition: { id: 1, step: 2 } });
    });

    it('should handle biz error with responseNoBizError', () => {
      return request(app.callback())
        .get('/responseBizError')
        .set('Accept', 'application/json')
        .expect(500)
        .expect({ code: 'SYSTEM_EXCEPTION', message: 'System Exception', errorAddition: { id: 1, step: 2 } });
    });
  });
});
