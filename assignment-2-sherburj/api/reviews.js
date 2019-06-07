const router = require('express').Router();
const validation = require('../lib/validation');
const { getDBReference } = require("../lib/mongo");
const ObjectID = require('mongodb').ObjectID;

const reviews = require('../data/reviews');

exports.router = router;
exports.reviews = reviews;


async function deleteRevi(id) {
  const db = getDBReference();
  const collection = db.collection("reviews");
  const result = await collection.deleteOne(
    {"_id": ObjectID(id) }
  );
  return result;
}


postNewRev = async function(review) {
  const db = getDBReference();
  const collection = db.collection("reviews");
  const result = await collection.insertOne(review);
  return result.insertedId;
};

async function getRevi(id) {
  const db = getDBReference();
  const collection = db.collection("reviews");
  const results = await collection
    .find({
      _id: new ObjectID(id)
    })
    .toArray();
  return results[0];
}

async function putRevi(id, review) {
  const db = getDBReference();
  const collection = db.collection("reviews");
  const result = await collection.replaceOne(
    { "_id": ObjectID(id) },
    { "userid": review.userid, "businessid": review.businessid, "dollars": review.dollars, "stars": review.stars, "review": review.review }
    );
  return result;
}





/*
 * Schema describing required/optional fields of a review object.
 */
const reviewSchema = {
  userid: { required: true },
  businessid: { required: true },
  dollars: { required: true },
  stars: { required: true },
  review: { required: false }
};


/*
 * Route to create a new review.
 */
router.post("/", async (req, res) => {
  if (validation.validateAgainstSchema(req.body, reviewSchema)) {
    try {
      const id = await postNewRev(req.body);
      res.status(201).send({
        id: id
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Failed to insert review.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      err: "Request body does not contain a valid Review."
    });
  }
});



/*
 * Route to fetch info about a specific review.
 */
router.get("/:reviewid", async (req, res, next) => {
  try {
    const review = await getRevi(req.params.reviewid);
    if (review) {
      res.status(200).send(review);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to fetch review."
    });
  }
  
});



/*
 * Route to update a review.
 */
router.put("/:reviewid", async(req, res, next) => {
  try {
    const review = await putRevi(req.params.reviewid, req.body);
    if (review) {
      res.status(200).send(review);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to update review."
    })
  }

});



/*
 * Route to delete a review.
 */
router.delete("/:reviewid", async (req, res, next) => {
  try {
    const review = await deleteRevi(req.params.reviewid);
    if (review) {
      res.status(200).send(review);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to delete review."
    })
  }

});


