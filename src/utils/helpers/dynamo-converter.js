export default function convertToJson(dynamodbData) {
    function decodeAttribute(attr) {
        if (attr.S !== undefined) {
            return attr.S;
        } else if (attr.N !== undefined) {
            return Number(attr.N);
        } else if (attr.BOOL !== undefined) {
            return attr.BOOL;
        } else if (attr.L !== undefined) {
            return attr.L.map(decodeAttribute);
        } else if (attr.M !== undefined) {
            const decodedObject = {};
            for (const key in attr.M) {
                if (attr.M.hasOwnProperty(key)) {
                    decodedObject[key] = decodeAttribute(attr.M[key]);
                }
            }
            return decodedObject;
        } else {
            return null;
        }
    }

    return dynamodbData.map(item => {
        const decodedItem = {};
        for (const key in item) {
            if (item.hasOwnProperty(key)) {
                decodedItem[key] = decodeAttribute(item[key]);
            }
        }
        return decodedItem;
    });
}

// export default function convertToJson(items) {
//     return items.map(item => {
//         const convertedItem = {};
//         for (const [key, value] of Object.entries(item)) {
//             convertedItem[key] = convertDynamoDBAttribute(value);
//         }
//         return convertedItem;
//     });
// }

// function convertDynamoDBAttribute(attribute) {
//     const type = Object.keys(attribute)[0];
//     const value = attribute[type];

//     switch (type) {
//         case 'S': return value;
//         case 'N': return Number(value);
//         case 'BOOL': return Boolean(value);
//         case 'L': return value.map(convertDynamoDBAttribute);
//         case 'M': return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, convertDynamoDBAttribute({ [k]: v })]));
//         // Add more cases for other types as needed
//         default: return value;
//     }
// }