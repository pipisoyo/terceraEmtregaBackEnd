import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt'


// Obtiene la ruta del archivo actual
const __filename = fileURLToPath(import.meta.url);
// Obtiene el directorio del archivo actual
const __dirname = dirname(__filename)

/**
 * Exporta la ruta del directorio del archivo actual.
 */
export default __dirname

/**
 * Crea un hash a partir de una contraseña utilizando bcrypt.
 * @param {string} password - Contraseña a hashear.
 * @returns {string} - Hash de la contraseña.
 */
export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

/**
 * Valida si una contraseña es válida para un usuario utilizando bcrypt.
 * @param {Object} user - Usuario con la contraseña a validar.
 * @param {string} password - Contraseña a verificar.
 * @returns {boolean} - true si la contraseña es válida, false si no lo es.
 */
export const isValidPassword = (user, password) => {
  console.log(
    `Datos a validar: user-password: ${user.password}, password: ${password}`
  );
  return bcrypt.compareSync(password, user.password);
};

/**
 * Genera un código único basado en el ID del carrito y la fecha de compra.
 * @param {string} cartId - ID del carrito.
 * @param {Date} purchaseDatetime - Fecha de compra.
 * @returns {string} Código único generado.
 */
export function generateUniqueCode(cartId, purchaseDatetime) {
  // Combinar el ID del carrito y la fecha de compra en una cadena
  const combinedString = cartId.toString() + purchaseDatetime.toISOString();

  // Generar un hash único a partir de la cadena combinada
  function generateHash(data) {
      const saltRounds = 10; 
      const hash = bcrypt.hashSync(data, saltRounds);
      return hash;
  }

  // Generar el hash único a partir de la cadena combinada
  const hashCode = generateHash(combinedString);

  // Devolver un código único basado en el hash generado
  return hashCode;
}

/**
 * Calcula el monto total de una lista de productos.
 * @param {Array} products - Lista de productos con precio.
 * @returns {number} Monto total calculado.
 */
export function calculateTotalAmount(products) {

  // Verificar si la lista de productos está vacía
  if (products.length === 0) {
      return 0;
  }

  // Calcular el monto total sumando los precios de los productos
  const totalAmount = products.reduce((total, product) => total + product.product.price*product.quantity, 0);



  return totalAmount;
}
