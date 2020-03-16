const mongoose=require('mongoose');
var bcrypt=require('bcryptjs');
mongoose.connect('mongodb+srv://acces:acces2019@dbdame-tlsv3.mongodb.net/test?retryWrites=true&w=majority',
		 { useNewUrlParser: true,
		    useUnifiedTopology: true })
		  .then(() => console.log('Connexion à MongoDB réussie !'))
          .catch(() => console.log('Connexion à MongoDB échouée !'));
          var db=mongoose.connection;

          var UserSchema=mongoose.Schema(
              {
                  username:{
                      type:String,
                      index:true
                  },
                  password:{
                      type:String
                  },
                  email:{
                      type:String
                  },
                  name:{
                      type:String
                  }
              });
var User=module.exports=mongoose.model('User',UserSchema);
module.exports.createUser=function(newUser,callback)
{
    bcrypt.genSalt(10,function(err,salt)
    {
        bcrypt.hash(newUser.password,salt,function(err,hash)
        {
            newUser.password=hash;
            newUser.save(callback);
        });
    });

}
module.exports.getUserByUsername=function(username,callback)
{
    var query={username:username};
    Userchema.findOne(query,this.callback);
}
module.exports.getUserById=function(id,callback)
{
    User.findById(id,callback);
}
module.exports.comparePassword=function(canidatePassword,hash,callback)
{
    bcrypt.compare(canidatePassword,hash,function(err,isMatch)
    {
        if(err) throw err;
        callback(null,isMatch);
    });
};