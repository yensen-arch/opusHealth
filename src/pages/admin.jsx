import React, { useState, useEffect } from "react";
import { FaSearch, FaTrash, FaSignOutAlt, FaLock } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });

  // Create continuous animation for background bubbles
  useEffect(() => {
    let animationFrame;
    let angle = 0;

    const animate = () => {
      // Create a smooth circular motion
      const x = Math.sin(angle) * 30;
      const y = Math.cos(angle) * 30;
      setAnimationPosition({ x, y });

      // Increment angle for continuous motion
      angle += 0.005;
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Load data if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscribers();
    }
  }, [isAuthenticated]);

  // Filter subscribers when search term changes
  useEffect(() => {
    if (subscribers.length > 0) {
      const filtered = subscribers.filter((sub) =>
        sub.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubscribers(filtered);
    }
  }, [searchTerm, subscribers]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/subscribers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers);
        setFilteredSubscribers(data.subscribers);
      } else {
        toast.error("Failed to fetch subscribers");
        if (response.status === 401) {
          // Token expired or invalid
          handleLogout();
        }
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("adminToken", data.token);
        setIsAuthenticated(true);
        toast.success("Login successful!");
      } else {
        toast.error(
          data.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
  };

  const handleDeleteSubscriber = async (subscriberEmail) => {
    try {
      const response = await fetch("/api/admin/subscribers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ email: subscriberEmail }),
      });

      if (response.ok) {
        toast.success("Subscriber deleted successfully");
        // Update local state to remove the deleted subscriber
        const updatedSubscribers = subscribers.filter(
          (sub) => sub.email !== subscriberEmail
        );
        setSubscribers(updatedSubscribers);
        setFilteredSubscribers(
          updatedSubscribers.filter((sub) =>
            sub.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete subscriber");

        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      // Verify token with backend
      const verifyToken = async () => {
        try {
          const response = await fetch("/api/admin/verify", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            // Invalid token, clear it
            localStorage.removeItem("adminToken");
          }
        } catch (error) {
          console.error("Token verification error:", error);
          localStorage.removeItem("adminToken");
        }
      };

      verifyToken();
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-500 via-purple-400 to-indigo-400">
      {/* Toast notification container */}
      <Toaster position="top-center" />

      {/* Dynamic bubbles */}
      <div
        className="absolute top-20 left-20 w-64 h-64 bg-purple-500 rounded-full opacity-20 blur-3xl"
        style={{
          transform: `translate(${animationPosition.x}px, ${animationPosition.y}px)`,
        }}
      ></div>
      <div
        className="absolute bottom-20 right-40 w-80 h-80 bg-indigo-500 rounded-full opacity-20 blur-3xl"
        style={{
          transform: `translate(${-animationPosition.x * 1.5}px, ${
            -animationPosition.y * 1.5
          }px)`,
        }}
      ></div>
      <div
        className="absolute top-1/3 left-1/4 w-40 h-40 bg-pink-500 rounded-full opacity-20 blur-3xl"
        style={{
          transform: `translate(${animationPosition.y * 2}px, ${
            -animationPosition.x * 2
          }px)`,
        }}
      ></div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-screen">
          {!isAuthenticated ? (
            // Login Form
            <div className="w-full max-w-md">
              <div className="backdrop-blur-lg bg-white/30 rounded-2xl shadow-xl border border-white/30 p-8">
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-purple-500/20 backdrop-blur-md border border-white/30">
                    <FaLock className="text-slate-800 text-2xl" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 text-center mb-6 drop-shadow-md">
                  Admin Login
                </h2>

                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label
                      className="block text-slate-800 font-medium mb-2 drop-shadow-sm"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/40 backdrop-blur-md text-slate-800 placeholder-gray-500 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter Your Email"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      className="block text-slate-800 font-medium mb-2 drop-shadow-sm"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/40 backdrop-blur-md text-slate-800 placeholder-gray-500 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg bg-purple-700 hover:bg-purple-800 text-slate-800 font-medium shadow-lg transition-all transform hover:scale-105 ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            // Admin Dashboard
            <div className="w-full max-w-4xl">
              <div className="backdrop-blur-lg bg-white/50 rounded-2xl shadow-xl border border-white/30 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white drop-shadow-md">
                    Subscriber Management
                  </h2>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>

                {/* Search bar */}
                <div className="relative mb-6">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-lg bg-white/40 backdrop-blur-md text-slate-500 placeholder-gray-500 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Search subscribers..."
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                </div>

                {/* Subscribers list */}
                <div className="bg-white/20 backdrop-blur-md rounded-xl border border-white/30 overflow-hidden">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  ) : filteredSubscribers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-white/20">
                        <thead>
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-800 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-slate-800 uppercase tracking-wider">
                              Registration Date
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-slate-800 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {filteredSubscribers.map((subscriber, index) => (
                            <tr
                              key={index}
                              className="hover:bg-white/10 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                                {subscriber.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800/90">
                                {new Date(
                                  subscriber.registeredAt
                                ).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <button
                                  onClick={() =>
                                    handleDeleteSubscriber(subscriber.email)
                                  }
                                  className="text-slate-800 hover:text-red-200 transition-colors"
                                  aria-label="Delete subscriber"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-800">
                      {searchTerm
                        ? "No subscribers found matching your search."
                        : "No subscribers found."}
                    </div>
                  )}
                </div>

                {/* Stats summary */}
                <div className="mt-6 flex justify-between items-center bg-white/20 backdrop-blur-md rounded-xl border border-white/30 p-4">
                  <div className="text-slate-800">
                    <span className="font-bold">Total Subscribers:</span>{" "}
                    {subscribers.length}
                  </div>
                  <button
                    onClick={fetchSubscribers}
                    className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-medium shadow-lg transition-all"
                    disabled={loading}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
