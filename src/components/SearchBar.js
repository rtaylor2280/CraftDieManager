'use client';

import { FaSearch } from "react-icons/fa";

export default function SearchBar({ placeholder }) {
  return (
    <form className="relative">
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full p-3 pl-10 text-gray-900 rounded-lg shadow-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        spellCheck={false}
        data-ms-editor={false}
      />
    </form>
  );
}
