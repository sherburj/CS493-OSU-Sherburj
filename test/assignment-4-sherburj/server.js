const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const api = require('./api');
const { connectToDB } = require('./lib/mongo');
const { connectToRabbitMQ } = require('./lib/rabbit');

const app = express();
const port = process.env.PORT || 8000;

const multer = require('multer');
const upload = multer({ dest: `${__dirname}/uploads` });


const amqp = require('amqplib');
const rabbitmqHost = process.env.RABBITMQ_HOST;
const rabbitmqUrl = `amqp://${rabbitmqHost}`;

/*
async function producer() {
  try {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
  } catch (err) {
    console.error(err);
  }
  await channel.assertQueue('echo')
  const message =
        'The quick brown fox jumped over the lazy dog';
        message.split(' ').forEach((word) => {
        channel.sendToQueue('echo', Buffer.from(word));
      });
  setTimeout(() => { connection.close(); }, 500);
  
}
producer();


async function consumer() {
  try {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
  } catch (err) {
    console.error(err);
  }
  channel.consume(queue, (msg) => {
  if (msg) {
    console.log(msg.content.toString());
  }
  channel.ack(msg);
});  
}
consumer();
*/



/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(
  '/media/images',
  express.static(`${__dirname}/uploads`)
);

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

connectToDB( async () => {
	try{
		await connectToRabbitMQ('images');
	}catch(err){
	     console.error("ERROR: ",err);
	}
  app.listen(port, () => {
    console.log("== Server is running on port", port);
  });
});


