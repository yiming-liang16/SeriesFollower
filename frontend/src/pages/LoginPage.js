import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "../api";

import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Label } from "../components/ui/label.jsx";
import { Alert, AlertDescription } from "../components/ui/alert.jsx";
import { Separator } from "../components/ui/separator.jsx";

import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { signIn, signInWithToken } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return username.trim().length > 0 && password.length > 0 && !loading;
  }, [username, password, loading]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!username.trim() || !password) {
      setErr("Please enter username and password.");
      return;
    }

    setLoading(true);
    try {
      await signIn(username.trim(), password);
      nav("/");
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleSuccess(credentialResponse) {
    setErr("");
    setLoading(true);
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        setErr("Missing Google idToken");
        return;
      }

      const res = await api.post("/users/google", { idToken });
      const token = res.data?.token;
      if (!token) {
        setErr("Missing server token");
        return;
      }

      localStorage.setItem("token", token);

      if (typeof signInWithToken === "function") {
        await signInWithToken(token);
      }

      nav("/");
    } catch (e3) {
      setErr(e3?.response?.data?.error || "Google login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription className="text-sm">
              Sign in to your account to continue.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {err && (
              <Alert variant="destructive">
                <AlertDescription className="leading-relaxed">
                  {err}
                </AlertDescription>
              </Alert>
            )}

            {/* Google 登录优先放上面：更符合用户习惯 */}
            <div className={loading ? "opacity-60 pointer-events-none" : ""}>
              <div className="flex justify-center">
                {/* 控制 Google button 宽度：它本身宽度不可完全用 className 控制 */}
                <div className="w-full">
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={onGoogleSuccess}
                      onError={() => setErr("Google Login Failed")}
                      useOneTap={false}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                You can also sign in with username & password.
              </p>
            </div>

            <div className="relative">
              <Separator />
              <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-3 text-[11px] text-muted-foreground">
                OR
              </div>
            </div>

            {/* 普通登录 */}
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {/* 先放一个占位，之后你做 reset password 可以把它变成 Link */}
                  <span className="text-xs text-muted-foreground">
                    {/* Forgot password? */}
                  </span>
                </div>

                <Input
                  id="password"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to the app’s terms.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}