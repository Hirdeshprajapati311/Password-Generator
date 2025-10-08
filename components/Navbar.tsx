
'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { ModeToggle } from './ModeToggleButton';


const items = [
  {
    path: "/vault",
    name: "User Vault",
  },
  {
    path: "/generator",
    name: "Password Generator",
  }
]

const Navbar = () => {

  const pathname = usePathname();
  return (
    <div className="grid grid-cols-9 items-center p-4 gap-2">
      {items.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link className='col-span-4' key={item.name} href={item.path}>
            <button
              className={`w-full py-2 cursor-pointer rounded-lg transition ${isActive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
            >
              {item.name}
            </button>
          </Link>
        );
        
      })}
      <ModeToggle  />

    </div>
  );
}

export default Navbar;
