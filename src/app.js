import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { engine } from "express-handlebars";
import servicesRouter from "./routes/services.router.js";
import bookingsRouter from "./routes/bookings.router.js";
import viewsRouter from "./routes/views.router.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();


app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/services", servicesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/views", viewsRouter);


app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "JSON inválido en el body" });
    }
    if (err.name === "ValidationError") {
        return res.status(400).json({ errors: err.errors });
    }
    if (err.name === "NotFoundError") {
        return res.status(404).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
});

export default app;