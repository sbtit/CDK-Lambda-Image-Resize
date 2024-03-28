import * as AWS from 'aws-sdk';
import * as sharp from 'sharp';

const s3 = new AWS.S3();

export const handler = async (event: any): Promise<any> => {
    try {
        // S3から画像を取得
        const bucketName = event.Records[0].s3.bucket.name;
        const objectKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
        const imageObject = await s3.getObject({ Bucket: bucketName, Key: objectKey }).promise();

        // 画像のリサイズ
        const resizedImageBuffer = await sharp(imageObject.Body)
            .resize({ width: 200, height: 200 }) // リサイズするサイズを指定
            .toBuffer();

        // リサイズされた画像をS3にアップロード
        await s3.putObject({
            Bucket: bucketName,
            Key: `resized_${objectKey}`,
            Body: resizedImageBuffer,
            ContentType: 'image/jpeg',
        }).promise();

        return {
            statusCode: 200,
            body: 'Resized image uploaded successfully',
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify(error),
        };
    }
};
