import bookingsRepository from "../repositories/bookings.repository.js";
import servicesService from "./services.service.js";
import { notFoundError } from "../utils/errors.js";

class BookingsService {
    async createBooking(data) {
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
        const booking = await bookingsRepository.getByIdPopulated(id);
        if (!booking) throw notFoundError("Reserva no encontrada");
        return booking;
    }

    async addServiceToBooking(bookingId, serviceId, quantity = 1) {
        const booking = await bookingsRepository.getById(bookingId);
        if (!booking) throw notFoundError("Reserva no encontrada");

        await servicesService.getServiceById(serviceId); 

        const updated = await bookingsRepository.addService(bookingId, serviceId, quantity);
        if (!updated) throw notFoundError("Reserva no encontrada");
        return updated;
    }
}

export default new BookingsService();