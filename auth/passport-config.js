const passport = require('passport');
const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const db = require('../config/db');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
};

passport.use(new JwtStrategy(jwtOptions, (jwtPayload, done) => {
    console.log("jwtPayload",jwtPayload)
    const {username,password_hash} = jwtPayload;
    const query = "SELECT * FROM users WHERE username = $1 AND password_hash = $2";
    db.query(query,[username,password_hash],(err, result) => {

        if (err) {
            return done(err, false);
        }

        if(result.rows.length ===1){
            done(null, result.rows[0]);  
        }else{
            done(null, false)
        }
    })

  // Implement user authentication logic here
  // You need to find the user based on the information in jwtPayload
  // Call done(null, user) if the user is found, or done(null, false) if not found
}));

module.exports = passport;
