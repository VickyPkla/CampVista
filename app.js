if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require("express");
const app = express();
const path = require("path")
const methodOverride = require('method-override')
const mongoose = require("mongoose")
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')

const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')

mongoose.connect("mongodb://localhost:27017/campvista");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

const sessionConfig = {
    secret: 'temporary',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session()) // Make sure to define after defining session.
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser()) 
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user;
    next();
})

app.use(express.urlencoded({extended : true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public'))) // Organising the codes into seaprate files for readability
app.use(mongoSanitize())

app.engine('ejs', ejsMate) // For layouts and partials
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes handler
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes)

app.get('/',(req, res) => {
    res.render('home.ejs')
})

app.use('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    
    const {statusCode = 500} = err;
    if(!err.message) err.message = "Something went wrong"
    res.status(statusCode).render('error', {err});
})

app.listen(3000, () => {
    console.log("Listening on port 3000");
})