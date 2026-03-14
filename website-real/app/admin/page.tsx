"use client";

import { useState, useEffect } from "react";
import { supabase } from "../supabase-client";
import Navbar from "@/components/Navbar";

export default function AdminPage() {
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [user, setUser] = useState<unknown | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      setUser(data.user ?? null)
      setIsSignedIn(!!data.user)
      setIsLoaded(true)
    })()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      setIsSignedIn(!!u)
      setIsLoaded(true)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])
  useEffect(() => {
    if (!isLoaded) return; // Still loading
    
    // If not signed in or not admin, don't render admin UI.
    type UserWithMetadata = { user_metadata?: { role?: string } }
    let role: string | undefined = undefined
    if (user && typeof user === 'object') {
      const u = user as UserWithMetadata
      role = u.user_metadata?.role
    }
    if (!isSignedIn || role !== "admin") {
      return
    }
  }, [isLoaded, isSignedIn, user]);

  const seedDatabase = async () => {
    try {
      const response = await fetch("/api/admin/seed", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SEED_TOKEN || "admin-seed-token"}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert("Database seeded successfully!");
      } else {
        alert("Failed to seed database: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Error seeding database");
    }
  };

  if (!isLoaded) {
    return (
	<div className="min-h-screen bg-[#fbf6f0]">
        <Navbar isShopDropdownOpen={isShopDropdownOpen} setIsShopDropdownOpen={setIsShopDropdownOpen} />
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  type UserWithMetadata = { user_metadata?: { role?: string } }
  let role: string | undefined = undefined
  if (user && typeof user === 'object') {
    const u = user as UserWithMetadata
    role = u.user_metadata?.role
  }
  if (role !== "admin") {
    return null;
  }

  return (
	<div className="min-h-screen bg-[#fbf6f0]">
      <Navbar isShopDropdownOpen={isShopDropdownOpen} setIsShopDropdownOpen={setIsShopDropdownOpen} />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Database Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Database</h2>
              <p className="text-gray-600 mb-4">Seed the database with sample products and admin user.</p>
              <button
                onClick={seedDatabase}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Seed Database
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Admin: admin@.ny / admin123
              </p>
            </div>

            {/* Product Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Products</h2>
              <p className="text-gray-600 mb-4">Manage your product catalog.</p>
              <div className="space-y-2">
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                  Add Product
                </button>
                <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                  View All Products
                </button>
              </div>
            </div>

            {/* Order Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Orders</h2>
              <p className="text-gray-600 mb-4">Manage customer orders and fulfillment.</p>
              <div className="space-y-2">
                <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                  View Orders
                </button>
                <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
                  Update Status
                </button>
              </div>
            </div>

            {/* User Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Users</h2>
              <p className="text-gray-600 mb-4">Manage user accounts and permissions.</p>
              <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                View Users
              </button>
            </div>

            {/* Analytics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h2>
              <p className="text-gray-600 mb-4">View sales and performance metrics.</p>
              <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors">
                View Reports
              </button>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
              <p className="text-gray-600 mb-4">Configure store settings and preferences.</p>
              <button className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                Store Settings
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">--</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">--</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">--</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">$--</div>
                <div className="text-sm text-gray-600">Total Sales</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
