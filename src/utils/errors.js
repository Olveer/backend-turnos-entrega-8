export const notFoundError = (message) => {
    const error = new Error(message);
    error.name = "NotFoundError";
    return error;
};