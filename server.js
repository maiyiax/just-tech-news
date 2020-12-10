
const express = require('express');
const routes = require('./controllers');
const sequelize = require('./config/connection');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const sess = {
    secret: 'Super secret secret',
    cookie: {},
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
        db: sequelize
    })
};

// set up Handlebars.js
const exphbs = require('express-handlebars');
const hbs = exphbs.create({});

const app = express();

// Heroku, and similar production environments, can't reserve the port 3001 for us and will provide a port dynamically. So we use the process.env.PORT variable to instruct the app that if the production environment provides a port for us, to use that one
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//The express.static() method is a built-in Express.js middleware function that can take all of the contents of a folder and serve them as static assets
app.use(express.static(path.join(__dirname, 'public')));

// turn on routes
app.use(routes);

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(session(sess));
// ======================================================================================================================================================================== //
//| The "sync" part means that this is Sequelize taking the models and connecting them to associated database tables. If it doesn't find a table, it'll create it for you! |//
// ======================================================================================================================================================================== //

// turn on connection to db and server
// force: true is equivalent to sql 'DROP TABLE IF EXISTS'
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => console.log('Now listening'));
});