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
    <header className="bg-bone border-b border-rule">
      <div className="mx-auto max-w-6xl px-6 py-3.5 flex items-center justify-between">
        {/* Brand: the serif signals a record about a person. */}
        <Link href="/" className="focus-ring rounded-sm">
          <span className="font-serif text-[1.35rem] leading-none tracking-[-0.01em] text-ink hover:text-graphite transition-colors">
            MedScribe
          </span>
        </Link>

        {/* Patient search */}
        <nav>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mute pointer-events-none" />
            <input
              type="text"
              placeholder="Search patient"
              aria-label="Search patient by ID"
              className="focus-ring w-56 rounded-md border border-rule bg-bone py-1.5 pl-8 pr-3 text-[0.9375rem] text-ink placeholder-mute focus:border-ink"
              value={query}
              onChange={handleInputChange}
            />
            {showDropdown && suggestions.length > 0 && (
              <ul className="overlay-shadow absolute z-50 mt-1.5 w-full overflow-hidden rounded-md border border-rule bg-bone">
                {suggestions.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelect(item)}
                    className="cursor-pointer px-3 py-2 text-sm text-ink hover:bg-chart"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
