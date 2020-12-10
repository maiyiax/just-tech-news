//  create five routes that will work with the User model to perform CRUD operations.

const router = require('express').Router();
const { User, Post, Vote, Comment } = require('../../models');

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
        },
        include: [
            {
                model: Post,
                attributes: ['id', 'title', 'post_url', 'created_at']
            },
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'created_at'],
                include: {
                    model: Post,
                    attributes: ['title']
                }
            },
            {
                model: Post,
                attributes: ['title'],
                through: Vote,
                as: 'voted_posts'
            }
        ]
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
//| Creates a user, equivalent to SQL 'INSERT INTO users (username, email, password) VALUES ("Lernantino", "lernantino@gmail.com", "password1234")' |//
// ================================================================================================================================================= //

// POST /api/users
router.post('/', (req, res) => {
    // expects {username: 'Lernantino', email: 'Lernantino@gmail.com, password: 'password1234'}
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
        .then(dbUserData => {
            // We want to make sure the session is created before we send the response back, so we're wrapping the variables in a callback. The req.session.save() method will initiate the creation of the session and then run the callback function once complete.
            req.session.save(() => {
                req.session.user_id = dbUserData.id;
                req.session.username = dbUserData.username;
                req.session.loggedIn = true;

                res.json(dbUserData);
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

// this route will be found at http://localhost:3001/api/users/login
router.post('/login', (req, res) => {
    // expects {email: 'lernantino@gmail.com', password: 'password1234'}
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(dbUserData => {
        if (!dbUserData) {
            // error 400 = client error, invalid request
            res.status(400).json({ message: 'No user with that email address!' });
            return;
        }

        //Verify User
        const validPassword = dbUserData.checkPassword(req.body.password);
        if (!validPassword) {
            res.status(400).json({ message: 'Incorrect password!' });
            return;
        }

        req.session.save(() => {
            // declare session variables
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;

            res.json({ user: dbUserData, message: 'You are now logged in!' })
        });
    });

});

router.post('/logout', (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
          res.status(204).end();
        });
      }
      else {
        res.status(404).end();
      }
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