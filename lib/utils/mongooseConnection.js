import config from 'config';
import mongoose from 'mongoose';

function connectToMongo() {
    const { dsn, options } = config.mongo;
    mongoose.connect(dsn, options);
}
connectToMongo();
mongoose.connection.on('disconnected', connectToMongo);

export default mongoose.connection;
