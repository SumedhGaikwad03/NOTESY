import React from "react";
<section>        
          
       
        <h3 className="text-3xl font-semibold text-center mb-6">  Best Deals !!! </h3> 


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 hover:scale-110 transition-transform duration-300">
            <h4 className="text-lg font-medium flex justify-center ">Chandelier</h4>
            <img src="https://m.media-amazon.com/images/I/51JIK5yI4GL._SY445_SX342_QL70_FMwebp_.jpg" alt="Chandelier" className="w-full h-64 object-cover mb-2" />
            <p className="text-sm">Elegant ceiling chandelier to elevate your room with warm, ambient lighting.</p>
            <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300">
  Add to Cart
</button>
          </div>
          <div className="bg-white p-4 hover:scale-110 transition-transform duration-300">
            <h4 className="text-lg font-medium flex justify-center">Table Lamp</h4>
            <img src="https://m.media-amazon.com/images/I/41qoiNQKJPL._SY445_SX342_QL70_FMwebp_.jpg" alt="Table Lamp" className="w-full h-64 object-cover mb-2" />
            <p className="text-sm">Stylish table lamp perfect for bedside or work desk with soft, focused glow.</p>
            <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300">
  Add to Cart
</button>
          </div>
          <div className="bg-white p-4 hover:scale-110 transition-transform duration-300">
            <h4 className="text-lg font-medium flex justify-center">Wall Clock Set</h4>
            <img src="https://m.media-amazon.com/images/I/714bAiZGL+L._SL1500_.jpg" alt="Wall Clock Set" className="w-full h-64 object-cover mb-2" />
            <p className="text-sm">Minimalist clock set that adds a modern touch to any wall or decor theme.</p>
            <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300">
  Add to Cart
</button>
          </div>
          <div className="bg-white p-4  hover:scale-110 transition-transform duration-300">
            <h4 className="text-lg font-medium flex justify-center">Samsunng Flip</h4>
            <img src="https://m.media-amazon.com/images/I/619PzZAW55L._SL1500_.jpg" alt="smart-phone" className="w-full h-64 object-cover mb-2" />
            <p className="text-sm">Foldable smartphone with a sleek design, pro cameras, and multitasking Flex Mode.</p>
          <button
    onClick={() =>
      addToCart({
        name: "Samsung Galaxy Z Flip",
        price: 94999,
        image: "https://m.media-amazon.com/images/I/717Q2swzhBL._SL1500_.jpg",
      })
    }
    className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300"
  >
    Add to Cart
  </button>
          </div>
           <div className="bg-white p-4 hover:scale-110 transition-transform duration-300">
            <h4 className="text-lg font-medium flex justify-center">Decor Vase</h4>
            <img src="https://m.media-amazon.com/images/I/71ulohdLT0L._SL1500_.jpg" alt="Decor Vase" className="w-full h-64 object-cover mb-2" />
            <p className="text-sm">Contemporary ceramic vase ideal for flowers or standalone home decoration.</p>
            <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300">
  Add to Cart
</button>
          </div>
           <div className="bg-white p-4 hover:scale-110 transition-transform duration-300 ">
            <h4 className="text-lg font-medium flex justify-center">Lg Smart TV </h4>
            <img src="https://m.media-amazon.com/images/I/71+fRevHdUL._SL1500_.jpg" alt="TV" className="w-full h-64 object-cover mb-2" />
            <p className="text-sm">4K UHD Smart TV with vivid visuals, voice control, and built-in streaming apps.</p>
            <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300">
  Add to Cart
</button>
          </div>
           <div className="bg-white p-4 hover:scale-110 transition-transform duration-300">
            <h4 className="text-lg font-medium flex justify-center">Microwave</h4>
            <img src="https://m.media-amazon.com/images/I/61TA6Mtz59L._SL1500_.jpg" alt="Decor Vase" className="w-auto h-64 object-cover mb-2" />
            <p className="text-sm">Smart microwave with even heating, auto-cook menus, and a modern, compact design.</p>
            <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300">
  Add to Cart
</button>
          </div>
           <div className="bg-white p-4 hover:scale-110 transition-transform duration-300">
            <h4 className="text-lg font-medium flex justify-center">Wireless Speaker</h4>
            <img src="https://m.media-amazon.com/images/I/51HoAmENVeL._SX300_SY300_QL70_FMwebp_.jpg" alt="Decor Vase" className="w-full h-64 object-cover mb-2" />
            <p className="text-sm">Portable speaker with deep bass, 12-hour playtime, and splash-resistant build.</p>
            <button className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300">
  Add to Cart 
</button>
          </div>
        </div>
      </section>

      export default carts_section;