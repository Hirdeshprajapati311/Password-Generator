'use client'
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuthSync } from '@/hooks/useAuthSync';
import { ModeToggle } from './ModeToggleButton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Spinner } from './ui/spinner';
import { LogOut, Vault, Wand2, Menu, Shield } from 'lucide-react';

const items = [
  {
    path: "/vault",
    name: "User Vault",
    icon: Vault,
  },
  {
    path: "/generator",
    name: "Password Generator",
    icon: Wand2,
  }
]

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  useAuthSync();
  const { setUserId, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-16 border-b bg-background/95 backdrop-blur-sm">
        <Spinner />
      </div>
    );
  }

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("vaultKey");
      setUserId(null)
      router.push("/auth/login");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm shadow-sm">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left Section: Logo and Navigation */}
        <div className="flex ml-40 items-center space-x-6">
          {/* Logo */}
          <Link href="/vault" className="flex items-center space-x-2 group">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PassVault
            </span>
          </Link>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-1 sm:flex">
            {items.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.path} >
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`flex items-center gap-2 font-medium transition-all duration-200 ${isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shadow-sm"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center space-x-3">

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center space-x-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <ModeToggle />
          </div>

          {/* Mobile Menu */}
          <div className="sm:hidden flex items-center space-x-2">
            <ModeToggle />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[340px]">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center space-x-2 pb-6 border-b">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      PassVault
                    </span>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 space-y-3 py-6">
                    {items.map((item) => {
                      const isActive = pathname === item.path;
                      const Icon = item.icon;
                      return (
                        <SheetClose asChild key={item.name}>
                          <Link href={item.path}>
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              className="w-full justify-start gap-3 h-12 text-base font-medium"
                            >
                              <Icon className="h-5 w-5" />
                              {item.name}
                              {isActive && (
                                <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </Button>
                          </Link>
                        </SheetClose>
                      )
                    })}
                  </nav>

                  {/* Footer Actions */}
                  <div className="space-y-4 pt-6 border-t">
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full justify-center gap-3 h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Logout</span>
                    </Button>

                    <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                      Secure Password Manager
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;