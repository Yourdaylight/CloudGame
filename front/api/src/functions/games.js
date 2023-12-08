const { app } = require('@azure/functions');
const { MongoClient } = require('mongodb');
var connectionString = "mongodb://games:oQ5bO7YMfpu99oZMpKs0fjjypybyIMwBHJh7TmK8FYj1J41StnByDp1vxZ0huSXxlYbNLiRtNdvZACDb9cByMQ%3D%3D@games.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@games@";
const client = new MongoClient(connectionString);
const DATABASE_NAME = "games";
const COLLECTION = "games";
app.http('games', {
    methods: ['POST'], // Only POST method is allowed
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            await client.connect();
            const db = client.db(DATABASE_NAME);
            const collection = db.collection(COLLECTION);

            // Extracting data from the POST request body instead of query parameters
            const body = await request.json() || {};
            const page = body.page || 1;
            const size = body.size || 10;
            const original_price = body["Original Price"];
            const title = body["Title"];
            const developer = body.Developer;
            let query_conditions = {};
            if (original_price) {
                query_conditions["Original Price"] = { $regex: original_price, $options: "i" };
            }
            if (title) {
                query_conditions["Title"] = { $regex: title, $options: "i" };
            }
            if (developer) {
                query_conditions["Developer"] = { $regex: developer, $options: "i" };
            }

            const data = await collection.find(query_conditions).skip((page - 1) * size).limit(size).toArray();
            const total = await collection.countDocuments(query_conditions);
            context.res = {
                status: 200,
                body: JSON.stringify({ code: 200, total: total, data: data, msg: "SUCCESS",body:query_conditions }),
                headers: { 'Content-Type': 'application/json' }
            };
        } catch (e) {
            context.res = {
                status: 500,
                body: JSON.stringify({ code: 500, msg: e.message }),
                headers: { 'Content-Type': 'application/json' }
            };
        } finally {
            if (client) {
                client.close();
            }
        }
        return context.res;
    }
});
