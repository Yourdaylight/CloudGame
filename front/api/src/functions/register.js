const { app } = require('@azure/functions');

const { MongoClient } = require('mongodb');

var connectionString = "mongodb://games:oQ5bO7YMfpu99oZMpKs0fjjypybyIMwBHJh7TmK8FYj1J41StnByDp1vxZ0huSXxlYbNLiRtNdvZACDb9cByMQ%3D%3D@games.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@games@";
const client = new MongoClient(connectionString);

app.http('register', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            await client.connect();
            const db = client.db("games");
            const { username, password } = request.body;
            const existingUser = await db.collection("user").findOne({ username });

            if (!existingUser) {
                await db.collection("user").insertOne({ username, password });
                context.res = {
                    status: 200, // HTTP 状态码
                    body: JSON.stringify({ code: 200, msg: "SUCCESS", data: { /* 返回的数据 */ } }),
                    headers: { 'Content-Type': 'application/json' }
                };
            } else {
                context.res = {
                    status: 400, // 或其他合适的状态码
                    body: JSON.stringify({ code: 400, msg: "Login or Registration failed" })
                };
            }
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
            return context.res;
        }
    }
});


app.http('login', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const { username, password } = request.body;
            await client.connect();
            const db = client.db("games");
            const user = await db.collection("user").findOne({ username, password });

            if (user) {
                const token = jwt.sign({ username }, process.env["JWT_SECRET"], { expiresIn: '1h' });
                context.res = {
                    status: 200, // HTTP 状态码
                    body: JSON.stringify({ code: 200, msg: "SUCCESS", data: { token } }),
                    headers: { 'Content-Type': 'application/json' }
                };
                
            } else {
                context.res = {
                    status: 400, // 或其他合适的状态码
                    body: JSON.stringify({ code: 400, msg: "Login or Registration failed" })
                };
            }
        } catch (e) {
            context.res = { 
                status: 500,
                body: JSON.stringify({ code: 500, msg: e.message }),
                headers: { 'Content-Type': 'application/json' }
            }
        } finally {
            if (client) {
                client.close();
            }
            return context.res;
        }
    }
});

