"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { registerSchema } from "@/validators/auth";
import { ShieldCheck, UserPlus, Mail, Lock, User } from "lucide-react";

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterInput) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const body = await res.json();
      toast.error(body.message || "Registration failed");
      return;
    }
    toast.success("Account created");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sky-200/40 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-200/30 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/4"></div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-center flex-1 p-16 relative z-10">
        <Link href="/" className="absolute top-12 left-16 flex items-center gap-2 text-2xl font-bold text-slate-900">
          <ShieldCheck className="w-8 h-8 text-sky-600" />
          MedExplain <span className="text-sky-600">AI</span>
        </Link>
        <div className="max-w-xl">
          <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            Your Health Records, <br/> <span className="gradient-text">Decoded.</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            Join thousands of users who trust MedExplain AI to translate complex prescriptions and lab reports into safe, easy-to-understand language.
          </p>
          <div className="glass rounded-2xl p-6 border border-white/60">
            <p className="text-sm font-semibold text-slate-500 mb-2">SECURITY & PRIVACY</p>
            <p className="text-slate-700 font-medium">Your data is securely encrypted. We never share your medical information with third parties.</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <Link href="/" className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-xl font-bold text-slate-900">
          <ShieldCheck className="w-6 h-6 text-sky-600" />
          MedExplain AI
        </Link>
        
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-md space-y-6 glass rounded-[2rem] p-8 sm:p-10 border border-white/60"
        >
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
            <p className="text-slate-600">Start your journey to better health understanding.</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  placeholder="Full Name"
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  {...form.register("name")}
                />
              </div>
              {form.formState.errors.name && (
                <p className="mt-1 text-sm text-rose-500 font-medium">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  placeholder="Email Address"
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-rose-500 font-medium">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-rose-500 font-medium">{form.formState.errors.password.message}</p>
              )}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 py-4 font-bold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-[0.98]"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating account..." : (
              <>
                <UserPlus className="w-5 h-5" />
                Register
              </>
            )}
          </button>
          
          <p className="text-center text-slate-600 font-medium pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-sky-600 hover:text-sky-700 hover:underline transition-all">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
