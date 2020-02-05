const { MONGO_USER, MONGO_PASSWORD } = require('./.env');

db.createUser({
    user: MONGO_USER,
    pwd: MONGO_PASSWORD,
    roles: [
        {
            role: "readWrite",
            db: "notifications"
        }
    ]
})