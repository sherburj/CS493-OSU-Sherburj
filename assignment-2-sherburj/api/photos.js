const router = require('express').Router();
const validation = require('../lib/validation');
const { getDBReference } = require("../lib/mongo");
const ObjectID = require('mongodb').ObjectID;

const photos = require('../data/photos');

exports.router = router;
exports.photos = photos;



async function deletePhoto(id) {
  const db = getDBReference();
  const collection = db.collection("photos");
  const result = await collection.deleteOne(
    {"_id": ObjectID(id) }
  );
  return result;
}

postPhoto = async function(photo) {
  const db = getDBReference();
  const collection = db.collection("photos");
  const result = await collection.insertOne(photo);
  return result.insertedId;
};


async function getPhoto(id) {
  const db = getDBReference();
  const collection = db.collection("photos");
  const results = await collection
    .find({
      _id: new ObjectID(id)
    })
    .toArray();
  return results[0];
}


async function putPhoto(id, photo) {
  const db = getDBReference();
  const collection = db.collection("photos");
  const result = await collection.replaceOne(
    { "_id": ObjectID(id) },
    { "ownerid": photo.ownerid, "businessid": photo.businessid, "caption": photo.caption }
    );
  return result;
}



/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false }
};


/*
 * Route to create a new photo.
 */
router.post("/", async (req, res) => {
  if (validation.validateAgainstSchema(req.body, photoSchema)) {
    try {
      const id = await postPhoto(req.body);
      res.status(201).send({
        id: id
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Failed to insert photo.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      err: "Request body does not contain a valid Photo."
    });
  }
});


/*
 * Route to fetch info about a specific photo.
 */
router.get("/:photoid", async (req, res, next) => {
  try {
    const photo = await getPhoto(req.params.photoid);
    if (photo) {
      res.status(200).send(photo);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to fetch photo."
    });
  }
  
});


/*
 * Route to update a photo.
 */
router.put("/:photoid", async(req, res, next) => {
  try {
    const photo = await putPhoto(req.params.photoid, req.body);
    if (photo) {
      res.status(200).send(photo);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to update photo."
    })
  }

});


/*
 * Route to delete a photo.
 */
router.delete("/:photoid", async (req, res, next) => {
  try {
    const photo = await deletePhoto(req.params.photoid);
    if (photo) {
      res.status(200).send(photo);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: "Unable to delete photo."
    })
  }

});


