var util = require('util');
var async = require('async')

//Betfair account data
var login = process.env['BF_LOGIN'] || "nobody";
var password = process.env['BF_PASSWORD'] || "password";

//HTTPS tuning, number of concurrent HTTPS connections to use
var https = require('https');
https.globalAgent.maxSockets = 5;

//Create session to Betfair
var betfairSport = require('../index.js');
var session = betfairSport.newSession(login, password);

var marketId;
var selectionId;

async.series({
    // Login to Betfair
    login : function(cb) {
        console.log('Logging in to Betfair...');
        session.open(function onLoginFinished(err, res) {
            if (err) {
                console.log('Login error', err);
                process.exit(-1);
            }
            console.log('Logged in OK');
            cb(null, "OK");
        });
    },

    // invoke getAllMArkets at uk exchange for tennis
    // We will pick a single market with the latest start time
    getAllMarkets : function(cb) {
        console.log('Get available tennis matches');

        // eventTypeIds 1-soccer, 2-tennis
        var inv = session.getAllMarkets({
            eventTypeIds : [ 2 ]
        });
        inv.execute(function(err, res) {
            console.log('action:', res.action, 'error:', err, 'duration:', res
                    .duration() / 1000);
            if (err) {
                cb("Error in getAllMarkets", null);
            }
            //console.log(res.result);

            // sort by marketId descending
            res.result.marketData.sort(function(first, second) {
                return second.eventDate - first.eventDate
            });

            for ( var index in res.result.marketData) {
                var market = res.result.marketData[index];
                if (market.marketName != 'Match Odds')
                    continue; 
                var path = market.menuPath.replace(/\\Tennis\\Group A\\/g, '')
                marketId = market.marketId;
                console.log("market to test betting:",marketId,path);
                break;
            }
            cb(null, "OK");
        });
    },

    // invoke getMarketPircesCompressed on the single market
    // we first check if market is inPlay, if yes test is aborted
    // then we need to know selectionId for players in order to make bets
    getMarketPricesCompressed : function(cb) {
        console.log('Call getMarketPricesCompressed for marketId="%s"',
                marketId);
        var inv = session.getMarketPricesCompressed(marketId);
        inv.execute(function(err, res) {
            console.log('action:', res.action, 'error:', err,
                    'duration:', res.duration() / 1000);
            if (err) {
                cb("Error in getMarketPricesCompressed", null);
            }
            //console.log(util.inspect(res.result, false, 10));

            var market = res.result.marketPrices;
            console.log("marketId:", market.marketId);
            console.log("currency:", market.currency);
            console.log("marketStatus:", market.marketStatus);
            console.log("inPlayDelay:", market.inPlayDelay);
            if(parseInt(market.inPlayDelay)>0) {
                cb("Market is inPlay", null);
                return;
            }

            // print players info
            for ( var playerIndex = 0; playerIndex < market.runners.length; ++playerIndex) {
                console.log("player %s", playerIndex);
                var runner = market.runners[playerIndex];
                console.log("\tselectionId:", runner.selectionId);
                console.log("\tlastPriceMatched:", runner.lastPriceMatched);
            }
            // chose the selectionId of the player that has bigger lastPriceMatched
            var player1 = market.runners[0];
            var player2 = market.runners[1];
            if( parseFloat(player1.lastPriceMatched) > parseFloat(player2.lastPriceMatched))
                selectionId = player1.selectionId;
            else
                selectionId = player2.selectionId;
            console.log("Will use selectionId %s for betting tests", selectionId);

            cb(null, "OK");
        });
    },

    // invoke placeBets to place LAY 5.0 for player1 at 1.01
    // maximum loss if matched is 0.05
    placeBets : function(cb) {
        console.log('Place a test lay bet');
        var bet = { 
                asianLineId: "0",
                betCategoryType: "E",
                betPersistenceType: "NONE",
                betType: "L",
                bspLiability: "0",
                marketId: marketId,
                price: "1.01",
                selectionId: selectionId,
                size: "5.00"
        }
        var inv = session.placeBets([bet]);
        inv.execute(function(err, res) {
            console.log('action:', res.action, 'error:', err,
                    'duration:', res.duration() / 1000);
            if (err) {
                cb("Error in placeBets", null);
            }
            console.log(res.result);
            cb(null, "OK");
        });
    },

    // Logout from Betfair
    logout : function(cb) {
        console.log('Logging out...');
        session.close(function(err, res) {
            console.log('Logged out OK');
            cb(null, "OK");
        });
    }
});