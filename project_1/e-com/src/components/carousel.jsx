import React from "react";
import { Carousel } from 'react-responsive-carousel';
<section className="bg-white">
  <Carousel
    autoPlay
    infiniteLoop
    showThumbs={false}
    showStatus={false}
    interval={2000}
    className="max-w-4xl mx-auto py-6"
  >
    <div>
      <img src="https://m.media-amazon.com/images/I/51JIK5yI4GL._SY445_SX342_QL70_FMwebp_.jpg" alt="Slide 1" />
    </div>
    <div>
      <img src="https://m.media-amazon.com/images/I/41qoiNQKJPL._SY445_SX342_QL70_FMwebp_.jpg" alt="Slide 2" />
    </div>
    <div>
      <img src="https://m.media-amazon.com/images/I/714bAiZGL+L._SL1500_.jpg" alt="Slide 3" />
    </div>
  </Carousel>
</section>

export default Carousel;
