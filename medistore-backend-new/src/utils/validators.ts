import bcrypt from "bcryptjs";

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hashed: string) => {
    return await bcrypt.compare(password, hashed);
};

export const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePassword = (password: string) => {
    return password.length >= 6;
};
