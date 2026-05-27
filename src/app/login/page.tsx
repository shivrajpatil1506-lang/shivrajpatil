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
        router.push("/");
        router.refresh();
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
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Brand / Visual */}
        <div className="w-full md:w-5/12 bg-emerald-900 p-10 flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-white mb-16">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>GB Infra</h1>
            </div>
            
            <h2 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Build the future,<br />Manage with ease.
            </h2>
            <p className="text-emerald-100 text-lg">
              Enterprise resource planning for Pune's premier real estate developers.
            </p>
          </div>
          
          <div className="relative z-10 text-emerald-200/80 text-sm">
            &copy; {new Date().getFullYear()} GB Infra Pvt. Ltd.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center">
          <div className="md:hidden flex items-center gap-3 text-emerald-900 mb-8">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-emerald-700" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>GB Infra</h1>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-neutral-900 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              {isSignUp ? "Create Account" : "Welcome back"}
            </h2>
            <p className="text-neutral-500">
              {isSignUp ? "Enter your work email to register." : "Please enter your details to sign in."}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                placeholder="you@gbinfra.in"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-70 mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>{isSignUp ? "Create Account" : "Sign In"} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
            
            <div className="text-center mt-6">
              <button 
                type="button" 
                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); }} 
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {isSignUp ? "Already have an account? Sign in" : "New employee? Create account"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
