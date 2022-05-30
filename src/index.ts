import { Sequelize } from "sequelize";
import { initModels, product, order, productCreationAttributes, orderCreationAttributes} from "./models/init-models";
import * as dotenv from 'dotenv';
import { ApolloServer, gql } from "apollo-server";
import { readFileSync } from "fs";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();
const typeDefs = readFileSync("./src/product-order.graphql").toString('utf-8')
console.log(process.env);

const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASS as string,{
    host: process.env.DB_HOST as string,
    dialect: 'mysql'
});
initModels(sequelize);

const resolvers = {
    Query: {
        products: async() => await product.findAll()
    },
    Mutation: {
        //PRODUCT
        GetDetailProduct: async (_parent: any, args: any) => {
            return await product.findByPk(args.id)
        }
        ,
        CreateProduct: async (_parent: any, args: any) => {
            const now = new Date();
            const newProduct: productCreationAttributes = {
                name: args.name,
                stock: args.stock,
                price: args.price,
                created: now.toDateString(),
            }
            return await product.create(newProduct)
        }
        ,
        UpdateProduct: async (_parent: any, args: any) => {
            const now = new Date();
            const updProduct: productCreationAttributes = {
                name: args.name,
                stock: args.stock,
                price: args.price,
                created: now.toDateString(),
            };
            return await product.update(updProduct, { where: { id: args.id } });
        },
        DeleteProduct: (_parent: any, args: any) => {
            return product.destroy({ where: { id: args.id } });
        },
        // ORDER
        GetDetailOrder: async (_parent: any, args: any) => {
            return await order.findByPk(args.id)
        },
        CreateOrder: async (_parent: any, args: any) => {
            const now = new Date();
            const generator = uuidv4();
            
            const newOrder: orderCreationAttributes = {
                transcode:generator,
                created: now.toDateString(),
            }
            return await order.create(newOrder)
        },
        UpdateOrder: async (_parent: any, args: any) => {
            const generator = uuidv4();
            const updOrder = {
                transcode: generator,
            };
            await order.update(updOrder, { where: { id: args.id } });
            return await order.findByPk(args.id);
        },
        DeleteOrder: (_parent: any, args: any) => {
            order.destroy({ where: { id: args.id } });
            return order.findByPk(args.id);
        }
    }
}


const server = new ApolloServer({
    typeDefs,
    resolvers,
});

server.listen().then(({url})=>{
    console.log(`🚀 Server ready at ${url}`);
});