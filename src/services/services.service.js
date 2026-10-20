import servicesRepository from "../repositories/services.repository.js";
import { notFoundError } from "../utils/errors.js";

const buildFilter = ({ category, available } = {}) => {
    const filter = {};
    if (category !== undefined) filter.category = category;
    if (available !== undefined) filter.available = available;
    return filter;
};

class ServicesService {
    async getServices({
        category,
        available,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "asc",
    } = {}) {
        const filter = buildFilter({ category, available });
        const sort = { [sortBy]: order === "desc" ? -1 : 1, _id: 1 }; // _id: orden estable
        const skip = (page - 1) * limit;

        const { docs, total } = await servicesRepository.findPaginated(filter, {
            sort,
            skip,
            limit,
        });
        const totalPages = Math.ceil(total / limit);

        return {
            status: "success",
            payload: docs,
            total,
            page,
            limit,
            totalPages,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
        };
    }

    // Sin paginar: lo usan las vistas Handlebars
    async getAllServices(query) {
        return await servicesRepository.getAll(buildFilter(query));
    }

    async getServiceById(id) {
        const service = await servicesRepository.getById(id);
        if (!service) throw notFoundError("Servicio no encontrado");
        return service;
    }

    async createService(data) {
        return await servicesRepository.create(data);
    }

    async updateService(id, data) {
        const updated = await servicesRepository.update(id, data);
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