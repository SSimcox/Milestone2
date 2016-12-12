/**
 * Created by Steven on 12/8/2016.
 */

var express = require('express');
var route = express.Router();
var db = require('../database/queries');

route.get('/',function(req,res){
    res.render('index');
});

route.get('/game',function(req,res){
    res.render('game', {user:req.user._json});
});

route.post('/game',db.addScore);

route.get('/highScores',db.getHighScores);


module.exports = route;