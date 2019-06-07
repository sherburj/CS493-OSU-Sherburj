const router = require('express').Router();
const { getDBReference } = require("../lib/mongo");
const ObjectID = require('mongodb').ObjectID;

exports.router = router;

const { businesses } = require('./businesses');
const { reviews } = require('./reviews');
const { photos } = require('./photos');



async function getPhotoByUid(id) {
  const db = getDBReference();
  const collection = db.collection("photos");
  const results = await collection
    .find({
      userid: id
    })
    .toArray();
  return results;
}


async function getBusiByUid(id) {
  const db = getDBReference();
  const collection = db.collection("businesses");
  const results = await collection
    .find({
      ownerid: id
    })
    .toArray();
  return results;
}

async function getReviByUid(id) {
  const db = getDBReference();
  const collection = db.collection("reviews");
  const results = await collection
    .find({
      userid: id
    })
    .toArray();
  return results;
}




/*
 * Route to list all of a user's businesses.
 */
router.get("/:userid", async (req, res, next) => {
  try {
    const user = await getBusiByUid(parseInt(req.params.userid));
    if (user) {
      res.status(200).send(user);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to fetch user's businesses."
    });
  }
  
});


/*
 * Route to list all of a user's reviews.
 */
router.get("/:userid/reviews", async (req, res, next) => {
  try {
    const user = await getReviByUid(parseInt(req.params.userid));
    if (user) {
      res.status(200).send(user);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to fetch user's reviews."
    });
  }
  
});


/*
 * Route to list all of a user's photos.
 */
router.get("/:userid/photos", async (req, res, next) => {
  try {
    const user = await getPhotoByUid(parseInt(req.params.userid));
    if (user) {
      res.status(200).send(user);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to fetch user's photos."
    });
  }
  
});


