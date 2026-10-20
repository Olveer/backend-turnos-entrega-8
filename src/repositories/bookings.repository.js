import bookingsDAO from "../dao/bookings.dao.js";

class BookingsRepository {
    create(data) {
        return bookingsDAO.create(data);
    }

    getById(id) {
        return bookingsDAO.getById(id);
    }

    update(id, data) {
        return bookingsDAO.update(id, data);
    }
}

export default new BookingsRepository();