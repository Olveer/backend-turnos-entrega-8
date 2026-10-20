import ServiceModel from "../models/service.model.js";

// Un id con formato inválido se trata como "no encontrado" (evita errores de cast)
const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

class ServicesDAO {
    async getAll() {
        return await ServiceModel.find();
    }

    async getById(id) {
        if (!isValidId(id)) return null;
        return await ServiceModel.findById(id);
    }

    async create(data) {
        return await ServiceModel.create(data);
    }

    async update(id, data) {
        if (!isValidId(id)) return null;
        return await ServiceModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }

    async delete(id) {
        if (!isValidId(id)) return null;
        return await ServiceModel.findByIdAndDelete(id);
    }
}

export default new ServicesDAO();