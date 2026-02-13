const express = require('express');
const router = express.Router();
const {get_all_products,get_one_products,create_product,update_product,addToCart}=require('../controller/productcontoller');


router.get('/',(req,res) => {
    res.send('product route is working ');
});

router.get('/all',get_all_products);
router.get('/get_one',get_one_products);
router.post('/create_product',create_product);
router.put('/update_products',update_product);
router.post('/addToCart', addToCart);
module.exports = router;
