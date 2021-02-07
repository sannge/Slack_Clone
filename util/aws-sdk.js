const AWS = require("aws-sdk");

const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ID,
	secretAccessKey: process.env.AWS_SECRET,
});

exports.s3 = s3;

exports.uploadTos3AndStoreInDB = async (
	chunk,
	models,
	filenameToUpload,
	counter,
	message,
	i
) => {
	try {
		const s3Response = await s3
			.upload({
				Bucket: process.env.AWS_BUCKET_NAME,
				Key: filenameToUpload,
				Body: chunk,
			})
			.promise();
		const url = s3Response.Location;
		console.log(i, "creating new File" + counter);
		await models.File.create(
			{
				url,
				messageId: message.id,
			}
			// { transaction }
		);
		console.log(i, "created new File" + counter);
	} catch (err) {
		console.log(err);
	}
};
