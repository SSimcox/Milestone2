/**
 * Created by Steven on 12/8/2016.
 */
//DATABASE
var connectionString = 'postgres://postgres:@localhost:5432/scoreboard';
var pgp = require('pg-promise')();
var db = pgp(connectionString);
var moment = require('moment');

function addUser(req,res,next){
    db.none('insert into users(authID,username,email) values($1,$2,$3)')
        .then(function(){
            return res.render('game');
        }).catch(function(err){
            return res.redirect('/');
    });
}

function getHighScores(req,res,next){
    db.any('select * from scores order by score desc')
        .then(function(data){
            data.forEach(function(d){d.created = moment(d.created).format('MMM Do YYYY');});
            return res.render('scoreboard',{scores:data, user: req.user._json});
        }).catch(function(err){
            console.log("error in fetching scores: " + err);
            return res.redirect('/');
    })
}

function addScore(req,res,next){
    db.none('insert into scores(userid, score, difficulty) values((select displayName from users where authID=$1 ),$2,$3)',[req.user.id,parseInt(req.body.score),req.body.difficulty])
        .then(function(){
            console.log("finished inserting");
            if(req.body.continue == "true")
                return res.render('game',{ user: req.user._json});
            else
                res.redirect('/highScores');
        }).catch(function(err){
        console.log("Got an error inserting the score: " + err);
        return res.render('game',{ user: req.user._json});
    });
}

function findOrCreate(profile,func){
    //insert data into db,
    db.none('insert into users(authID, displayName, email, avatarURL) values($1,$2,$3,$4)',[profile.id,profile._json.displayName || profile._json.emails[0].value,profile._json.emails[0].value,profile._json.image.url])
        .then(function(){
           return func(false,profile);
        }).catch(function(err){
        if(err.code == '23505') {
            return func(false, profile);
        }
        else {
            return func(err, false);
        }
    })

}

module.exports =
{
    findOrCreate: findOrCreate,
    addUser: addUser,
    addScore: addScore,
    getHighScores: getHighScores
}