import servicesRepository from "../repositories/services.repository.js";

const FIELDS = ["name", "description", "duration", "price", "category", "available"];

const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";
const isPositiveNumber = (v) => typeof v === "number" && Number.isFinite(v) && v > 0;

const validationError = (errors) => {
    const error = new Error("Datos inválidos");
    error.name = "ValidationError";
    error.errors = errors;
    return error;
};

const notFoundError = (message) => {
    const error = new Error(message);
    error.name = "NotFoundError";
    return error;
};

// partial = true → en PUT solo se valida lo que venga en el body
const validateService = (data, partial = false) => {
    const rules = {
        name: [isNonEmptyString, "name debe ser un texto no vacío"],
        description: [isNonEmptyString, "description debe ser un texto no vacío"],
        duration: [isPositiveNumber, "duration debe ser un número mayor a 0"],
        price: [isPositiveNumber, "price debe ser un número mayor a 0"],
        category: [isNonEmptyString, "category debe ser un texto no vacío"],
        available: [(v) => typeof v === "boolean", "available debe ser true o false"],
    };

    const errors = [];
    for (const [field, [check, message]] of Object.entries(rules)) {
        const value = data[field];
        if (value === undefined) {
            if (!partial) errors.push(`Falta el campo ${field}`);
        } else if (!check(value)) {
            errors.push(message);
        }
    }
    return errors;
};

// Solo deja pasar los campos permitidos (así el id del body se ignora)
const pickFields = (data) =>
    Object.fromEntries(
        FIELDS.filter((field) => data[field] !== undefined).map((field) => [field, data[field]])
    );

class ServicesService {
    async getServices({ category, available } = {}) {
        let services = await servicesRepository.getAll();

        if (category !== undefined) {
            services = services.filter(
                (s) => s.category.toLowerCase() === category.toLowerCase()
            );
        }
        if (available !== undefined) {
            const isAvailable = available === "true";
            services = services.filter((s) => s.available === isAvailable);
        }
        return services;
    }

    async getServiceById(id) {
        const service = await servicesRepository.getById(id);
        if (!service) throw notFoundError("Servicio no encontrado");
        return service;
    }

    async createService(data) {
        const errors = validateService(data);
        if (errors.length > 0) throw validationError(errors);

        return await servicesRepository.create(pickFields(data));
    }

    async updateService(id, data) {
        const errors = validateService(data, true);
        if (errors.length > 0) throw validationError(errors);

        const updated = await servicesRepository.update(id, pickFields(data));
        if (!updated) throw notFoundError("Servicio no encontrado");
        return updated;
    }

    async deleteService(id) {
        const deleted = await servicesRepository.delete(id);
        if (!deleted) throw notFoundError("Servicio no encontrado");
        return deleted;
    }
}

export default new ServicesService();