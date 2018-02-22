var mongoose   = require("mongoose");
var Campground = require("./models/campground");
var Comment    = require("./models/comment");

var data = [
    {
        name: "Cloud's Rest",
        image: "https://images.unsplash.com/photo-1504632348771-974e356b80af?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=c611850d7b8a8fb73cad8dbde80633b4&auto=format&fit=crop&w=1650&q=80",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    },
    {
        name: "Granite Hill",
        image: "https://images.unsplash.com/photo-1501950952862-f7f6f7c2ee33?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2cbd13895964dccfebb0633af3b5e597&auto=format&fit=crop&w=1649&q=80",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    },
    {
        name: "Pejdi Net",
        image: "https://images.unsplash.com/photo-1469292055053-a5ebd1bfc2a6?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=e3593bc8d91e96e333619bfa6a7756f0&auto=format&fit=crop&w=1650&q=80",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
];

function seedDB(){
    //remove all campgrounds
    Campground.remove({}, function(err){
        if(err){
            console.log(err);
        } 
        else {
            console.log("removed campgrounds!");
           
            //add few campgrounds
            data.forEach(function(seed){
                Campground.create(seed, function(err, campground){
                    if(err){
                        console.log(err);
                    } else {
                        console.log("Added a campground");
                        
                        //ADD COMMENTS to each campgrounds
                        Comment.create(
                            {
                                text: "This place is great but with no internet.",
                                author: "Prince"
                            }, function(err, comment){
                                if(err){
                                    console.log(err);
                                } else {
                                    campground.comments.push(comment._id);
                                    campground.save(); ///---------------///
                                    console.log("Created new comment.");
                                }
                            });
                    }
                });
            });
        }
    });
}

module.exports = seedDB;