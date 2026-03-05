import { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function HomePage() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const res = await api.get("/watchlist", { params: { status: "watching" } });
        setItems(res.data.items || []);
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authLoading, user]);

  if (authLoading || loading) {
    return <div className="mx-auto max-w-5xl p-6">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl p-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Currently Watching</CardTitle>
              <CardDescription>Please login to see what you're watching.</CardDescription>
            </CardHeader>
          </Card>
        </div>
    );
  }

  if (err) {
    return <div className="mx-auto max-w-5xl p-6 text-destructive">{err}</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Currently Watching</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick up where you left off.
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-10">
            <div className="text-center">
              <div className="text-base font-medium">Nothing here yet.</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Go to Search and start watching something.
              </div>
              <div className="mt-4">
                <Button onClick={() => nav("/search")}>Go to Search</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const t = it.titleId;
            const meta = [t?.kind, t?.year, t?.country].filter(Boolean).join(" • ");
            const progress = it.progress;

            return (
              <Card
                key={it._id}
                className="rounded-2xl cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => nav(`/titles/${t?._id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1 text-base">{t?.name || "(Untitled)"}</CardTitle>
                  <CardDescription className="line-clamp-1">{meta || "—"}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {t?.kind === "series" && progress?.season && progress?.episode ? (
                    <span className="text-sm text-muted-foreground">
                      S{progress.season} E{progress.episode}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Watching</span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      </div>
  );
}
