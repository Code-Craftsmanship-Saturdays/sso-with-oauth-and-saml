'use strict';

const test = require('ava');
const {join} = require('path');
const nock = require('nock');

const {
    responseCodes,
    requestURL,
    endPoints
} = require(join(__dirname, '../../constants'));

const request = require('supertest');

const digestSchemeUrl = endPoints['digestSchemeUrl'];

test.cb('digestScheme endpoint should return 401 and required headers when they are missing', assert => {
  assert.plan(3);
  const requestGetHeaders = {
    reqheaders: {
      'Authorization': 'Digest username="rambo", realm="https://localhost:3000/api/v1/digestScheme"'
    }
  };

  const getScope = nock(requestURL, requestGetHeaders)
    .get(digestSchemeUrl)
    .reply(401, null, {
      'www-authenticate': 'Digest realm="https://localhost:3000/api/v1/digestScheme", qop="auth", algorithm=MD5, nonce="undefined", opaque="undefined"'
    });

  const unauthorized = responseCodes['unauthorized'];
  const req = request.agent(requestURL);
  req
    .get(digestSchemeUrl)
    .set({
      'Authorization': 'Digest username="rambo", realm="https://localhost:3000/api/v1/digestScheme"'
    })
    .expect(res => {
      assert.is(res.status, unauthorized, '401 Status Code should be returned');
      assert.is(
        res.headers['www-authenticate'],
        'Digest realm="https://localhost:3000/api/v1/digestScheme", qop="auth", algorithm=MD5, nonce="undefined", opaque="undefined"'
      );
    })
    .end(() => {
      assert.is(getScope.isDone(), true, `GET ${digestSchemeUrl} Nock Spy called`);
      assert.end();
    });
});

test.cb('digestScheme endpoint should return 200 and authentication property', assert => {
  assert.plan(3);
  const requestGetHeaders = {
    reqheaders: {
      'Authorization': 'Digest username="rambo", realm="https://localhost:3000/api/v1/digestScheme", nonce="7ypf/xlj9XXwfDPEoM4URrv/xwf94BcCAzFZH4GiTo0v", uri="/api/v1/digestScheme", response="adc91a91ffaa68815d5a5d8e4ed8d9e9", opaque="cmFtYm86c29sZGllcjphcm15"'
    }
  };

  const responseBody = {
    authenticated: true
  };

  const getScope = nock(requestURL, requestGetHeaders)
    .get(digestSchemeUrl)
    .reply(200, responseBody);

  const ok = responseCodes['ok'];
  const req = request.agent(requestURL);
  req
    .get(digestSchemeUrl)
    .set({
      'Authorization': 'Digest username="rambo", realm="https://localhost:3000/api/v1/digestScheme", nonce="7ypf/xlj9XXwfDPEoM4URrv/xwf94BcCAzFZH4GiTo0v", uri="/api/v1/digestScheme", response="adc91a91ffaa68815d5a5d8e4ed8d9e9", opaque="cmFtYm86c29sZGllcjphcm15"'
    })
    .expect(res => {
      assert.is(res.status, ok, '200 Status Code should be returned');
      assert.truthy(res.body.authenticated);
    })
    .end(() => {
      assert.is(getScope.isDone(), true, `GET ${digestSchemeUrl} Nock Spy called`);
      assert.end();
    });
});
