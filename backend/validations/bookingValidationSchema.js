
 const reservationValidationSchema = {
    car: {
        in: ['body'],
        exists: {
            errorMessage: 'Car ID is required',
        },
        isMongoId: {
            errorMessage: 'Invalid car ID',
        },
    },
    startDate: {
        in: ['body'],
        exists: {
            errorMessage: 'Start date is required',
        },
        isDate: {
            errorMessage: 'Invalid start date',
        },
    },
    endDate: {
        in: ['body'],
        exists: {
            errorMessage: 'End date is required',
        },
        isDate: {
            errorMessage: 'Invalid end date',
        },
        custom: {
            options: (value, { req }) => {
                if (new Date(value) <= new Date(req.body.startDate)) {
                    throw new Error('End date must be after start date');
                }
                return true;
            },
        },
    },
    
};
export default reservationValidationSchema