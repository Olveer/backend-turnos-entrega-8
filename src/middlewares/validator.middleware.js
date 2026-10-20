import { z } from "zod";

const text = (field, min) =>
    z
        .string({ error: `${field} es obligatorio y debe ser un texto` })
        .trim()
        .min(min, `${field} debe tener al menos ${min} caracteres`);

const positive = (field) =>
    z
        .number({ error: `${field} es obligatorio y debe ser un número` })
        .positive(`${field} debe ser mayor a 0`);

// ---------- Servicios ----------
export const createServiceSchema = z.object({
    name: text("name", 3),
    description: text("description", 5),
    duration: positive("duration"),
    price: positive("price"),
    category: text("category", 2),
    available: z.boolean({ error: "available es obligatorio y debe ser true o false" }),
});

export const updateServiceSchema = createServiceSchema.partial();

export const getServicesQuerySchema = z.object({
    category: z.string().trim().min(1, "category no puede estar vacío").optional(),
    available: z
        .enum(["true", "false"], { error: "available debe ser true o false" })
        .transform((v) => v === "true")
        .optional(),
    page: z.coerce
        .number({ error: "page debe ser un número" })
        .int("page debe ser un entero")
        .min(1, "page debe ser mayor o igual a 1")
        .default(1),
    limit: z.coerce
        .number({ error: "limit debe ser un número" })
        .int("limit debe ser un entero")
        .min(1, "limit debe ser mayor o igual a 1")
        .max(100, "limit no puede ser mayor a 100")
        .default(10),
    sortBy: z
        .enum(["name", "price", "duration", "category", "createdAt"], {
            error: "sortBy debe ser: name, price, duration, category o createdAt",
        })
        .default("createdAt"),
    order: z.enum(["asc", "desc"], { error: "order debe ser asc o desc" }).default("asc"),
});

// ---------- Reservas ----------
export const createBookingSchema = z.object({
    clientName: text("clientName", 2),
    clientEmail: z.email({ error: "clientEmail debe ser un email válido" }),
    date: z
        .string({ error: "date es obligatorio" })
        .regex(/^\d{4}-\d{2}-\d{2}$/, "date debe tener formato YYYY-MM-DD"),
    time: z
        .string({ error: "time es obligatorio" })
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "time debe tener formato HH:MM"),
    status: z
        .enum(["pending", "confirmed", "cancelled"], {
            error: "status debe ser uno de: pending, confirmed, cancelled",
        })
        .optional(),
});

export const addServiceToBookingSchema = z.object({
    quantity: z
        .number({ error: "quantity debe ser un número" })
        .int("quantity debe ser un entero")
        .positive("quantity debe ser mayor a 0")
        .optional()
        .default(1),
});

// ---------- Middlewares ----------
const formatError = (error) => {
    const details = error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
    }));
    return { error: "Datos inválidos", errors: details.map((d) => d.message), details };
};

// Valida req.body y lo reemplaza por los datos limpios (campos desconocidos fuera)
export const validateSchema = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) return res.status(400).json(formatError(result.error));
    req.body = result.data;
    next();
};

// En Express 5 req.query es de solo lectura: la query validada queda en res.locals.query
export const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) return res.status(400).json(formatError(result.error));
    res.locals.query = result.data;
    next();
};