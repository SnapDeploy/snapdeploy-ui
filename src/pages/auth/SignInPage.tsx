import React from "react";
import { SignInButton } from "@clerk/clerk-react";

export const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl max-w-md w-full relative z-10">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">
              Welcome to SnapDeploy
            </h1>
            <p className="text-white/70 text-lg">
              Your deployment management platform
            </p>
          </div>

          <SignInButton mode="modal">
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
              Sign In to Continue
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
};
