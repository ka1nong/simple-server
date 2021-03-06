var _ = require('lodash');
var request = require('request');
var logger = require('../logger');

exports = module.exports = function (req, res, next) {
    if (_.isEmpty(global.appEnv.authUrl)) {
        next(new Error('use auth check middleware need config authUrl in appEnv'));
        return;
    }

    _tokenCheck(function (err, pass, result) {
        if (err) {
            next(err);
            return;
        }
        
        if (!pass) {
            next(401);
            return;
        }

        req.username = result.username;
        next(null);
    });

    function _tokenCheck(callback) {
        var token = encodeURIComponent(req.body.token || req.headers['x-token'] || '');
        if (_.isEmpty(token)) {
            callback(null, false);
            return;
        }

        var url = global.appEnv.authUrl + '/svc/auth/token/check?token=' + token;
        var options = {
            method: 'GET',
            uri: url,
            json: true
        };

        request(options, function (err, res, result) {
            if (err) {
                callback(err);
                return;
            }

            if (res.statusCode === 200 && result.code === 0) {
                callback(null, true, result.result);
                return;
            }

            callback(null, false);
        });
    }
};