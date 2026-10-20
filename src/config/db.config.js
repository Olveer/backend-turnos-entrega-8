import mongoose from "mongoose";
import config from "./env.config.js";

const connectDB = async () => {
    if (!config.MONGO_URI) {
        console.error("Falta la variable de entorno MONGO_URI");
        process.exit(1);
    }

    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("Conectado a MongoDB");
    } catch (error) {
        console.error("Error al conectar con MongoDB:", error.message);
        process.exit(1);
    }
};

export default connectDB;