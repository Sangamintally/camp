//Yelp Camp v15
var express        = require("express"),
    app            = express(),
    mongoose       = require("mongoose"),  //MONGOOSE
    bodyParser     = require("body-parser"),
    flash          = require("connect-flash"), //FLASH
    passport       = require("passport"),
    LocalStratergy = require("passport-local"),
    methodOverride = require("method-override"), //for PUT, DELETE Routes
    Comment        = require("./models/comment"),
    Campground     = require("./models/campground"),
    User           = require("./models/user"),
    seedDB         = require("./seeds");
    
    
    
// Requiring Routes
var commentRoutes     = require("./routes/comments"),
    campgroundsRoutes = require("./routes/campgrounds"),
    indexRoutes       = require("./routes/index");
    
    

// seedDB();  //seed the DB

// In terminal-> export DATABASEURL=mongodb://localhost/yelp_camp_v14   //OFFLINE_DATABASE
mongoose.connect(process.env.DATABASEURL); 
// mongoose.connect("mongodb://<dbuser>:<dbpassword>@ds247058.mlab.com:47058/yelpcamp"); //ONLINE-DATABASE (mLab)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash()); //must be before passport configuration //FLASH
app.locals.moment = require('moment'); //Now moment is available for use in all of your view files via the variable named moment


//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Some random text doesn't matter what.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));  //from passport-local-mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//before routes, after all setup statements
//Note: app.use -> call the function on every single route
//So, we need to pass req.user to every route in the render statement via some object
app.use(function(req, res, next){
   res.locals.currentUser= req.user;
   res.locals.error    = req.flash("error");
   res.locals.success    = req.flash("success");
   //all middleware must have next(), else it will stop
   next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.get("*", function(req, res){
   res.redirect("/"); 
});



//listener
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("YC Server Started!"); 
});
