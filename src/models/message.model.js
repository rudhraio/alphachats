import { v4 as uuid4 } from "uuid";
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

import logger from "../utils/helpers/logger.js";
import { dynamoDbClient } from "../utils/helpers/credentials.js";
import convertToJson from "../utils/helpers/dynamo-converter.js";

class Messages {
    constructor(
        chatid,
        from,
        message,
        mtype = "text",
        attachments = [],
        id = uuid4(),
        active = "true"
    ) {
        this.id = id;
        this.chatid = chatid;
        this.from = from;
        this.message = message;
        this.mtype = mtype;
        this.attachments = attachments;
        this.active = active;
        this.createdat = new Date().toISOString();
        this.updatedat = new Date().toISOString();
    }
}
export default Messages;

const MESSAGES_TABLE = process.env.MESSAGES_TABLE;
const MESSAGE_ACTIVE_INDEX = process.env.MESSAGE_ACTIVE_INDEX;


export async function createMessage(data) {
    const {
        chatid,
        from,
        message,
        mtype = "text",
        attachments = []
    } = data;

    const item = new Messages(chatid, from, message, mtype, attachments);

    const params = {
        TableName: MESSAGES_TABLE,
        Item: item,
    };
    try {
        await dynamoDbClient.send(new PutCommand(params), { removeUndefinedValues: false });
    } catch (error) {
        logger(`[ERR]: Error querying items:, ${error}`);
        return {};
    }

    return item;
}

export async function getMessagesByChatId(chatid) {
    let messages = [];

    const params = {
        TableName: MESSAGES_TABLE,
        IndexName: MESSAGE_ACTIVE_INDEX,
        KeyConditionExpression: "active = :t",
        FilterExpression: "chatid = :chatid",
        ExpressionAttributeValues: {
            ":t": { S: "true" },
            ":chatid": { S: chatid }
        }
    };

    try {
        const result = await dynamoDbClient.send(new QueryCommand(params));
        const items = convertToJson(result.Items);
        messages = items || [];
    } catch (error) {
        logger(`[ERR]: Error querying items:, ${error}`);
    }

    return messages;
}