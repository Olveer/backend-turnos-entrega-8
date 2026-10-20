import BookingModel from "../models/booking.model.js";

const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

class BookingsDAO {
    async create(data) {
        return await BookingModel.create(data);
    }

    async getById(id) {
        if (!isValidId(id)) return null;
        return await BookingModel.findById(id);
    }

    async update(id, data) {
        if (!isValidId(id)) return null;
        return await BookingModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }
}

export default new BookingsDAO();