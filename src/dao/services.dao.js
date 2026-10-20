import ServiceModel from "../models/service.model.js";

const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);


const COLLATION = { locale: "es", strength: 2 };

class ServicesDAO {
    async getAll(filter = {}) {
        return await ServiceModel.find(filter).collation(COLLATION);
    }

    async findPaginated(filter, { sort, skip, limit }) {
        const [docs, total] = await Promise.all([
            ServiceModel.find(filter).collation(COLLATION).sort(sort).skip(skip).limit(limit),
            ServiceModel.countDocuments(filter).collation(COLLATION),
        ]);
        return { docs, total };
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