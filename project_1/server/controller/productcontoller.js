const {Product , Cart} = require("../model/products");


const axios = require("axios");

const get_all_products = async (req , res ) => {
    try{
        res.status(200).json('all products are fetched ');
    }
    catch(error){
        console.error("error fetching notes :",error);
        res.status(500).json({message :'error fetching products',error:error.message});

    }
}

const get_one_products = async (req , res ) => {
    try{
        const productId = req.params.id; 

    const product = await Product.findById(productId); // Mongoose method to find by ID

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);

       
    }
    catch(error){
        console.error("error fetching items :",error);
        res.status(500).json({message :'error fetching products',error:error.message});

    }
}

const create_product = async (req , res) => 
{
    try {
        const product = new Product({
            name:req.body.name,
            description:req.body.description,
            price:req.body.price,
            image:req.body.image

        });
        const createdProduct = await product.save();

         res.status(201).json({createdProduct});
        
    }
    catch(error){
        res.status(500).json({message :'error creating  products',error:error.message});

    }
}


const update_product = async (req , res) => 
{
    try {
        const product = await Product.findById(req.params.id);
    if(product){
        product.name=req.body.name || product.name ;
        product.price=req.body.price || product.price;
        product.description=req.body.description || product.price;
        product.image=req.body.image|| product.image;

        const updated_product = await product.save();
        res.json(updated_product);


    }else {
        res.status(404).json({message: "message not found "}); 
    }
    }
         
    catch(error){
        res.status(500).json({message :'error updating products',error:error.message});

    }
}

const addToCart = async (req, res) => {
  try {
    const { name, price, image } = req.body;

    if (!name || !price || !image) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newItem = new Cart({ name, price, image });
    await newItem.save();

    res.status(201).json({ message: "Item added to cart", item: newItem });
  } catch (error) {
    console.error("Add to cart failed:", error.message);
    res.status(500).json({ error: "Failed to add to cart",error: error.message });
  }
};





module.exports={
    get_all_products,
    get_one_products,
    create_product, 
    update_product,
    addToCart
};