import servicesService from "../services/services.service.js";


const toPlain = (data) => JSON.parse(JSON.stringify(data));

export const renderServices = async (req, res) => {
   
   
const services = await servicesService.getAllServices();
    res.render("services", {
        title: "Servicios",
        view: "services",
        services: toPlain(services),
    });
};

export const renderAvailability = async (req, res) => {

const services = await servicesService.getAllServices({ available: true });
    res.render("availability", {
        title: "Disponibilidad",
        view: "availability",
        services: toPlain(services),
    });
};



