const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const {registermodel} = require("./models/register")
const postModel = require("./models/posts")

const app = express()
app.use(express.json())
app.use(cors())



mongoose.connect("mongodb+srv://Jafna02:jafna9074@cluster0.icijy.mongodb.net/bloggDb?retryWrites=true&w=majority&appName=Cluster0")

//create post

app.post("/create",async(req,res)=>{
    let input=req.body
    let token= req.headers.token
    jwt.verify(token,"blogg-app",async(error,decoded)=>{
        if (decoded && decoded.email) {
            
            let result=new postModel(input)
            await result.save()
            res.json({"status":"success"})

        } else {
            res.json({"status":"Invalid Authentication"})
        }
    })
})

const generateHashedPassword = async(password) =>{
    const salt = await bcrypt.genSalt(10)  //salt=cost factor value
    return bcrypt.hash(password,salt)
}

app.post("/signUp",async(req,res)=>{

    let input = req.body
    let hashedPassword = await generateHashedPassword(input.password)
    console.log(hashedPassword)

    input.password = hashedPassword     //stored the hashed password to server
    let register = new registermodel(input)
    register.save()
    console.log(register)

    res.json({"status":"success"})
})



app.post("/login",(req,res)=>{
    let input = req.body
    registermodel.find({"email":req.body.email}).then(
    (response)=>{
        if(response.length > 0){
            let dbPassword = response[0].password
            console.log(dbPassword)
            bcrypt.compare(input.password,dbPassword,(error,isMatch)=>{ //input pswd and hashed pswd is  compared
                if (isMatch) {
                    //if login success generate token
                    jwt.sign({email:input.email},"blogg-app",{expiresIn:"1d"},
                        (error,token)=>{
                            if (error) {
                                res.json({"status":"unable to create token"})
                            } else {
                                res.json({"status":"success","userId":response[0]._id,"token":token})
                            }
                        }
                    )
                } else {
                    res.json({"status":"incorrect"})
                }
            })
            
        } else {
            res.json({"status":"user not found"})
        }
    }
    ).catch()
  
})

app.listen(8080,(req,res)=>{
    console.log("server started")
})