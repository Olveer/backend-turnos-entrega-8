import servicesService from "../services/services.service.js";


const emitEvent = (req, event, payload) => {
    const io = req.app.get("io");
    if (io) io.emit(event, JSON.parse(JSON.stringify(payload)));
};

export const getServices = async (req, res) => {
    const { category, available } = req.query;
    const services = await servicesService.getServices({ category, available });
    res.status(200).json(services);
};

export const getServiceById = async (req, res) => {
    const { sid } = req.params;
    const service = await servicesService.getServiceById(sid);
    res.status(200).json(service);
};

export const createService = async (req, res) => {
    const newService = await servicesService.createService(req.body ?? {});
    emitEvent(req, "service:created", newService);
    res.status(201).json(newService);
};

export const updateService = async (req, res) => {
    const { sid } = req.params;
    const updated = await servicesService.updateService(sid, req.body ?? {});
    emitEvent(req, "service:updated", updated);
    res.status(200).json(updated);
};

export const deleteService = async (req, res) => {
    const { sid } = req.params;
    const deleted = await servicesService.deleteService(sid);
    emitEvent(req, "service:deleted", { id: sid });
    res.status(200).json({ message: "Servicio eliminado", service: deleted });
};