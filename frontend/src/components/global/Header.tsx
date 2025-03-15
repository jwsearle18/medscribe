"use client"; // If you're using Next.js 13 app router and want this to be a client component

import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Brand Name */}
        <Link href="/">
          <span className="text-xl font-bold text-gray-800 hover:text-gray-600">
            CodeMed AI
          </span>
        </Link>

        {/* Navigation */}
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link
                href="/features"
                className="text-gray-700 hover:text-gray-900"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                className="text-gray-700 hover:text-gray-900"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/docs"
                className="text-gray-700 hover:text-gray-900"
              >
                Docs
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
