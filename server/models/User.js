const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name:{
      type:String,
      maxlength:50
  },
  email:{
      type:String,
      trim:true,
      unique:1
  },
  password:{
      type:String,
      maxlength:500
  },
  lastname:{
      type: String,
      maxlength:50
  },
  role:{
      type:Number,
      default:0
  },
  image: String,
  token:{
      type:String
  },
  tokenExp:{
      type:Number
  }
})

userSchema.pre("save", function (next) {
  var user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function(plainPassword,cb){
  //plainPassword 1234567 암호화된 비밀번호 $2b$10$9e0OR0.sSg95nA.G5i.xl.mqiUxaxOXBZ4vQYwXUAqhs0wt4x9U/O
  bcrypt.compare(plainPassword, this.password, function(err,isMatch){
      if(err) return cb(err);
          cb(null, isMatch);
  })
}

userSchema.methods.generateToken = function(cb){
  var user = this;
  //jsonwebtoken을 이용해서 token 생성하기
  var token = jwt.sign(user._id.toHexString(), 'secretToken')
  
  user.token = token
  user.save(function(err,user){
      if(err) return cb(err)
      cb(null, user)
  })
}

userSchema.statics.findByToken = function (token, cb) {
  var user = this;
  //user._id + "" = token;
  //decoding token
  jwt.verify(token, "secretToken", function (err, decoded) {
    //using userId, check token in client and DB
    user.findOne({ "_id": decoded, "token": token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model('User', userSchema)

module.exports = { User }