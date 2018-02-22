var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware/index.js");
var geocoder = require('geocoder');
// var middleware = require("../middleware");  -> 
// will also require the index.js file, as that's the default if we require a dir, instead of a file


//INDEX Route -> Show all campgrounds.
router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search){ //FUZZY SEARCH
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        //get all campgrounds from db
        Campground.find({name: regex}, function(err, allCampgrounds){
            if(err){
                console.log("Error: ");
                console.log(err);
            }else{
                if(allCampgrounds.length < 1){
                    noMatch = "No campgrounds that match query, please try again!"
                }
                res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch});
            }
        });
    } else {
        //get all campgrounds from db
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                console.log("Error: ");
                console.log(err);
            }else{
                res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch});
            }
        });
    }
    
});




//CREATE Route -> Add new campground to DB
// router.post("/", middleware.isLoggedIn, function(req, res){
//     var name = req.body.name;  //since we used body-parser, we're able to use this line
//     var price = req.body.price;
//     var image = req.body.image; 
//     var desc = req.body.description; 
//     var author = {
//         id: req.user._id,
//         username: req.user.username
//     }
//     var newCampground = {name:name, image:image, description:desc, author:author, price: price};
    

//     Campground.create(newCampground, function(err, newlyCreated){
//         if(err){
//             console.log(err);
//         }else{
//             console.log("Newly created campground.");
//             console.log(newlyCreated); //this is retured from database, so this will have an id attatched to it as well.
//         }
//     });
    
//     res.redirect("/campgrounds");
// });



//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var price = req.body.price;
  geocoder.geocode(req.body.location, function (err, data) {
        if (err || data.status === 'ZERO_RESULTS') {
            if(!!data.message){
                console.log("data.message: CREATE " +data.message);
            }
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        if(data.results.length == 0 || data.status=='OVER_QUERY_LIMIT'){
            if(!!data.message){
                console.log("data.message: CREATE " +data.message);
            }
            req.flash('error', 'Something went wrong.');
            return res.redirect('back');
        }
        // eval(require('locus'));
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newCampground = {
            name: name, 
            image: image, 
            description: desc, 
            price: price, 
            author:author, 
            location: location, 
            lat: lat, 
            lng: lng
        };
        // Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                //redirect back to campgrounds page
                console.log(newlyCreated);
                res.redirect("/campgrounds");
            }
        });
      });
});






//NEW Route -> Show form to create new campground.
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});




//must be below(as order matters) /campgrounds/new as :id can be new and it will mess up the site
//SHOW Route -> shows more info about one campgrounds.
router.get("/:id", function(req, res){
    //find the campground with the provided ID and populate the comment thing
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found.");
            return res.redirect("back");
        } else {
             //render show template with that campground.
            res.render("campgrounds/show", {campground:foundCampground});
        }
    });
   
});


// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Item not found.");
            return res.redirect("back");
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});   
        }
    });
});





// UPDATE CAMPGROUND ROUTE
// router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
//   //Campground.findByIdAndUpdate(id, newUpdatedDetailsObj, callbackWhenUpdated)
//   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
//       if(err){
//           res.redirect("/campgrounds");
//       } else {
//           res.redirect("/campgrounds/"+req.params.id);
//       }
//   });
// });



// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || data.status === 'ZERO_RESULTS') {
            if(!!data.message){
                console.log("data.message: PUT " +data.message);
            }
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        if(data.results.length == 0 || data.status=='OVER_QUERY_LIMIT'){
            if(!!data.message){
                console.log("data.message: PUT " +data.message);
            }
            req.flash('error', 'Something went wrong.');
            return res.redirect('back');
        }
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newData = {
            name: req.body.name, 
            image: req.body.image, 
            description: req.body.description, 
            price: req.body.price, 
            location: location, 
            lat: lat, 
            lng: lng
        };
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});






// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/campgrounds");
       } else {
           res.redirect("/campgrounds");
       }
   });
});


//for fuzzy search - https://stackoverflow.com/questions/38421664/fuzzy-searching-with-mongodb
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};






module.exports = router;