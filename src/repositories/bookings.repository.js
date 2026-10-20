import bookingsDAO from "../dao/bookings.dao.js";

class BookingsRepository {
    create(data) {
        return bookingsDAO.create(data);
    }

    getById(id) {
        return bookingsDAO.getById(id);
    }

    getByIdPopulated(id) {
        return bookingsDAO.getByIdPopulated(id);
    }

    update(id, data) {
        return bookingsDAO.update(id, data);
    }

    addService(bookingId, serviceId, quantity) {
        return bookingsDAO.addService(bookingId, serviceId, quantity);
    }
}

export default new BookingsRepository();