var mongoose=require('mongoose')
mongoose.connect('mongodb://localhost/chat-socket',{ useNewUrlParser: true })
var Schema=mongoose.Schema

var userSchema=new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    url: {
        type: String
    }
})

module.exports=mongoose.model('User',userSchema)