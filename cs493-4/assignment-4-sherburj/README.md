# Assignment 4

**Assignment due at 11:59pm on Monday 6/3/2019**

**Demo due by 5:00pm on Friday 6/14/2019**

The goal of this assignment is to incorporate file storage into our API and to start using RabbitMQ to do some basic offline processing.  There are a few parts to this assignment, as described below.

You are provided some starter code in this repository that uses MongoDB as a backing to implement a reduced subset of the businesses API we've been working with all term.  The starter code's API server is implemented in `server.js`, individual routes are modularized within the `api/` directory, and models for different resources are implemented in the `models/` directory.  In addition, there is a Docker Compose specification for the assignment, including database initialization scripts in `db-init/`.   This code should run out of the box with Docker Compose (it will use the environment variable values specified in `.env` by default).  There is also an OpenAPI specification in `public/openapi.yaml` that describes the endpoints and resources associated with this API, including the new endpoints you'll have to implement for this assignment.

## 1. Support photo file uploads

Your first task for the assignment is to modify the `POST /photos` endpoint to support actual photo uploads.  Specifically, you should update this endpoint to expect a multipart form-data body that contains a `file` field in addition to the fields currently supported by the endpoint (`businessid` and `caption`).  In requests to this endpoint, the `file` field should specifically contain raw binary data for an image file.  The endpoint should accept images in either the JPEG (`image/jpeg`) or PNG (`image/PNG`) format.  Files in any other format should result in the API server returning an error response.

## 2. Store uploaded photo data in GridFS

Once your API successfully accepts image file uploads to the `POST /photos` endpoint, you should modify the API to store those image files in GridFS in the MongoDB database that's already powering the API.  Photo metadata corresponding the image files (i.e. `businessid` and `caption`) should be stored alongside the files themselves.

Once your API is storing photo data in GridFS, it should no longer use the `images` MongoDB collection in which it currently stores photo metadata.  In other words, all data related to the `photos` collection should be stored in GridFS.  This will require you to update other API endpoints to work with the data stored in GridFS, including:
  * `GET /businesses/{id}`
  * `GET /photos/{id}`

## 3. Use RabbitMQ to generate new image sizes offline

Your next task in the assignment is to use RabbitMQ to facilitate the generation of multiple resized versions of every image offline (i.e. outside the normal API request/response cycle).  This task can be broken into a few separate steps:

  * **Start a RabbitMQ daemon running in a Docker container.**  You can do this with the [official RabbitMQ Docker image](https://hub.docker.com/_/rabbitmq/).  Update the Docker Compose specification in `docker-compose.yml` to launch this container automatically whenever launching the application using Compose.

  * **Turn your API server into a RabbitMQ producer.**  Specifically, each time a new photo is uploaded and stored into your GridFS database, your API server should add a new task to a RabbitMQ queue corresponding to the new photo that was just uploaded.  The task should contain information (e.g. the ID of the just-uploaded photo) that will eventually allow RabbitMQ consumers (which you'll write) to fetch the original image file out of GridFS.

  * **Implement a RabbitMQ consumer that generates multiple sizes for a given image.**  Your consumer should specifically use information from each message it processes to fetch a newly-uploaded photo file from GridFS and generate multiple smaller, resized versions of that photo file.  Specifically, the following sizes should be generated for each photo:
      * Maximum side (height or width) 1024px
      * Maximum side (height or width) 640px
      * Maximum side (height or width) 256px
      * Maximum side (height or width) 128px

    All resized versions of the photo should be in JPEG format (i.e. `image/jpeg`).  If the original image file is in PNG format, you should also generate a JPEG version of the image with the same dimensions as the original photo.  You should not generate resized images that are *larger* than the original photo.  For example, if the maximum side (height or width) of an original image is 512px, you should only generate the 256px and 128px sizes for it, not the 640px and 1024px sizes.

    All resized images should be stored in GridFS and linked somehow to the original image entry in GridFS.  For example, you can add a field to the original image document's metadata indicating all available sizes and the IDs of the corresponding images in GridFS, e.g.:
    ```
    {
      "640": "5ce48a2ddf60d448aed2b1c3",
      "256": "5ce48a2ddf60d448aed2b1c5",
      "128": "5ce48a2ddf60d448aed2b1c7",
      "orig" "5ce48a2ddf60d448aed2b1c9"
    }
    ```

    There are multiple packages on NPM you can use to actually perform the image resizing itself, including [Jimp](https://www.npmjs.com/package/jimp) and [sharp](https://www.npmjs.com/package/sharp).  Each of these has a straightforward interface.  However, you're free to use whatever tool you like to perform the resizing.  You may even write your consumer in a different programming language (e.g. Python) if you prefer.

    Once your consumer is working correctly, you should update the Docker Compose specification in `docker-compose.yml` to start at least one consumer automatically whenever your application is launched using Compose.

## 4. Make all sizes for each photo available for download

Once all of the resized images are saved in GridFS, you should make them available for download via a URL with the following format, where `{id}` represents the ID of the original image and `{size}` represents the requested size:
```
/media/photos/{id}-{size}.jpg
```
Specifically, you should modify the `GET /photos/{id}` endpoint to include URLs for all available sizes for the image in the `urls` field of the response sent back to the client.  The `urls` field should have a URL for each size available for the image, e.g.:
```
{
  "640": "/media/photos/5ce48a2ddf60d448aed2b1c1-640.jpg",
  "256": "/media/photos/5ce48a2ddf60d448aed2b1c1-256.jpg",
  "128": "/media/photos/5ce48a2ddf60d448aed2b1c1-128.jpg",
  "orig" "/media/photos/5ce48a2ddf60d448aed2b1c1-orig.jpg"
}
```
Then, you should add a new `GET /media/photos/{id}-{size}.jpg` API endpoint to allow image downloads.  This endpoint should respond with the content of the image file corresponding to `{id}` and `{size}`.  If either the requested ID or the requested size is invalid, the endpoint should respond with a 404 error.

## Submission

We'll be using GitHub Classroom for this assignment, and you will submit your assignment via GitHub.  Just make sure your completed files are committed and pushed by the assignment's deadline to the master branch of the GitHub repo that was created for you by GitHub Classroom.  A good way to check whether your files are safely submitted is to look at the master branch your assignment repo on the github.com website (i.e. https://github.com/osu-cs493-sp19/assignment-4-YourGitHubUsername/). If your changes show up there, you can consider your files submitted.

## Grading criteria

This assignment is worth 100 total points, broken down as follows:

  * 20 points: API supports image uploads

  * 20 points: Uploaded images are stored in GridFS

  * 35 points: API uses RabbitMQ to resize images offline

  * 5 points: RabbitMQ daemon and worker are started when app is launched using Docker Compose

  * 20 points: All resized images are made available for download.
