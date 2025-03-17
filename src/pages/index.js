import React, { useState, useEffect } from "react";
import { FaTwitter, FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";
import { SiDiscord } from "react-icons/si";
import { Toaster, toast } from "react-hot-toast";

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
          toast.error("Failed to register. Please try again.", { autoClose: 3000 });
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-500 via-purple-400 to-indigo-400">
      {/* Toast notification container */}
      <Toaster position="top-center" />

      {/* Dynamic bubbles - now using animationPosition instead of mousePosition */}
      <div
        className="absolute top-20 left-20 w-64 h-64 bg-purple-600 rounded-full opacity-20 blur-3xl"
        style={{
          transform: `translate(${animationPosition.x}px, ${animationPosition.y}px)`,
        }}
      ></div>
      <div
        className="absolute bottom-20 right-40 w-80 h-80 bg-indigo-600 rounded-full opacity-20 blur-3xl"
        style={{
          transform: `translate(${-animationPosition.x * 1.5}px, ${
            -animationPosition.y * 1.5
          }px)`,
        }}
      ></div>
      <div
        className="absolute top-1/2 left-1/4 w-40 h-40 bg-pink-500 rounded-full opacity-20 blur-3xl"
        style={{
          transform: `translate(${animationPosition.y * 2}px, ${
            -animationPosition.x * 2
          }px)`,
        }}
      ></div>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
        {/* Main glassmorphic card - improved contrast */}
        <div className="w-full hover:shadow-2xl transition-all  max-w-xl p-8 rounded-2xl backdrop-blur-lg bg-white/30 shadow-xl border border-white/30">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-md">
              Opus Health
            </h1>
            <h2 className="text-3xl font-semibold text-white mb-8 drop-shadow-md">
              Transforming Healthcare Payments
            </h2>

            <p className="text-lg text-white mb-8 drop-shadow-sm font-medium">
              Join our waitlist for early access to our Membership and HSA
              Automation platform.
            </p>

            <p className="text-md text-white mb-12 drop-shadow-sm font-medium">
              At Opus, we're increasing revenue for providers while delivering
              transparent, cost-saving care for patients.
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
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white/40 backdrop-blur-md text-black placeholder-gray-700 border ${
                    !isValid ? "border-red-500" : "border-white/30"
                  }`}
                  disabled={isSubmitting}
                />
                {!isValid && (
                  <p className="text-red-200 text-sm mt-1 text-left font-medium drop-shadow-md">
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
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium border-2 border-white">
                  AS
                </div>
                <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white text-sm font-medium border-2 border-white">
                  MK
                </div>
              </div>
              <span className="text-white font-medium drop-shadow-md">
                100+ people on the waitlist
              </span>
            </div>
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
