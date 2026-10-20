import bookingsRepository from "../repositories/bookings.repository.js";
import servicesService from "./services.service.js";

const VALID_STATUS = ["pending", "confirmed", "cancelled"];

const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";

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

const validateBooking = ({ clientName, clientEmail, date, time, status }) => {
    const errors = [];

    if (!isNonEmptyString(clientName)) {
        errors.push("clientName es obligatorio");
    }
    if (!isNonEmptyString(clientEmail) || !/^\S+@\S+\.\S+$/.test(clientEmail)) {
        errors.push("clientEmail debe ser un email válido");
    }
    if (!isNonEmptyString(date) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        errors.push("date debe tener formato YYYY-MM-DD");
    }
    if (!isNonEmptyString(time) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
        errors.push("time debe tener formato HH:MM");
    }
    if (status !== undefined && !VALID_STATUS.includes(status)) {
        errors.push(`status debe ser uno de: ${VALID_STATUS.join(", ")}`);
    }
    return errors;
};

class BookingsService {
    async createBooking(data) {
        const errors = validateBooking(data);
        if (errors.length > 0) throw validationError(errors);

        const { clientName, clientEmail, date, time, status } = data;
        return await bookingsRepository.create({
            clientName,
            clientEmail,
            date,
            time,
            status: status ?? "pending",
            services: [],
        });
    }

    async getBookingById(id) {
        const booking = await bookingsRepository.getById(id);
        if (!booking) throw notFoundError("Reserva no encontrada");
        return booking;
    }

    async addServiceToBooking(bookingId, serviceId) {
    const booking = await this.getBookingById(bookingId);

    
    await servicesService.getServiceById(serviceId);

    const services = booking.services.map((item) => ({
        service: item.service,
        quantity: item.quantity,
    }));
    const item = services.find((s) => s.service.toString() === serviceId);

    if (item) {
        item.quantity += 1;
    } else {
        services.push({ service: serviceId, quantity: 1 });
    }

    return await bookingsRepository.update(bookingId, { services });
}
}

export default new BookingsService();