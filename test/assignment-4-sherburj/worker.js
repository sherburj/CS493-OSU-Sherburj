const sizeOf = require('image-size');


const id = msg.content.toString();
const downloadStream = getDownloadStreamById(id);


const imageData = [];
downloadStream.on('data', (data) => {
  imageData.push(data);
});


downloadStream.on('end', async () => {
  const dimensions = sizeOf(Buffer.concat(imageData));
  const result = await updateImageSizeById(id, dimensions);
});

