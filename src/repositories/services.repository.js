import servicesDAO from "../dao/services.dao.js";

class ServicesRepository {
    getAll() {
        return servicesDAO.getAll();
    }

    getById(id) {
        return servicesDAO.getById(id);
    }

    create(data) {
        return servicesDAO.create(data);
    }

    update(id, data) {
        return servicesDAO.update(id, data);
    }

    delete(id) {
        return servicesDAO.delete(id);
    }
}

export default new ServicesRepository();