const express = require('express');
const app = express();
const db = require('./config/db');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const port = process.env.PORT || 3000;
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const passportConfig = require('./auth/passport-config')

 

const authenticateJWT = require('./auth/jwt-auth') 
const logFilePath = path.join(__dirname, 'access.log');
// Create a writable stream for the log file
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });


    app.use(passportConfig.initialize());
    app.use(bodyParser.json());
    app.use(morgan('combined', { stream: logStream }));
    
    
    function authorize(role) {
        return (req, res, next) => {
          const user = req.user; // The user object obtained during authentication
          console.log("user",req.user);
          if (user && user.role === role) {
            next(); // User has the required role, allow access
          } else {
            res.status(403).json({ message: 'Access denied' }); // User does not have the required role
          }
        };
      }




    app.post('/create',passportConfig.authenticate('jwt', { session: false }),(req,res,next)=>{
    try {
        const {name , email , password} = req.body;
        const query = "INSERT INTO users (username, email, password_hash) VALUES($1,$2,$3) RETURNING * ";
        const result = db.query(query, [name, email, password], function (err, result) {
            if (err) {
                
                return res.status(500).json({ error: 'Database insertion failed' });
                // Handle the error here
            } else {
                // Query was successful, you can process the result here
                return res.status(200).json({ success: 'Data inserted successfully!' });
            }
        })

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
    })

    app.get("/user/:id",passportConfig.authenticate('jwt', { session: false }),function (req, res, next) {
        try{
            const userId = req.params.id;
            const query = "SELECT * FROM users WHERE user_id = $1";

            db.query(query,[userId],(err,result)=>{
                if(result.rows.length === 0)
                res.status(404).json({ error: 'User not found' });
                else
                res.status(200).json({sucess:result.rows})
                })
            }catch(err){
                console.error('Error:', err);
                res.status(500).json({ error: 'An error occurred' });
            }
        })

    app.get("/users",passportConfig.authenticate('jwt', { session: false }), authorize('admin'),function (req, res, next) {
        try{
            
            const query = "SELECT * FROM users";
    
            db.query(query,(err,result)=>{
                if(result.rows.length === 0)
                  res.status(404).json({ error: 'Users not found' });
                else
                  res.status(200).json({sucess:result.rows})
                })
            }catch(err){
                console.error('Error:', err);
                res.status(500).json({ error: 'An error occurred' });
            }
        })    


    app.put("/user/:id",passportConfig.authenticate('jwt', { session: false }),async function(req, res, next){
        try{
            const userId = req.params.id;
            const {name, email} = req.body;
            console.log({name, email})
            const query = "UPDATE users SET username = $1, email = $2 WHERE user_id = $3 RETURNING *";
            const result = db.query(query, [name,email,userId ], function (err, result) {
                if (err) {
                    console.log("err",err)
                    return res.status(500).json({ error: 'Database insertion failed' });
                    // Handle the error here
                } else {
                    // Query was successful, you can process the result here
                    return res.status(200).json({ success: 'Data inserted successfully!' });
                }
            })
        }catch(error){
            console.error('Error:', err);
            res.status(500).json({ error: 'An error occurred' });
        }
    })


    app.delete("/user/:id",passportConfig.authenticate('jwt', { session: false }),function(req, res, next){
        try{
        const userId = req.params.id;
        const query = "DELETE FROM users WHERE user_id = $1 RETURNING *";
        db.query(query,[userId],(error,result)=>{
            if (result.rows.length === 0) {
                res.status(404).json({ error: 'User not found' });
            } else {
                res.json({ message: 'User deleted successfully' });
            }
            });
        }catch(error){
            console.error('Error:', err);
            res.status(500).json({ error: 'An error occurred' });
        }
    })


    app.post('/login', (req, res) => {
        const { name, password } = req.body;
        const query = "SELECT * FROM users WHERE username = $1 AND password_hash = $2"
        
        db.query(query, [name, password] , (err,result) => {
                if(result.rows.length === 0) {
                    res.status(404).json({message: 'user not found'})
                }else{
                    const expiresIn = '60s';
                    const token = jwt.sign(result.rows[0], process.env.SECRET_KEY,{ expiresIn });
    
                    res.json({ token });
                }
        })    
    });
  
app.listen(port,()=>{
    console.log(`App is running on port : ${port}`)
});