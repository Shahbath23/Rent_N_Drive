import User from "../model/userModel.js";

export const userRegisterSchema = {
    name: {
        in: ['body'],
        exists: { errorMessage: "Username is required" },
        notEmpty: { errorMessage: "Username cannot be empty" },
        trim: true,
        custom: {
            options: async function (value) {
                const user = await User.findOne({ name: value });
                if (user) {
                    throw new Error('Username is already taken');
                }
                return true;
            }
        }
    },
    email: {
        in: ['body'],
        exists: { errorMessage: "Email is required" },
        notEmpty: { errorMessage: "Email cannot be empty" },
        isEmail: { errorMessage: "Invalid email format" },
        custom: {
            options: async function (value) {
                const user = await User.findOne({ email: value });
                if (user) {
                    throw new Error('Email is already in use');
                }
                return true;
            }
        },
        trim: true
    },
    phoneNo: {
        in: ['body'],
        exists: { errorMessage: "Phone number is required" },
        notEmpty: { errorMessage: "Phone number cannot be empty" },
        custom: {
            options: async function (value) {
                const user = await User.findOne({ phoneNo: value });
                if (user) {
                    throw new Error('Phone number is already registered');
                }
                return true;
            }
        }
    },
    password: {
        exists: { errorMessage: "Password is required" },
        notEmpty: { errorMessage: 'Password cannot be empty' },
        isStrongPassword: {
            options: {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minSymbol: 1,
                minNumber: 1
            },
            errorMessage: 'Password must contain at least one lowercase, one uppercase, one number, one symbol, and be minimum 8 characters long'
        },
        trim: true
    }
};
