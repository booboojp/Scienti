const mongoose = require('mongoose');
const ansis = require('ansis');
require('dotenv').config();	

async function connect() {
    mongoose.set('strictQuery', false);
    try {
        console.log('Trying to connect to DB');
        await mongoose.connect(process.env.MONGO_TOKEN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch {
        console.log('Failed to connect to MongoDB.')
        process.exit(1)
    }

    mongoose.connection.once("open", () => {
        console.log("MongoDB is connected!");
    })
    mongoose.connection.on("error", () => {
        console.log("Error, exiting.");
        process.exit(1);
    })
}
module.exports = connect