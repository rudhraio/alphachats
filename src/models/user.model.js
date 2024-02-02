import { v4 as uuid4 } from "uuid";
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';


import { dynamoDbClient } from '../utils/helpers/credentials.js';
import logger from "../utils/helpers/logger.js";
import convertToJson from "../utils/helpers/dynamo-converter.js";


class Users {
    constructor(
        username,
        status = "online",
        utype = "visitor",
        ugroup = "default",
        visibility = "public",
        fullname = undefined,
        email = undefined,
        image = undefined,
        password = undefined,
        connections = [],
        id = uuid4(),
        active = "true"
    ) {
        this.id = id;
        this.username = username;
        this.fullname = fullname ? fullname : username;
        this.email = email ? email : username + "@alphaspace.in";
        this.image = image ? image : "no-image.png";
        this.utype = utype;
        this.ugroup = ugroup;
        this.password = password;
        this.status = status;
        this.connections = connections;
        this.active = active;
        this.visibility = visibility;
        this.createdat = new Date().toISOString();
        this.updatedat = new Date().toISOString();
    }
}

const USERS_TABLE = process.env.USERS_TABLE;
const USERNAME_INDEX = process.env.USERNAME_INDEX;
const USER_ACTIVE_INDEX = process.env.USER_ACTIVE_INDEX;


export async function createUser(data) {
    try {
        const { username } = data;
        const user = new Users(username);

        const params = {
            TableName: USERS_TABLE,
            Item: user,
        };

        await dynamoDbClient.send(new PutCommand(params), { removeUndefinedValues: false });
        return user;
    } catch (error) {
        logger(`[ERR]: Error querying items:, ${error}`);
        return {};
    }

}

export async function getByUsername(username) {
    let user = {};
    const params = {
        TableName: USERS_TABLE,
        IndexName: USERNAME_INDEX,
        KeyConditionExpression: "username = :t",
        ExpressionAttributeValues: {
            ":t": { S: username }
        }
    };

    try {
        const result = await dynamoDbClient.send(new QueryCommand(params));
        user = result.Items[0] || {};
    } catch (error) {
        logger(`[ERR]: Error querying items:, ${error}`);
    }

    return user;
}

export async function getByUserId(userid) {
    let user = {};
    const params = {
        TableName: USERS_TABLE,
        KeyConditionExpression: "id = :t",
        ExpressionAttributeValues: {
            ":t": { S: userid }
        }
    };

    try {
        const result = await dynamoDbClient.send(new QueryCommand(params));
        const items = convertToJson(result.Items);
        user = items[0] || {};
    } catch (error) {
        logger(`[ERR]: Error querying items:, ${error}`);
    }

    return user;
}

export async function getAllUsers() {
    let members = [];

    const params = {
        TableName: USERS_TABLE,
        IndexName: USER_ACTIVE_INDEX,
        KeyConditionExpression: "active = :t",
        ExpressionAttributeValues: {
            ":t": { S: "true" },
        }
    };

    try {
        const result = await dynamoDbClient.send(new QueryCommand(params));
        const items = convertToJson(result.Items);
        members = items || [];
    } catch (error) {
        logger(`[ERR]: Error querying items:, ${error}`);
    }

    return members;
}

export default Users;
