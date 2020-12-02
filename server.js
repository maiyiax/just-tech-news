
const express = require('express');
const routes = require('./routes');
const sequelize = require('./config/connection');

const app = express();

// Heroku, and similar production environments, can't reserve the port 3001 for us and will provide a port dynamically. So we use the process.env.PORT variable to instruct the app that if the production environment provides a port for us, to use that one
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// turn on routes
app.use(routes);


// ======================================================================================================================================================================== //
//| The "sync" part means that this is Sequelize taking the models and connecting them to associated database tables. If it doesn't find a table, it'll create it for you! |//
// ======================================================================================================================================================================== //

// turn on connection to db and server
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => console.log('Now listening'));
});