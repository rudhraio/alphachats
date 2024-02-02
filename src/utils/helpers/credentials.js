import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const credentials = {
    region: "ap-south-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

let client;
if (process.env.NODE_ENV === "dev") {
    client = new DynamoDBClient({ credentials });
} else {
    client = new DynamoDBClient();
}


const dynamoDbClient = DynamoDBDocumentClient.from(client);


export { dynamoDbClient };