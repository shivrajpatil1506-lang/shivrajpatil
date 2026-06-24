"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { linkAuthUserToEmployee } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      let userCredential;

      if (isSignUp) {
        // Sign Up Flow
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Link to Employee DB
        const linkRes = await linkAuthUserToEmployee(userCredential.user.uid, email);
        if (!linkRes.success) {
          // If not in DB, delete the auth user and abort
          await userCredential.user.delete();
          setErrorMsg(linkRes.error || "Failed to link account.");
          setIsLoading(false);
          return;
        }
      } else {
        // Sign In Flow
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      // 2. Get ID Token
      const idToken = await userCredential.user.getIdToken();

      // 3. Send to our API route to set the Session Cookie
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        const data = await response.json();
        setErrorMsg(data.error || "Failed to create session.");
        if (isSignUp) await userCredential.user.delete(); // cleanup on session fail
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      
      {/* Top Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center border border-primary-200 mb-4">
          <Building2 className="w-6 h-6 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>
          GB Infra
        </h1>
        <p className="text-neutral-500 text-sm mt-1">Operations Platform</p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-card border border-border rounded-sm p-8 shadow-sm">
        
        <h2 className="text-xl font-semibold text-neutral-900 mb-6 text-center">
          {isSignUp ? "Register an account" : "Login to your account"}
        </h2>

        {errorMsg && (
          <div className="mb-6 p-3 bg-danger-50 text-danger-600 border border-danger-100 rounded-sm text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5 uppercase tracking-wide">
              Email address
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-border rounded-sm focus:outline-none focus:border-primary-500 transition-colors text-sm text-neutral-900 placeholder:text-neutral-400"
              placeholder="you@gbinfra.in"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-border rounded-sm focus:outline-none focus:border-primary-500 transition-colors text-sm text-neutral-900 placeholder:text-neutral-400"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-4 text-sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>{isSignUp ? "Register" : "Login"} <ArrowRight className="w-3.5 h-3.5" /></>
            )}
          </button>
        </form>
      </div>

      {/* Footer Links */}
      <div className="mt-6 text-center">
        <button 
          type="button" 
          onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); }} 
          className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          {isSignUp ? "Already have an account? Login here" : "New employee? Register here"}
        </button>
      </div>
      
    </div>
  );
}
