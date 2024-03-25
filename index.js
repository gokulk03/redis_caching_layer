const express = require('express')
require("dotenv").config();
const {UserController} = require('./src/controllers/users')
const {initializeRedisClient,redisCacheMiddleware} = require('./src/middlewares/redis')

async function initializeExpressServer(){
    const app = express();
    app.use(express.json());

    await initializeRedisClient();

    app.get('/api/users',redisCacheMiddleware(),UserController.getAll)

    const port = 3000;
    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    });
}
initializeExpressServer()
    .then()
    .catch((error)=>console.error(error));





