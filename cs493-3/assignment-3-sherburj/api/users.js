const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const validation = require('../lib/validation');


const { getBusinessesByOwnerId } = require('../models/business');
const { getReviewsByUserId } = require('../models/review');
const { getPhotosByUserId } = require('../models/photo');
const { UserSchema,
	insertNewUser,
	getUserByID,
        getUserByEmail,
	postUserLogin 
} = require('../models/user');

/*
 * Route to list all of a user's businesses.
 */
router.get('/:id/businesses', requireAuthentication, async (req, res, next) => {
if (req.user != req.params.id) {
	console.log(req.user);
    res.status(403).json({
      error: "Unauthorized to access that resource."
    });
	console.log(req.params.id);
  } else {
  try {
    const businesses = await 			getBusinessesByOwnerId(parseInt(req.params.id));
    if (businesses) {
      res.status(200).send({ businesses: businesses });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch businesses.  Please try again later."
    });
  }
}
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:id/reviews', requireAuthentication, async (req, res, next) => {
  if (req.user != req.params.id) {
	console.log(req.user);
    res.status(403).json({
      error: "Unauthorized to access that resource."
    });
	console.log(req.params.id);
  } else {
  try {
    const reviews = await getReviewsByUserId(parseInt(req.params.id));
    if (reviews) {
      res.status(200).send({ reviews: reviews });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch reviews.  Please try again later."
    });
  }
}
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:id/photos', requireAuthentication, async (req, res, next) => {
if (req.user != req.params.id) {
	console.log(req.user);
    res.status(403).json({
      error: "Unauthorized to access that resource."
    });
	console.log(req.params.id);
  } else {
  try {
    const photos = await getPhotosByUserId(parseInt(req.params.id));
    if (photos) {
      res.status(200).send({ photos: photos });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch photos.  Please try again later."
    });
  }
}
});

/*******************************************************************************************************/

/*
 * Route to create a new user.
 */
router.post('/', function (req, res) {
  const mysqlPool = req.app.locals.mysqlPool;
  if (validation.validateAgainstSchema(req.body, UserSchema)) {
   try{
    const id = insertNewUser(req.body);
        res.status(201).send({
          id: id,
          links: {
            user: `/users/${id}`
          }
        });
  }catch(err) {
	console.error(err);
        res.status(500).json({
          error: "Failed to insert new user."
        });
      }
  } else {
    res.status(400).json({
      error: "Request doesn't contain a valid user."
    });
  }
});

/*
 * Route for user login.
 */
router.post('/login', async (req, res) => {
try{
const userr = await getUserByEmail(req.body.email);
  if (req.body && req.body.email && req.body.password) {
    getUserByEmail(req.body.email, true)
      .then((user) => {
        if (user) {
          return bcrypt.compare(req.body.password, user.password);
        } else {
          return Promise.reject(401);
        }
      })
      .then((loginSuccessful) => {
        if (loginSuccessful) {
          return generateAuthToken(userr.id);
        } else {
          return Promise.reject(401);
        }
      })
      .then((token) => {
        res.status(200).json({
          token: token
        });
      })  
} else {
    res.status(400).json({
      error: "Request needs a userID and password."
    })
  }
      }catch(err) {
        if (err === 401) {
          res.status(401).json({
            error: "Invalid credentials."
          });
        } else {
	  console.error(err);
          res.status(500).json({
            error: "Failed to fetch user."
          });
        }
      }

});



/*
 * Route to delete a user.
 */
router.delete('/:id', requireAuthentication, function (req, res, next) {
  const id = parseInt(req.params.id);
  if (req.user != req.params.id) {
    res.status(403).json({
      error: "Unauthorized to access that resource."
    });
  } else {
    deleteUserByID(id)
      .then((deleteSuccessful) => {
        if (deleteSuccessful) {
          res.status(204).end();
        } else {
          next();
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: "Unable to delete user."
        });
      });
    }
});



router.get('/:id', requireAuthentication, async (req, res, next) => {
if (req.user != req.params.id) {
	console.log(req.user);
    res.status(403).json({
      error: "Unauthorized to access that resource."
    });
	console.log(req.params.id);
  } else {
  try {
    const user = await getUserByID(parseInt(req.params.id));
    if (user) {
	const userValues = {
	  id: user.id,
          name: user.name,
          email: user.email,
	  admin: user.admin,
        };
      res.status(200).send({ user: userValues });
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch photos.  Please try again later."
    });
  }
}
});


router.put('/:userID', function (req, res, next) {
  const userID = parseInt(req.params.userID);
  if (validation.validateAgainstSchema(req.body, UserSchema)) {
    updateUserByID(userID, req.body)
      .then((updateSuccessful) => {
        if (updateSuccessful) {
          res.status(200).json({
            links: {
              userID: `/users/${userID}`
            }
          });
        } else {
          next();
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: "Unable to update user."
        });
      });
  } else {
    res.status(400).json({
      error: "Please fill out all required fields."
    });
  }
});




module.exports = router;
