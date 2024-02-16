function sortByCreatedAt(jsonArray, order = "asc") {
    return jsonArray.sort((a, b) => {
        const dateA = new Date(a.createdat);
        const dateB = new Date(b.createdat);
        if (order === "asc") {
            return dateB - dateA;
        } else {
            return dateA - dateB;
        }
    });
}

export { sortByCreatedAt };