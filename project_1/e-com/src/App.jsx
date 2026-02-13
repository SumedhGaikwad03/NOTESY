import axios from "axios";
import React from "react";
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import navbar from "./components/navbar";
import CarouselComponent from "./components/carousel";
import carts_section from "./components/carts_section";


function App() {
  const addToCart = async (product) => {
  try {
    const response = await  axios.post("http://localhost:5000/api/product/addToCart", product);
    console.log(" Item added:", response.data);
    alert("Item added to cart!");
  } catch (error) {
    console.error(" Failed to add to cart:", error);
    alert("Something went wrong. Try again!");
  }
};
  return (
    <div>
      <navbar />
      <CarouselComponent />
      <carts_section/>
     </div>
  )   ; 
}

export default App;
