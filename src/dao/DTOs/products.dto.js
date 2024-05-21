export default class ProductDTO {
    constructor({ title, description, price, code, stock, status, category, thumbnails }) {
        // Validación de datos
        if (typeof title !== 'string' || typeof description !== 'string' || typeof price !== 'number' || typeof code !== 'string' || typeof stock !== 'number' || typeof status !== 'boolean' || typeof category !== 'string'){
            throw new Error('Los datos proporcionados no son válidos');
        }

        // Manejo de valores nulos o por defecto
        this.title = title || '';
        this.description = description || '';
        this.price = price || 0;
        this.code = code || '';
        this.stock = stock || 0;
        this.status = status || true;
        this.category = category || '';
        this.thumbnails = thumbnails || [];
        
        // Inmutabilidad
        Object.freeze(this);
    }
}