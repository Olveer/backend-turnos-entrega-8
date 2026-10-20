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

    
    async getByIdPopulated(id) {
        if (!isValidId(id)) return null;
        return await BookingModel.findById(id).populate("services.service");
    }

    async update(id, data) {
        if (!isValidId(id)) return null;
        return await BookingModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }

    
    async addService(bookingId, serviceId, quantity) {
        if (!isValidId(bookingId)) return null;

        const increment = () =>
            BookingModel.findOneAndUpdate(
                { _id: bookingId, "services.service": serviceId },
                { $inc: { "services.$.quantity": quantity } },
                { new: true }
            );

        const push = () =>
            BookingModel.findOneAndUpdate(
                { _id: bookingId, "services.service": { $ne: serviceId } },
                { $push: { services: { service: serviceId, quantity } } },
                { new: true, runValidators: true }
            );

        return (await increment()) ?? (await push()) ?? (await increment());
    }
}

export default new BookingsDAO();