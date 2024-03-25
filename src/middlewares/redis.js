const { createClient } = require("redis")
const hash = require("object-hash")


async function initializeRedisClient(){
    let redisURL = process.env.REDIS_URL
    if(redisURL){
        redisClient = createClient({url:redisURL}).on("error",(error)=>{
            console.error('Failed to create Redis Client with error')
            console.error(error);
        })

        try{
            await redisClient.connect();
            console.log('Connected to Redis Server Successfully')
        }
        catch(error){
            console.log('Connection Failed');
            console.log(error)
        }
    }
}

function requestToKey(req){
    const reqDataToHash = {
        query : req.query,
        body: req.body,
    };
    
    return `${req.path}@${hash.sha1(reqDataToHash)}`;
}

function isRedisServerWorking(){
    return !!redisClient?.isOpen;
}

async function writeData(key,data,options){
    if(isRedisServerWorking){
        try{
            await redisClient.set(key,data,options);
        }catch(error){
            console.error(`Failed to catche data for Key=${key}`,error);
        }
    }
}

async function readData(key){
    let cachedValue = undefined;
    if(isRedisServerWorking()){
        cachedValue = await redisClient.get(key);
        if(cachedValue){
            return cachedValue;
        }
    }
}

function redisCacheMiddleware(
    options = {
        EX: 21600,
    },
    compression = true
){
    return async(req,res,next)=>{
        if(isRedisServerWorking()){
            const key = requestToKey(req);
            const cachedValue = await readData(key);
            if(cachedValue){
                try{
                    return res.json(JSON.parse(cachedValue))
                }
                catch{
                    return res.send(cachedValue)
                }
            }else{
                const oldSend = res.send;
                res.send = function(data){
                    res.send = oldSend;
                    if(res.statusCode.toString().startsWith("2")){
                        writeData(key,data,options).then()
                    }
                    return res.send(data);
                }
                next();
                
            }
        }else{
            next();
        }
    }

}

module.exports = {initializeRedisClient,requestToKey,redisCacheMiddleware};