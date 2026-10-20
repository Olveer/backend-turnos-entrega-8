import bookingsService from "../services/bookings.service.js";

export const createBooking = async (req, res) => {
    const newBooking = await bookingsService.createBooking(req.body ?? {});
    res.status(201).json(newBooking);
};

export const getBookingById = async (req, res) => {
    const { bid } = req.params;
    const booking = await bookingsService.getBookingById(bid);
    res.status(200).json(booking);
};

export const addServiceToBooking = async (req, res) => {
    const { bid, sid } = req.params;
    const updatedBooking = await bookingsService.addServiceToBooking(bid, sid);
    res.status(200).json(updatedBooking);
};