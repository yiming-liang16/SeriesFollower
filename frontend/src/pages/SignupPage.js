import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api } from "../api";

import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Label } from "../components/ui/label.jsx";
import { Alert, AlertDescription } from "../components/ui/alert.jsx";
import { Separator } from "../components/ui/separator.jsx";

import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const { signInWithToken } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      username.trim().length >= 3 &&
      email.trim().length > 0 &&
      password.length >= 6 &&
      !loading
    );
  }, [username, email, password, loading]);

  function basicValidate() {
    if (!username.trim()) return "Username is required.";
    if (username.trim().length < 3) return "Username must be at least 3 characters.";
    if (!email.trim()) return "Email is required.";
    // 简单 email 格式检查（够用）
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Please enter a valid email.";
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  }

  async function onSubmit(e) {
  e.preventDefault();
  setErr("");

  const v = basicValidate();
  if (v) {
    setErr(v);
    return;
  }

  setLoading(true);
  try {
    const res = await api.post("/users/signup", {
      username: username.trim(),
      email: email.trim(),
      password,
    });

    const token = res.data?.token;
    if (!token) {
      setErr("Missing server token");
      return;
    }

    localStorage.setItem("token", token);

    // ✅ 同步到 AuthContext（会去 GET /users/me）
    if (typeof signInWithToken === "function") {
      await signInWithToken(token);
    }

    nav("/");
  } catch (e2) {
    setErr(e2?.response?.data?.error || e2?.response?.data?.message || "Signup failed");
  } finally {
    setLoading(false);
  }
}
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription className="text-sm">
              Sign up with your username, email and password.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {err && (
              <Alert variant="destructive">
                <AlertDescription className="leading-relaxed">{err}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="e.g. tom123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tom@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Use at least 6 characters.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign up"
                )}
              </Button>
            </form>

            <div className="relative">
              <Separator />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="underline underline-offset-4">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}