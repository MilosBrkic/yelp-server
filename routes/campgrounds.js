var express = require('express');
var router = express.Router();
var campground = require('../models/campground');
var middleware = require('../middleware');

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// INDEX - show all campgrounds
router.get('/', function(req, res) {
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		// Get all campgrounds from DB
		campground.find({ name: regex }, function(err, allCampgrounds) {
			if (err) {
				console.log(err);
			} else {
				res.render('campgrounds/index', { campgrounds: allCampgrounds, currentUser: req.user });
			}
		});
	} else {
		// Get all campgrounds from DB
		campground.find({}, function(err, allCampgrounds) {
			if (err) {
				console.log(err);
			} else {
				res.render('campgrounds/index', { campgrounds: allCampgrounds, currentUser: req.user });
			}
		});
	}
});

router.get('/searching', function(req, res){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		// Get searched campgrounds from DB
		campground.find({ name: regex }, function(err, allCampgrounds) {
			if (err) {
				console.log(err);
			} else {
				res.send(allCampgrounds);
			}
		});
   });

// CREATE - add new campground to DB

router.post('/', middleware.isLoggedIn, function(req, res) {
	var name = req.body.name;
	var image = req.body.image;
	var price = req.body.price;
	var desc = req.body.description;
	console.log(req.user);
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = { name: name, price: price, image: image, description: desc, author: author };
	// create a new campground and save to database
	campground.create(newCampground, function(err, newlyCreated) {
		if (err) {
			console.log(err);
		} else {
			//console.log(newlyCreated);
			res.redirect('/campgrounds');
		}
	});
});

// NEW - make new campground

router.get('/new', middleware.isLoggedIn, function(req, res) {
	res.render('campgrounds/new');
});

//SHOW - shows more info about one campground

router.get('/:id', function(req, res) {
	//find the campground with provided ID and show that campground
	campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground) {
		/*if (err) {
			console.log(err);
		} else {
			console.log(foundCampground);
			res.render('campgrounds/show', { campground: foundCampground });
		}*/
		res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.status(200); 
		//console.log(foundCampground);      
        res.send({campground: foundCampground});
	});
});

//EDIT CAMPGROUNND ROUTE

router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
	campground.findById(req.params.id, function(err, foundCampground) {
		res.render('campgrounds/edit', { campground: foundCampground });
	});
});

//UPDATE CAMPGROUND ROUTEE

router.put('/:id', middleware.checkCampgroundOwnership, function(req, res) {
	//finnd and update campground
	campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updaedCampground) {
		if (err) {
			res.redirect('/campgrounds');
		} else {
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});

//DESTROY CAMPGROUND ROUTE

router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res) {
	campground.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			res.redirect('/campgrounds');
		} else {
			res.redirect('/campgrounds');
		}
	});
});

module.exports = router;
