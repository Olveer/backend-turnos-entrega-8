import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import config from "./config/env.config.js";
import connectDB from "./config/db.config.js";

const startServer = async () => {
    await connectDB();

    const httpServer = http.createServer(app);
    const io = new Server(httpServer);

    app.set("io", io);

    io.on("connection", (socket) => {
        console.log(`Cliente conectado: ${socket.id}`);
    });

    httpServer.listen(config.PORT, () => {
        console.log(`Servidor escuchando en el puerto ${config.PORT}`);
    });
};

startServer();