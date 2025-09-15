
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Shield, Plane, MapPin, Globe } from "lucide-react";

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
  };
  message?: string;
}

const backgroundImages = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80', // Seychelles beach
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80', // Mountain landscape
  'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80', // City skyline
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80', // Tropical beach
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80', // Forest path
];

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cycle through background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (
      credentials: LoginCredentials,
    ): Promise<AuthResponse> => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        // Store user session
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isAuthenticated", "true");

        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.username}!`,
        });

        // Redirect to dashboard
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!credentials.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!credentials.password) {
      newErrors.password = "Password is required";
    } else if (credentials.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    loginMutation.mutate(credentials);
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Images with Transition */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
              index === currentBgIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 animate-bounce delay-1000">
          <Plane className="h-8 w-8 text-white/30 transform rotate-45" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse delay-2000">
          <Globe className="h-10 w-10 text-white/20" />
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce delay-3000">
          <MapPin className="h-6 w-6 text-white/25" />
        </div>
        <div className="absolute top-60 left-1/3 animate-pulse delay-500">
          <Plane className="h-5 w-5 text-white/20 transform -rotate-12" />
        </div>
        <div className="absolute bottom-60 right-1/4 animate-bounce delay-4000">
          <Globe className="h-7 w-7 text-white/15" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className={`w-full max-w-md transform transition-all duration-1000 ease-out ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`flex items-center justify-center mb-6 transform transition-all duration-1200 delay-300 ease-out ${
              isLoaded ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            }`}>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full shadow-2xl backdrop-blur-sm border border-white/20 hover:scale-110 transition-transform duration-300">
                <Shield className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
            </div>
            <div className={`transform transition-all duration-1000 delay-500 ease-out ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-2xl">
                OfferSense
              </h1>
              <p className="text-xl text-white/90 font-medium drop-shadow-lg">
                Travel Offer Management Platform
              </p>
              <p className="text-sm text-white/70 mt-1 drop-shadow">
                Discover • Manage • Optimize
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className={`transform transition-all duration-1000 delay-700 ease-out ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}>
            <Card className="shadow-2xl backdrop-blur-lg bg-white/95 border-0 hover:shadow-3xl transition-all duration-300">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl text-center font-bold text-gray-800">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Sign in to access your travel management dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 font-medium">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={credentials.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      className={`h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500/50 ${
                        errors.username 
                          ? "border-red-500 focus:border-red-500" 
                          : "border-gray-300 focus:border-orange-500"
                      }`}
                      disabled={loginMutation.isPending}
                    />
                    {errors.username && (
                      <p className="text-sm text-red-500 animate-pulse">{errors.username}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className={`h-12 pr-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500/50 ${
                          errors.password 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-300 focus:border-orange-500"
                        }`}
                        disabled={loginMutation.isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        disabled={loginMutation.isPending}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500 animate-pulse">{errors.password}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className={`text-center mt-8 transform transition-all duration-1000 delay-1000 ease-out ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <p className="text-sm text-white/80 drop-shadow">
              © 2025 OfferSense. Empowering travel experiences worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
