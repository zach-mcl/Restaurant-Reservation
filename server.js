if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const port = 3000

const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require ('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const usrs = []

const createPassport = require('./passportConfig')
createPassport(
    passport,
    email => usrs.find(user => user.email === email),
    id => usrs.find(user => user.id === id)
)

app.use(express.static('public'))


app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//Login Pages

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name})
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
}))

//Registration pages

app.get('/register', (req, res) => {
    res.render('register.ejs')
})
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 8)
        usrs.push({
            id: Date.now().toString(),
            name: req.body.user,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    }catch{
        res.redirect('/register')
    }
    console.log(usrs)
})
app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/home')
    }
    next()
}

//Home Page

app.get('/home', (req, res) => {
    res.render('home.ejs')
}) 

//Console Log
app.listen(port, () => console.log(`Example app listening on port ${port}!`))