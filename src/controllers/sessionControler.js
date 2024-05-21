import { createHash } from '../utils.js';
import userModel from '../dao/models/users.js';
import response from '../config/responses.js';
import userDTO from '../dao/DTOs/users.dto.js';

/**
 * Controlador para la gestión de sesiones de usuario.
 */
const sessionController = {

    /**
     * Cierra la sesión del usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return response.errorResponse(res, 500, 'Error al cerrar sesión');
            }
            response.successResponse(res, 200, 'Sesión cerrada exitosamente', null);
        });
    },

    /**
     * Registra a un nuevo usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    register: async (req, res) => {
        response.successResponse(res, 201, 'Usuario registrado exitosamente', null);
    },

    /**
     * Maneja el fallo en el registro de usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    failRegister: async (req, res) => {
        console.log('error');
        response.errorResponse(res, 400, 'Falló el registro');
    },

    /**
     * Inicia sesión de usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    login: async (req, res) => {
        if (!req.user) return response.errorResponse(res, 400, 'Error en el inicio de sesión');
        
        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            age: req.user.age,
            role: req.user.role || 'user',
            cartId: req.user.cart
        };
        const user = userDTO(req.user);
        response.successResponse(res, 200, 'Inicio de sesión exitoso', { user });
    },

    /**
     * Maneja el fallo en el inicio de sesión.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    failLogin: async (req, res) => {
        console.log('error');
        response.errorResponse(res, 400, 'Fallo en el inicio de sesión');
    },

    /**
     * Inicia la autenticación con GitHub.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    githubLogin: async (req, res) => {
        response.successResponse(res, 200, 'Autenticación con GitHub iniciada', null);
    },

    /**
     * Callback de autenticación con GitHub.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    githubCallback: async (req, res) => {
        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            age: req.user.age,
            role: req.user.role,
            cartId: req.user.cart
        };
        res.redirect('/products');
    },

    /**
     * Restaura la contraseña de un usuario.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    restorePassword: async (req, res) => {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return response.errorResponse(res, 400, 'No se encuentra el usuario');
        }

        const newPass = createHash(password);

        await userModel.updateOne({ _id: user._id }, { $set: { password: newPass } });

        response.successResponse(res, 200, 'Contraseña actualizada correctamente', null);
    },

            /**
     * Obtiene el usuario actualmente autenticado.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    getCurrentUser: async (req, res) => {
        if (req.session.user) {
            const user = userDTO(req.session.user);
            response.successResponse(res, 200, 'Usuario autenticado', { user });
        } else {
            response.errorResponse(res, 401, 'Usuario no autenticado');
        }
    }
};

export default sessionController;