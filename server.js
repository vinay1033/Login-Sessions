
const express = require("express");
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const path = require('path');
// const ejs = require('ejs');
const app = express();
const UserModel = require("./models/User");

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB

    mongoose.connect('mongodb+srv://admin:admin@sessions.ayi1u.mongodb.net/Sessions?retryWrites=true&w=majority')
    .then(() => {
        console.log("Connected to MongoDB successfully");
    })
    .catch((error) => {
        console.error("Connection error:", error);
    });



// Configure MongoDB session store
const store = new MongoDBSession({
    uri: 'mongodb+srv://admin:admin@sessions.ayi1u.mongodb.net/Sessions?retryWrites=true&w=majority',
    collection: 'mySessions'
});

store.on('error', function(error) {
    console.log("Session store error:", error);
});

// Configure express-session middleware
app.use(session({
    secret: 'sign it',
    resave: false,
    saveUninitialized: false,
    store: store
}));


// middleware
const isAuth=(req,res,next)=>{
    if(req.session.isAuth){
        next()
    }
    else{
        res.redirect("/login")
    }
}


//  routes
app.get("/", (req, res) => {
    res.render("Home");
});

app.get("/login", (req, res) => {
    res.render("Login");
});

app.get("/index",isAuth, (req, res) => {
    res.render("index");
});


app.post("/login", async(req, res) => {
    const {email,password}=req.body;

    const user=await UserModel.findOne({email});

    if(!user){
        return res.redirect('/login');
    }

    const isMatch=await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.redirect("/login");
    }

    req.session.isAuth=true
    res.redirect("/index")
});


app.get("/register", (req, res) => {
    res.render("Register");
});

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    let user = await UserModel.findOne({ email });
    if (user) {
        return res.redirect('/register');  
    }

    const hashPass = await bcrypt.hash(password, 12);
    user = new UserModel({
        username,
        email,
        password: hashPass 
    });

    await user.save();

    res.redirect("/login");
});


app.listen(5000, () => console.log("Listening on port 5000"));
