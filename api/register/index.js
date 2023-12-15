const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const connectionString = "mongodb://games:oQ5bO7YMfpu99oZMpKs0fjjypybyIMwBHJh7TmK8FYj1J41StnByDp1vxZ0huSXxlYbNLiRtNdvZACDb9cByMQ%3D%3D@games.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@games@";

const client = new MongoClient(connectionString);

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.method === "POST") {
        // Determine if this is a login or register request
        const isLogin = req.url.includes("/login");
        try {
            await client.connect();
            const db = client.db("games");
            const { username, password } = req.body;
            const collection = db.collection("user");

            if (isLogin) {
                // Handle login
                const user = await collection.findOne({ username, password });
                if (user) {
                    const token = jwt.sign({ username }, "123456", { expiresIn: '1h' });
                    context.res = {
                        status: 200,
                        body: JSON.stringify({ code: 200, msg: "SUCCESS", data: { token } }),
                        headers: { 'Content-Type': 'application/json' }
                    };
                } else {
                    context.res = {
                        status: 400,
                        body: JSON.stringify({ code: 400, msg: "Login or Registration failed" })
                    };
                }
            } else {
                // Handle register
                const existingUser = await collection.findOne({ username });
                if (!existingUser) {
                    await collection.insertOne({ username, password });
                    context.res = {
                        status: 200,
                        body: JSON.stringify({ code: 200, msg: "SUCCESS", data: {} }),
                        headers: { 'Content-Type': 'application/json' }
                    };
                } else {
                    context.res = {
                        status: 400,
                        body: JSON.stringify({ code: 400, msg: "Login or Registration failed" })
                    };
                }
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
        }
    }
};
