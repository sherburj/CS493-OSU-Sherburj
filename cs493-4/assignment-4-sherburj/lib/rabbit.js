const amqp = require('amqplib');

const rabbitmqHost = process.env.RABBITMQ_HOST;
const rabbitmqUrl = `amqp://${rabbitmqHost}`;

console.log(rabbitmqUrl);

let connection = null;
let channel = null;

exports.connectToRabbitMQ = async function (queue) {
	if(amqp)
		connection = await amqp.connect(rabbitmqUrl)
	else
		console.log("Whoopsies")
	channel = await connection.createChannel()
	await channel.assertQueue(queue)
}

exports.getChannel = function (){
	return channel;	
}