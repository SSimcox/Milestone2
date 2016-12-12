/**
 * Created by Steven on 12/8/2016.
 */
//DATABASE
var connectionString = 'postgres://postgres:@localhost:5432/scoreboard';
var pgp = require('pg-promise')();
var db = pgp(connectionString);

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
            return res.render('scoreboard',{scores:data, user: req.user._json});
        }).catch(function(err){
            console.log("error in fetching scores: " + err);
            return res.redirect('/');
    })
}

function addScore(req,res,next){
    //console.log(req.session.cookie);
    console.log(req.session.passport);
    //console.log(req.user);
   // if(!req.user){req.user = req.session.passport.user}
    console.log(typeof req.body.score);
    console.log(req.body.score);
    db.none('insert into scores(userid, score) values($1,$2)',[req.user.id,parseInt(req.body.score)])
        .then(function(){
            console.log("finished inserting");
            return res.render('game',{ user: req.user._json});
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