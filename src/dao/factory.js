import AppConfig from '../config.js';
import mongoose from 'mongoose';

export let Products;
export let Carts;

const DB_URL = AppConfig.mongo_url;
const persistence = AppConfig.persistence
console.log("🚀 ~ persistence:", persistence)

switch (persistence) {
    case "MONGO":
        const connection = async () => {
            const dataBase = 'ecommerce';
            try {
                await mongoose.connect(DB_URL, { dbName: dataBase });
                console.log("Conectado a la base de datos 'ecommerce'");
            } catch (error) {
                console.error("No se pudo conectar a la base de datos", error);
                process.exit();
            }
        };

        const { default: ProductsMongo } = await import("./mongo/products.mongo.js");
        Products = ProductsMongo;

        const { default: CartsMongo } = await import ("./mongo/carts.mongo.js")
        Carts = CartsMongo;

        break;
    case "MEMORY":c
        const { default: ProductsMemory } = await import("./memory/products.memory.js");
        Products = ProductsMemory;
        
        const { default: CartsMemory} = await import ("./memory/carts.memory.js")
        Carts = CartsMemory;
        break;
    default:
        break;
}