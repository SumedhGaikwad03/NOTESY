 import React,{useState} from 'react';
 import axios from 'axios';
 
 function Search() {
    const [query,setQuery] = useState('');
    const [results,setResults] = useState([]);
    
 }
 <nav className="bg-gray-800 text-white h-24 py-2 px-4">

       
         <h2>
            <a href="#home" className="text-6xl font-bold justify-start px-6 py-12 ">shopEasyy</a>
          </h2>
        <ul className="flex justify-end items-center  space-x-16     text-base py-0 ">
           <li></li>
          <li><a href="/api/auth/login">Home
</a></li>
          <li><a href="#shop">Login</a></li>
          <li><a href="#categories">Register</a></li>
          <li><a href="#cart">Cart</a></li>
          <li><a href="#login">Categories</a></li>
        </ul>
      </nav>

export default navbar; 