"use client"; // If you're using Next.js 13 app router and want this to be a client component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

const Header: React.FC = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]); // Holds matching patient IDs
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setQuery(input);
  
    if (input.length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
  
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search-transcriptions?q=${encodeURIComponent(input)}`
      );
      const data = await res.json();

      setSuggestions(data);
      setShowDropdown(data.length > 0);
      
    } catch (err) {
      console.error("Failed to fetch search results", err);
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (value: string) => {
    setQuery(value);
    setShowDropdown(false);
    setSuggestions([]);
    router.push(`/patient?patient_id=${encodeURIComponent(value)}`);
  };

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Brand Name */}
        <Link href="/">
          <span className="text-xl font-bold text-gray-800 hover:text-gray-600">
            MedScribe
          </span>
        </Link>

        {/* Navigation */}
        <nav>
          <ul className="flex space-x-6">
            {/* Search Bar */}
            <li className="relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Patient"
                    className="border-2 border-black rounded-full pl-6 px-3 text-black placeholder-black focus:outline-none focus:border-black"
                    value={query}
                    onChange={handleInputChange}
                  />
              </div>
              {showDropdown && suggestions.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto px-1">
                  {suggestions.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelect(item)}
                      className="px-2 py-2 cursor-pointer hover:bg-gray-100 text-sm text-black"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
