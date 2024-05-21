// users.dto.js

const userDTO = (user) => {
    const { first_name, last_name, email, age, role } = user;
    return { first_name, last_name, email, age, role };
};

export default userDTO;