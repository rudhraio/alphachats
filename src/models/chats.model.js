import { v4 as uuid4 } from "uuid";
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

import logger from "../utils/helpers/logger.js";
import { dynamoDbClient } from "../utils/helpers/credentials.js";
import convertToJson from "../utils/helpers/dynamo-converter.js";

class Chats {
    constructor(
        userslist,
        usersdetails,
        ctype = "one-to-one",
        visibility = "public",
        name = undefined,
        description = undefined,
        image = undefined,
        last_message = undefined,
        id = uuid4(),
        active = "true"
    ) {
        this.id = id;
        this.userslist = userslist;
        this.usersdetails = usersdetails;
        this.name = name;
        this.image = image ? image : "no-image.png";
        this.ctype = ctype;
        this.description = description;
        this.last_message = last_message;
        this.active = active;
        this.visibility = visibility;
        this.createdat = new Date().toISOString();
        this.updatedat = new Date().toISOString();
    }
}


const CHATS_TABLE = process.env.CHATS_TABLE;
const ACTIVE_INDEX = process.env.ACTIVE_INDEX;


export async function createChat(data) {
    try {
        const { userslist, usersdetails } = data;
        const chat = new Chats(userslist, usersdetails);

        const params = {
            TableName: CHATS_TABLE,
            Item: chat,
        };

        await dynamoDbClient.send(new PutCommand(params), { removeUndefinedValues: false });
        return chat
    } catch (error) {
        logger(`[ERR]: Error querying items:, ${error}`);
        return {};
    }
}

export async function getChatsByUser(userid) {
    let chat = {};
    const params = {
        TableName: CHATS_TABLE,
        IndexName: ACTIVE_INDEX,
        KeyConditionExpression: "active = :t",
        FilterExpression: 'contains(userslist, :userid)',
        ExpressionAttributeValues: {
            ":t": { S: "true" },
            ":userid": { S: userid }
        }
    };

    try {
        const result = await dynamoDbClient.send(new QueryCommand(params));
        const items = convertToJson(result.Items);
        chat = items || {};
    } catch (error) {
        logger(`[ERR]: Error querying items:, ${error}`);
    }

    return chat;
}

export async function getChatByMembers(userone, usertwo) {
    let chat = {};
    const params = {
        TableName: CHATS_TABLE,
        IndexName: ACTIVE_INDEX,
        KeyConditionExpression: "active = :t",
        FilterExpression: 'contains(userslist, :userone) AND contains(userslist, :usertwo) AND ctype = :ctype',
        ExpressionAttributeValues: {
            ":t": { S: "true" },
            ":userone": { S: userone },
            ":usertwo": { S: usertwo },
            ":ctype": { S: "one-to-one" }
        }
    };

    try {
        const result = await dynamoDbClient.send(new QueryCommand(params));
        const items = convertToJson(result.Items);
        chat = items[0] || {};
    } catch (error) {
        logger(`[ERR]: Error querying items:, ${error}`);
    }

    return chat;
}


export async function getChatsById(chatid) {
    let chat = {};
    const params = {
        TableName: CHATS_TABLE,
        KeyConditionExpression: "id = :t",
        ExpressionAttributeValues: {
            ":t": { S: chatid },
        }
    };

    try {
        const result = await dynamoDbClient.send(new QueryCommand(params));
        const items = convertToJson(result.Items);
        chat = items[0] || {};
    } catch (error) {
        logger(`[ERR]: Error querying items:, ${error}`);
    }

    return chat;
}