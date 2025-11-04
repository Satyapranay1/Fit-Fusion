import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Dumbbell, Mail, Lock, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const backend = "https://health4-lmzi.onrender.com";

export default function Auth() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) =>
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (isSignup && !name.trim()) newErrors.name = "Name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!validateEmail(email)) newErrors.email = "Invalid email format.";
    if (!password.trim()) newErrors.password = "Password is required.";
    else if (!validatePassword(password))
      newErrors.password =
        "Password must have at least 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special symbol.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const endpoint = isSignup
        ? `${backend}/api/auth/register`
        : `${backend}/api/auth/login`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const text = await response.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        // handle backend specific messages
        let message = "Something went wrong";
        if (data.error?.toLowerCase().includes("email")) {
          message = "Email is already registered.";
        } else if (data.message?.toLowerCase().includes("invalid")) {
          message = "Invalid email or password.";
        } else if (response.status === 409) {
          message = "Email is already registered.";
        } else if (response.status === 401) {
          message = "Invalid email or password.";
        } else {
          message = data.error || data.message || message;
        }

        throw new Error(message);
      }

      if (isSignup) {
        toast.success("🎉 Account created successfully! Redirecting to login...");
        setTimeout(() => {
          setIsSignup(false);
          setEmail("");
          setPassword("");
          setName("");
          navigate("/auth");
        }, 1500);
      } else {
        if (data.token) {
          localStorage.setItem("token", data.token);
          toast.success("✅ Welcome back to FitFusion!");
          navigate("/dashboard");
        } else {
          throw new Error("Login failed. Please try again.");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-block gradient-primary p-4 rounded-2xl shadow-glow mb-4"
          >
            <Dumbbell className="h-12 w-12 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">
            {isSignup ? (
              <>
                Join{" "}
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  FitFusion
                </span>
              </>
            ) : (
              <>
                Welcome to{" "}
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  FitFusion
                </span>
              </>
            )}
          </h1>
          <p className="text-muted-foreground">
            {isSignup
              ? "Create your account to start your journey"
              : "Transform your fitness journey today"}
          </p>
        </div>

        <Card className="glass shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isSignup ? "Create Account" : "Get Started"}
            </CardTitle>
            <CardDescription>
              {isSignup
                ? "Sign up to begin your FitFusion experience"
                : "Sign in or create your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      <AlertCircle size={12} /> {errors.name}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary text-white shadow-glow"
                disabled={loading}
              >
                {loading
                  ? isSignup
                    ? "Creating Account..."
                    : "Signing In..."
                  : isSignup
                  ? "Sign Up"
                  : "Continue"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => setIsSignup(false)}
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => setIsSignup(true)}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
