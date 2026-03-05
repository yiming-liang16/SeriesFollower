import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";

export default function ListsPage() {
  const { user } = useAuth();

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");

  async function loadLists() {
    if (!user) {
      setLists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/lists");
      const items = res.data?.items || res.data?.lists || [];
      setLists(items);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load lists");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLists();
    // eslint-disable-next-line
  }, [user]);

  async function createList(e) {
    e.preventDefault();
    setActionLoading(true);
    setActionMsg("");
    setActionErr("");

    try {
      if (!title.trim()) {
        setActionErr("Title is required");
        return;
      }

      await api.post("/lists", { title: title.trim(), description: description.trim() });
      setActionMsg("List created ✅");
      setTitle("");
      setDescription("");
      await loadLists();
    } catch (e2) {
      setActionErr(e2?.response?.data?.error || "Create failed");
    } finally {
      setActionLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="font-semibold">Please login</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Please login to manage your lists.
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="space-y-4">
          <span className="inline-block h-8 w-40 rounded-md bg-muted animate-pulse" />
          <span className="inline-block h-4 w-72 rounded-md bg-muted animate-pulse" />
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="rounded-2xl">
                <CardHeader className="space-y-2">
                  <span className="inline-block h-5 w-48 rounded-md bg-muted animate-pulse" />
                  <span className="inline-block h-4 w-64 rounded-md bg-muted animate-pulse" />
                </CardHeader>
                <CardContent>
                  <span className="inline-block h-4 w-32 rounded-md bg-muted animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <div className="font-semibold text-destructive">Failed to load</div>
          <div className="mt-1 text-sm text-destructive/80">{err}</div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={loadLists}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">My Lists</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage your personal collections.
          </p>
        </div>

        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
          {lists.length} lists
        </span>
      </div>

      <Separator className="my-6" />

      {/* Create form */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Create a new list</CardTitle>
          <CardDescription>Give it a clear title. Description is optional.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createList} className="grid gap-4 max-w-2xl">
            <div className="grid gap-2">
              <label className="text-sm font-medium">New list title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Top 10 Sci-Fi"
              />
            </div>

       <div className="grid gap-2">
  <label className="text-sm font-medium">Description (optional)</label>
  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    rows={3}
    placeholder="Short description..."
    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-vertical"
  />
</div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? "Working..." : "Create"}
              </Button>

              {actionMsg ? (
                <span className="text-sm text-emerald-600">{actionMsg}</span>
              ) : null}

              {actionErr ? (
                <span className="text-sm text-destructive">{actionErr}</span>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="my-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your lists</h3>
      </div>

      {/* Lists grid */}
      {lists.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-10">
            <div className="text-center">
              <div className="text-base font-medium">No lists yet.</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Create your first list above.
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lists.map((l) => (
            <Link key={l._id} to={`/lists/${l._id}`} className="block">
              <Card className="rounded-2xl transition hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-1 text-base">{l.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {l.description || "—"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <span className="text-xs text-muted-foreground">Open →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}