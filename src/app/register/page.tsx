"use client";

import { useState } from "react";
import Link from "next/link";
import { register } from "@/actions/auth";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await register(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" name="name" label="Name" required />
          <Input id="email" name="email" type="email" label="Email" required />
          <PasswordInput
            id="password"
            name="password"
            label="Password"
            minLength={6}
            required
          />
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
