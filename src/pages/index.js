import React, { useState, useEffect } from "react";
import { FaTwitter, FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";
import { SiDiscord } from "react-icons/si";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";
import logo from "../../public/logo.png";
export default function Home() {
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setIsValid(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Thanks for signing up, See you soon!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ),
          { duration: 3000 }
        );

        setEmail("");
      } else {
        // Handle different error cases
        if (data.error === "EMAIL_EXISTS") {
          toast.error("This email is already registered!", { autoClose: 3000 });
        } else {
          toast.error("Failed to register. Please try again.", {
            autoClose: 3000,
          });
        }
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-r from-[#F4F5F7] to-[#3F3BF2] animate-gradient bg-[length:200%_200%]">
      {/* Toast notification container */}
      <Toaster position="top-center" />
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
        {/* Purple icon at the top */}
        <Image src={logo} alt="Logo" width={60} height={30} className="pb-10" />

        {/* Main content */}
        <div className="text-center">
          <h1
            className="text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
          >
            Opus Health
          </h1>
          <h2
            className="text-3xl font-semibold text-white mb-8"
            style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
          >
            Transforming Healthcare Payments through Cash Pay and HSA Automation
          </h2>

          <p
            className="text-lg text-white mb-8 font-medium"
            style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
          >
            Join our waitlist for early access to our Membership and HSA
            Automation platform.
          </p>

          <p
            className="text-md text-white mb-12 font-medium"
            style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
          >
            Increasing Revenue for Providers While Delivering Transparent,
            Cost-Saving Care for Patients.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <div className="flex-grow">
              <input
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsValid(true);
                }}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white/40 backdrop-blur-md text-black placeholder-gray-700 border ${
                  !isValid ? "border-red-500" : "border-white/30"
                }`}
                disabled={isSubmitting}
                style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
              />
              {!isValid && (
                <p
                  className="text-red-200 text-sm mt-1 text-left font-medium"
                  style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
                >
                  Please enter a valid email
                </p>
              )}
            </div>
            <button
              type="submit"
              className={`px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-lg shadow-lg transition-all hover:scale-105 hover:shadow-xl ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
              style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
            >
              {isSubmitting ? "Submitting..." : "Get Notified"}
            </button>
          </form>

          {/* Waitlist indicators */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium border-2 border-white">
                JD
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white text-sm font-medium border-2 border-white">
                AS
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium border-2 border-white">
                MK
              </div>
            </div>
            <span
              className="text-white font-medium"
              style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
            >
              100+ people on the waitlist
            </span>
          </div>
        </div>

        {/* Social icons */}
        <div className="mt-8 flex gap-6">
          <a
            href="#"
            className="text-white/80 hover:text-white transition-colors"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="#"
            className="text-white/80 hover:text-white transition-colors"
          >
            <FaInstagram size={24} />
          </a>
          <a
            href="#"
            className="text-white/80 hover:text-white transition-colors"
          >
            <SiDiscord size={24} />
          </a>
          <a
            href="#"
            className="text-white/80 hover:text-white transition-colors"
          >
            <FaFacebook size={24} />
          </a>
          <a
            href="#"
            className="text-white/80 hover:text-white transition-colors"
          >
            <FaLinkedin size={24} />
          </a>
        </div>
      </div>
    </div>
  );
}
