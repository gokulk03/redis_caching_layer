const UserController = {
    getAll: async(req,res)=>{
        await new Promise(resolve=>setTimeout(resolve,250));
        let users = [
            {id:1,email:"abc@gmail.com",name:"abc"},
            {id:2,email:"def@gmail.com",name:"def"},
            {id:3,email:"ghi@gmail.com",name:"ghi"},
            {id:4,email:"jkl@gmail.com",name:"jkl"},
            {id:5,email:"mno@gmail.com",name:"mno"},
        ];

        res.json({
            users:users,
        })
    },
};
module.exports = {UserController};