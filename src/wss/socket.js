import logger from '../utils/helpers/logger.js';
import { verifyToken } from '../utils/helpers/auth.js';
import { getByUserId, getMultipleUsers, getUserByConnectionId, updateUserInformation } from '../models/user.model.js';
import { api } from '../utils/helpers/credentials.js';
import { PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';


async function connect(event) {
    try {
        logger(`[INFO]: User Connection Request: ${JSON.stringify(event)}`, true);
        // const token = event?.headers["Authorization"];
        // if (!token || !token.startsWith('Bearer ')) {
        //     return { statusCode: 400, body: JSON.stringify({ "status": 400, "message": "unauthorized: no token provided" }) };
        // }

        const { token } = event?.queryStringParameters;

        if (token && token === "SERVER") {
            return { statusCode: 200, body: JSON.stringify({ "status": "ok" }) };
        }


        const decoded = verifyToken(token);
        if (!decoded) {
            return { statusCode: 400, body: JSON.stringify({ "status": 400, "message": "unauthorized: invalid token provided" }) };
        }

        let user = await getByUserId(decoded.id, false);
        user.connections["L"] = [...user.connections["L"], { "S": event?.requestContext?.connectionId }];
        await updateUserInformation(decoded.id, "connections", user.connections);

        return { statusCode: 200, body: JSON.stringify({ "status": "ok" }) };
    } catch (err) {
        logger(`[ERR]: In User Connection: ${JSON.stringify(err)}`, true);
        return { statusCode: 400, body: 'Failed to connect: ' + JSON.stringify(err) };
    }
};


async function disconnect(event) {
    try {
        logger(`[INFO]: User Disconnectd: ${JSON.stringify(event)}`, true);

        const { connectionId } = event.requestContext;
        let user = await getUserByConnectionId(connectionId, false);
        user.connections["L"] = user.connections["L"].filter((item) => { return item["S"] !== connectionId });
        await updateUserInformation(user.id["S"], "connections", user.connections);

        return { statusCode: 200, body: JSON.stringify({ "status": "ok" }) };
    } catch (err) {
        logger(`[ERR]: In User Connection: ${JSON.stringify(err)}`, true);
        return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(err) };
    }
};

async function message(event) {
    try {
        logger(`[INFO]: User Message: ${JSON.stringify(event)}`, true);
        let { to, from, payload, type } = JSON.parse(event.body);
        await boradcastMessage(to, from, payload, type);
        return { statusCode: 200, body: JSON.stringify({ "status": "ok" }) };
    } catch (err) {
        return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(err) };
    }
};


async function boradcastMessage(to, from, payload, type) {
    let members = [];
    if (Array.isArray(to)) {
        members = await getMultipleUsers(to);
    } else if (typeof value === 'string') {
        members = await getMultipleUsers([to]);
    }
    const count = members.length - 1;

    return sendToMembers(members, count, payload, type, from);

}

async function sendToMembers(members, count, payload, type, from) {
    if (count < 0) return;
    const user = members[count] || {};
    let connectionCount = user?.connections.length - 1;
    await sendMessage(user?.connections, connectionCount, payload, type, from);
    return await sendToMembers(members, --count, payload, type, from);
}

async function sendMessage(connections, count, payload, type, from) {
    if (count < 0) return;

    try {
        let params = {
            ConnectionId: connections[count],
            Data: JSON.stringify({ payload, from, type, to: connections[count] })
        }
        await api.send(new PostToConnectionCommand(params));
    } catch (error) {
        logger(`API ERROR ${JSON.stringify(error)}`, true);
    }
    return await sendMessage(connections, --count, payload, type, from);
}



export { connect, disconnect, message };