const mongoose = require("mongoose");


const{Schema}= mongoose;
const productschemas  = new Schema ({
    name: {
        type : String,
        required : true,

    },
    description : {
        type : String,
        required : true,
        unique : true

    },
    price : {
        type :String ,
        required :true 
    } ,

    image : {
        type :String,
        required:true
    }
    
});
const cartSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
});

const Cart = mongoose.model("Cart", cartSchema);

const Product = mongoose.model('Product',productschemas);
module.exports= {Product,Cart};
