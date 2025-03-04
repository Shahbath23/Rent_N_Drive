export const userLoginSchema = {
    name: {
        in: ['body'],
        exists: { errorMessage: "Username is required" },
        notEmpty: { errorMessage: "Username cannot be empty" },
        trim: true,
    },
    password: {
        exists: { errorMessage: "Password is required" },
        notEmpty: { errorMessage: 'Password cannot be empty' },
        trim: true
    }
};
export default userLoginSchema;
