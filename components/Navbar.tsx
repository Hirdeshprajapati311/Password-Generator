
'use client'
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { ModeToggle } from './ModeToggleButton';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut } from 'lucide-react';


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
  const router = useRouter();

  const {isLoggeedIn,logout} = useAuthStore()

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("vaultKey");
      logout();
      router.push("/login");
    }
  };
  return (
    <>
      {
        isLoggeedIn && (
          <div className="grid grid-cols-9 items-center p-4 gap-2">
            {items.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link className='col-span-3' key={item.name} href={item.path}>
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

            <button
              onClick={handleLogout}
              className="px-4 col-span-2 py-2 items-center flex cursor-pointer rounded gap-1 bg-red-400 hover:bg-red-500 justify-center transition-colors"
            >
              <LogOut /> Logout
            </button>

            <ModeToggle />

          </div>
        )
    }
    </>
  );
}

export default Navbar;
