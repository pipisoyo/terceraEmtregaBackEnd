/**
 * Middleware para verificar la autenticación del usuario.
 * Redirige al usuario a la página de inicio de sesión si no está autenticado.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 * @param {function} next - Función para pasar al siguiente middleware.
 */
export function auth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect("/login");
    }
    next();
}

/**
 * Middleware para verificar la autorización del usuario.
 * Permite el acceso si el usuario es un administrador o si el carrito solicitado pertenece al usuario.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 * @param {function} next - Función para pasar al siguiente middleware.
 */
export function authCartUser(req, res, next) {
    const requestedCartId = req.params.cid;

    if (req.session.user && req.session.user.cartId === requestedCartId) {
        next();
    } else {
        return res.status(403).send({ status: "error", error: "Acceso denegado" });
    }
}

export const authUser = (role) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ status: "error", message: "Usuario no autenticado" })
        }

        const userRole = req.session.user.role;

        if (!role.includes(userRole)) {
            return res.status(403).json({ status: "error", message: "Acceso denegado" });
        }

        next();
    };
};