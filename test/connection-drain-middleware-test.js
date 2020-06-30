'use strict';

describe('Connection Drain Middleware Test', function () {
    const chai = require('chai');
    const expect = chai.expect;
    const DummyLogger = require('./utils/dummy-logger');
    const ExpressMock = require('./utils/express-mock');
    const sinon = require('sinon');

    const ConnectionDrainMiddleware = require('../connection-drain-middleware');

    describe('1. New Connections Count', () => {

        it('1.1 When initialize middleware without newClientsCfg then default value is created', function () {
            const {app} = ExpressMock.create();
            const connectionDrainMiddleware = new ConnectionDrainMiddleware(app, new DummyLogger())

            expect(connectionDrainMiddleware.newClientsCfg).to.be.eql({enabled: false, intervalSeconds: 10})
        });

        it('2. When initialize middleware with a specific newClientsIntervalSeconds then that value should be setted', function () {
            const {app} = ExpressMock.create();
            const newClientsCfg = {enabled: true, intervalSeconds: 4};
            const connectionDrainMiddleware = new ConnectionDrainMiddleware(app, new DummyLogger(), {newClientsCfg})

            expect(connectionDrainMiddleware.newClientsCfg).to.be.eql(newClientsCfg)
        });

        it('3. When _keepAliveBreakMiddleware is called with a new connection of undefined CI then clientConnections should be added as unknonw', function () {
            const {app, req, res, next} = ExpressMock.create();
            const newClientsCfg = {enabled: true, intervalSeconds: 4};

            req.socket = {_handle: sinon.stub()};
            req.connection = { server: { on: sinon.stub() }};

            const connectionDrainMiddleware = new ConnectionDrainMiddleware(app, new DummyLogger(), {newClientsCfg})

            expect(connectionDrainMiddleware.clientConnections).to.be.eql({})

            connectionDrainMiddleware._keepAliveBreakMiddleware(req, res, next);

            expect(connectionDrainMiddleware.clientConnections).to.be.eql({'unknown': 1})
        });

        it('4. When _keepAliveBreakMiddleware is called with a new connection of specific CI then clientConnections should be added with that name', function () {
            const {app, req, res, next} = ExpressMock.create({query: {ci: "test"}});
            const newClientsCfg = {enabled: true, intervalSeconds: 4};

            req.socket = {_handle: sinon.stub()};
            req.connection = { server: { on: sinon.stub() }};

            const connectionDrainMiddleware = new ConnectionDrainMiddleware(app, new DummyLogger(), {newClientsCfg})

            expect(connectionDrainMiddleware.clientConnections).to.be.eql({})

            connectionDrainMiddleware._keepAliveBreakMiddleware(req, res, next);

            expect(connectionDrainMiddleware.clientConnections).to.be.eql({'test': 1})
        });

        it('5. When _keepAliveBreakMiddleware is called with an existent CI then clientConnections should be count the new connection', function () {
            const {app, req, res, next} = ExpressMock.create({query: {ci: "test"}});
            const newClientsCfg = {enabled: true, intervalSeconds: 4};

            req.socket = {_handle: {fd: 1}};
            req.connection = { server: { on: sinon.stub() }};

            const connectionDrainMiddleware = new ConnectionDrainMiddleware(app, new DummyLogger(), {newClientsCfg})

            expect(connectionDrainMiddleware.clientConnections).to.be.eql({})

            connectionDrainMiddleware._keepAliveBreakMiddleware(req, res, next);

            expect(connectionDrainMiddleware.clientConnections).to.be.eql({'test': 1})

            req.socket = {_handle: {fd: 2}};
            connectionDrainMiddleware._keepAliveBreakMiddleware(req, res, next);

            expect(connectionDrainMiddleware.clientConnections).to.be.eql({'test': 2})
        });

        it('6. When call logNewConnections should logs the ci and count and then reset the counter', function () {
            const {app, req, res, next} = ExpressMock.create({query: {ci: "test"}});
            const newClientsCfg = {enabled: true, intervalSeconds: 4};
            const dummyLogger = new DummyLogger();
            dummyLogger.info = sinon.stub();

            req.socket = {_handle: {fd: 1}};
            req.connection = { server: { on: sinon.stub() }};

            const connectionDrainMiddleware = new ConnectionDrainMiddleware(app, dummyLogger, {newClientsCfg})

            expect(connectionDrainMiddleware.clientConnections).to.be.eql({})

            connectionDrainMiddleware._keepAliveBreakMiddleware(req, res, next);

            expect(connectionDrainMiddleware.clientConnections).to.be.eql({'test': 1})

            connectionDrainMiddleware._logNewConnections()
            sinon.assert.calledWith(dummyLogger.info, '%s LAST NEW CONNECTIONS: ci: %s count: %s', 'connection-drain-helper', 'test', 1)
            expect(connectionDrainMiddleware.clientConnections).to.be.eql({'test': 0})
        });

    });
});
