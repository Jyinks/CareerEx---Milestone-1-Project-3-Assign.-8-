
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("./authModel")
const Property = require("./propertyModel")

dotenv.config()

app.use(express.json())
const PORT = process.env.PORT || 7000

mongoose.connect(process.env.MONGODB_URL)
.then(()=>{
    console.log("MONGODB Connected....")

    app.listen(PORT, ()=>{
        console.log(`Server running on ${PORT}`)
    })
})

//Test Server
app.get("/", (req, res)=>{
    res.status(200).json({message: 'Welcome to CareerEx Server'})
})

//POST/auth/register
app.post("/register", async (req, res)=>{

try{

    const { email, password, firstName, lastName, location, role } = req.body
    if(!email){
    return res.status(400).json({message: "Please enter your email"})
    }
    if(!password){
    return res.status(400).json({message: "Please enter your password"})
    }
    if(!role){
    return res.status(400).json({message: "Please enter your role"})
    }

    const existingUser = await User.findOne({email})

    if(existingUser){
    return res.status(400).json({message: "User account already exists."})
    }

    if(password.length < 8){
    return res.status(400).json({message: "Password should be a minimum of 8 characters."})
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
          email,
          password: hashedPassword , 
          firstName, 
          lastName, 
          location, 
          role 
        })

        await newUser.save()
    
    res.status(201).json({
        message: "User account created successfully",
        newUser: { email, firstName, lastName, location, role}   //This is to specify the data you wish to send out.
    })

}  catch (error) {
    res.status(500).json({message: error.message})
}
})

//POST/auth/login
app.post("/login", async (req, res)=>{

    try {
        const { email, password } = req.body

        const user = await User.findOne({email})

        if(!user){
            return res.status(404).json({message: "User account does not exist"})
        }

        const isRight = await bcrypt.compare(password, user?.password)

        if(!isRight){
            return res.status(400).json({message: "Incorrect email or password"})
        }

        const accessToken = jwt.sign(
            {id: user?._id},
            process.env.ACCESS_TOKEN,
            {expiresIn: "5m"}
        )

        const refreshToken = jwt.sign(
            {id: user?._id},
            process.env.REFRESH_TOKEN,
            {expiresIn: "30d"}
        )

        res.status(200).json({
            message: "Login Successful",
            accessToken,
            user: {
                email: user?.email,
                firstName: user?.firstName,
                lastName: user?.lastName,
                location: user?.location,
                role: user?.role
            },
            refreshToken
        })

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}) 

//POST/properties(agent)
app.post("/new-property", async (req, res)=>{

    try{

        const { title, price, location, image, agent } = req.body

        if(!title){
            return res.status(400).json({message: "Please enter the title"})
        }

        if(!price){
            return res.status(400).json({message: "Please enter the price"})
        }

        if(!location){
            return res.status(400).json({message: "Please enter the location of the property"})
        }

        if(!agent){
            return res.status(400).json({message: "Please enter the name of the agent"})
        }

        const newProperty = new Property({ title, price, location, image, agent })

        await newProperty.save()

        res.status(201).json({
            message: "Added Successfully",
            newProperty
        })

    } catch (error) {
        res.status(500).json({message: error.message})
    }
})