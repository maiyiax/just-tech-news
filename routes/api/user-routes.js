//  create five routes that will work with the User model to perform CRUD operations.

const router = require('express').Router();
const { User } = require('../../models');

// ========================================================================================================================================= //
//| when the client makes a GET request to /api/users, we will select all users from the user table in the database and send it back as JSON |//
// ========================================================================================================================================= //

// GET /api/users
router.get('/', (req, res) => {
    // Access our User model and run .findAll() method (equivalent to SQL query SELET * FROM users)
    User.findAll({
        // protect the user passwords by excluding them from returning
        attributes: { exclude: ['password'] }
    })
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            // 500 =  internal server error
            res.status(500).json(err);
        });
});


// ============================================================================================ //
//| returns a single user based on id equivalent to SQL query SELECT * FROM users WHERE id = 1 |//
// ============================================================================================ //

// GET /api/users/1 
router.get('/:id', (req, res) => {
    User.findOne({
        attributes: { exclude: ['password'] },
        where: {
            id: req.params.id
        }
    })
        .then(dbUserData => {
            if (!dbUserData) {
                // 404 = not found error
                res.status(404).json({ message: 'No user found with this id' });
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });

});


// ================================================================================================================================================= //
//| Inserts a user, equivalent to SQL 'INSERT INTO users (username, email, password) VALUES ("Lernantino", "lernantino@gmail.com", "password1234")' |//
// ================================================================================================================================================= //

// POST /api/users
router.post('/', (req, res) => {
    // expects {username: 'Lernantino', email: 'Lernantino@gmail.com, password: 'password1234'}
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});


// ================================================================================================================================================================= //
//| updates existing data, equivalent to SQL 'UPDATE users SET username = "Lernantino", email = "lernantino@gmail.com", password = "newPassword1234" WHERE id = 1;' |//
// ================================================================================================================================================================= //

// PUT /api/users/1 
router.put('/:id', (req, res) => {
    // expects {username: 'Lernantino', email: 'lernantino@gmail.com', password: 'password1234'}

    // if req.body has exact key/value pairs to match the model, you can just use `req.body` instead
    // pass individualHOoks in req.body instead to only update what's passed through
    User.update(req.body, {
        individualHooks: true,
        where: {
            id: req.params.id
        }
    })
    .then(dbUserData => {
        if (!dbUserData[0]) {
            res.status(404).json({ message: 'No user found with this id' });
            return;
        }
        res.json(dbUserData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});



// DELETE /api/users/1
router.delete('/:id', (req, res) => {
    User.destroy({
        where: {
            id: req.params.id
        }
    })
    .then(dbUserData => {
        if (!dbUserData) {
            res.status(404).json({ message: 'No User found with this id' });
            return;
        }
        res.json(dbUserData);
    });
});

module.exports = router;