export default function convertToJson(items) {
    return items.map(item => {
        const convertedItem = {};
        for (const [key, value] of Object.entries(item)) {
            convertedItem[key] = convertDynamoDBAttribute(value);
        }
        return convertedItem;
    });
}

function convertDynamoDBAttribute(attribute) {
    const type = Object.keys(attribute)[0];
    const value = attribute[type];

    switch (type) {
        case 'S': return value;
        case 'N': return Number(value);
        case 'BOOL': return Boolean(value);
        case 'L': return value.map(convertDynamoDBAttribute);
        case 'M': return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, convertDynamoDBAttribute({ [k]: v })]));
        // Add more cases for other types as needed
        default: return value;
    }
}