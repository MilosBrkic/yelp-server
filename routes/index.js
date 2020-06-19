var express = require('express');
var router = express.Router();
var passport = require('passport');
var user = require('../models/user');
var campground = require('../models/campground');

//root route

router.get('/', function(req, res) {
	res.render('landing');
});

// register form foute

router.get('/register', function(req, res) {
	res.render('register');
});

// handle sign up logic

router.post('/register', function(req, res) {
	var newUser = new user({ username: req.body.username });
	user.register(newUser, req.body.password, function(err, user) {
		if (err) {
            return res.status(200).json(err);
		}
		passport.authenticate('local')(req, res, function() {
            res.status(200);
            return "uspesno registrovanje";
		});
	});
});

// show login form

router.get('/login', function(req, res) {
	res.render('login');
});

//handling login form

/*router.post('/login',passport.authenticate('local', {
        
		successRedirect: '/campgrounds',
		failureRedirect: '/login'
	}),
	function(req, res) {
        console.log("login");
        //res.header("Access-Control-Allow-Origin", "*");
        //res.header("Access-Control-Allow-Headers", "X-Requested-With");
    }
);*/

router.post('/login', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    passport.authenticate('local', function(error, user, info) {
        if(error) {
            return res.status(500).json(error);
        }
        if(!user) {
            return res.status(401).json(info.message);
        }
        res.json(user);
    })(req, res, next);
});


// logout

router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'Logged you out!');
	res.redirect('/campgrounds');
});

//api

// prikazi sve kampove
router.get('/api', function(req, res) {
    campground.find({}, function(err, allCampgrounds) {
        //res.status(200);
        //res.send({campgrounds: allCampgrounds, currentUser: req.user, a: null});
        if (err) {
            res.status(400);
        } else {
            res.status(200);
            res.send({campgrounds: allCampgrounds, currentUser: req.user, a: null});
        }
    });
});

//ubacivanje kampa
//http://localhost:3000/api?name=ime&image=https://ddl.rs/wp-content/uploads/2019/08/maldivi-plaza-insta.jpg&price=200&description=opis
router.post('/api', function(req, res) {
  
    var name = req.query.name;
    var image = req.query.image;
    var price = req.query.price;
    var desc = req.query.description;
    var author = {
        id: req.query.id,
        username: req.query.username
    };
    var newCampground = { name: name, price: price, image: image, description: desc, author: author };
    // create a new campground and save to database
    campground.create(newCampground, function(err, newlyCreated) {
        if (err) {
            console.log(err);
            res.status(400)
            return err;
        } 
    });
    res.status(200).json({status:"ok"});
});

//update
//http://localhost:3000/api/5e207ad4e4bb3313e083690e?name=plaza&price=300&description=proba&image=d
router.put('/api/:id', function(req, res) {
    console.log("update");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    campground.findByIdAndUpdate(req.params.id,
         {
            name: req.query.name,
            price: req.query.price,
            image: req.query.image,
            description: req.query.description
        }
        
    , function(err, updaedCampground) {
        if (err) {
            res.status(500).json({status:"error"});
        } else {
            res.status(200).json({status:"ok"});
        }
    });

});

//delete
router.delete('/api/:id', function(req, res) {
    console.log("delete");
    campground.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.status(500).json({status:"error"});
        } else {
            res.status(200).json({status:"ok"});
        }
    });
});


module.exports = router;
