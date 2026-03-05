import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Separator } from "../components/ui/separator";

function labelStatus(status) {
  if (status === "want_to_watch") return "Want to watch";
  if (status === "watching") return "Watching";
  if (status === "watched") return "Watched";
  return status || "—";
}

export default function WatchlistPage() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ filter
  const [filter, setFilter] = useState("all");

  // season/episode draft state，keyed by item._id
  const [progressDraft, setProgressDraft] = useState({});

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/watchlist");
      setItems(res.data.items || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) {
      if (user) load();
      else {
        setItems([]);
        setLoading(false);
      }
    }
    // eslint-disable-next-line
  }, [authLoading, user]);

  // 每次 items 更新时，将已保存的 progress 同步到 draft
  useEffect(() => {
    const next = {};
    for (const it of items) {
      next[it._id] = {
        season: it.progress?.season ?? 1,
        episode: it.progress?.episode ?? 1,
      };
    }
    setProgressDraft(next);
  }, [items]);

  // ✅ 过滤后的 items
  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((it) => it.status === filter);
  }, [items, filter]);

  // ✅ 计数（可选但很实用）
  const counts = useMemo(() => {
    const c = { all: items.length, want_to_watch: 0, watching: 0, watched: 0 };
    for (const it of items) {
      if (it.status === "want_to_watch") c.want_to_watch += 1;
      if (it.status === "watching") c.watching += 1;
      if (it.status === "watched") c.watched += 1;
    }
    return c;
  }, [items]);

async function removeItem(identifier) {
  if (!identifier) return;
  try {
    await api.delete(`/watchlist/${identifier}`);
    await load();
  } catch (e) {
    window.alert(e?.response?.data?.error || "Remove failed");
  }
}


async function updateStatus(identifier, status) {
  if (!identifier) return;
  try {
    await api.patch(`/watchlist/${identifier}`, { status });
    await load();
  } catch (e) {
    window.alert(e?.response?.data?.error || "Update status failed");
  }
}

async function saveProgress(identifier, itemId) {
  const draft = progressDraft[itemId];
  if (!draft) return;
  try {
    await api.patch(`/watchlist/${identifier}`, {
      status: "watching",
      season: draft.season,
      episode: draft.episode,
    });
    await load();
  } catch (e) {
    window.alert(e?.response?.data?.error || "Save progress failed");
  }
}

  if (authLoading) return <div className="mx-auto max-w-5xl p-6">Loading...</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>My Watchlist</CardTitle>
            <CardDescription>Please login to view your watchlist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) return <div className="mx-auto max-w-5xl p-6">Loading watchlist...</div>;
  if (err) return <div className="mx-auto max-w-5xl p-6 text-destructive">{err}</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">My Watchlist</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track what you want to watch, are watching, and finished.
          </p>
        </div>

        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
          Total {counts.all}
        </span>
      </div>

      <Separator className="my-6" />

      {/* Filter bar */}
      <Card className="rounded-2xl">
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Filter</span>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-10 w-[220px] rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All</option>
                <option value="want_to_watch">Want to watch</option>
                <option value="watching">Watching</option>
                <option value="watched">Watched</option>
              </select>

              <span className="text-sm text-muted-foreground">Showing {filteredItems.length}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                Want {counts.want_to_watch}
              </span>
              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                Watching {counts.watching}
              </span>
              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                Watched {counts.watched}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="my-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Titles</h3>
      </div>

      {/* List */}
      {filteredItems.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-10">
            <div className="text-center">
              <div className="text-base font-medium">No items found.</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Try switching the filter, or go to Search and add some 🎬
              </div>
              <div className="mt-4">
                <Button onClick={() => nav("/search")}>Go to Search</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((it) => {
            const t = it.titleId; // populated Title
            const titleId = t?._id;

            // ✅ 关键：这里决定“更新/删除用哪个 id”
            // 方案 A：用 titleId（你后端是 findOne({userId, titleId}) 的话用这个）
            const identifierA = titleId;

            // 方案 B：用 watchlist item 自己的 _id（如果你后端 route 是 /watchlist/:id 找 itemId）
            const identifierB = it._id;

            // ⭐️ 你先用 A；如果还弹 “not found”，立刻改用 B（下面我解释原因）
            const identifier = identifierA;

            const meta = [t?.kind, t?.year, t?.country].filter(Boolean).join(" • ");

            return (
              <Card key={it._id} className="rounded-2xl">
                <CardHeader className="pb-3">
                  <div
                    className="cursor-pointer"
                    onClick={() => nav(`/titles/${titleId}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") nav(`/titles/${titleId}`);
                    }}
                  >
                    <CardTitle className="line-clamp-1 text-base">{t?.name || "(Untitled)"}</CardTitle>
                    <CardDescription className="line-clamp-1">{meta || "—"}</CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs">
                    {labelStatus(it.status)}
                  </span>

                  {/* 季/集进度：仅 watching + series 时显示 */}
                  {it.status === "watching" && t?.kind === "series" && (
                    <div className="rounded-md border border-border p-3 space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Progress</div>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground w-12">Season</span>
                          <Button
                            variant="outline" size="icon" className="h-7 w-7"
                            onClick={() => setProgressDraft(p => ({
                              ...p,
                              [it._id]: { ...p[it._id], season: Math.max(1, (p[it._id]?.season ?? 1) - 1) },
                            }))}
                          >−</Button>
                          <span className="w-6 text-center text-sm font-medium">
                            {progressDraft[it._id]?.season ?? 1}
                          </span>
                          <Button
                            variant="outline" size="icon" className="h-7 w-7"
                            onClick={() => setProgressDraft(p => ({
                              ...p,
                              [it._id]: { ...p[it._id], season: (p[it._id]?.season ?? 1) + 1 },
                            }))}
                          >+</Button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground w-12">Episode</span>
                          <Button
                            variant="outline" size="icon" className="h-7 w-7"
                            onClick={() => setProgressDraft(p => ({
                              ...p,
                              [it._id]: { ...p[it._id], episode: Math.max(1, (p[it._id]?.episode ?? 1) - 1) },
                            }))}
                          >−</Button>
                          <span className="w-6 text-center text-sm font-medium">
                            {progressDraft[it._id]?.episode ?? 1}
                          </span>
                          <Button
                            variant="outline" size="icon" className="h-7 w-7"
                            onClick={() => setProgressDraft(p => ({
                              ...p,
                              [it._id]: { ...p[it._id], episode: (p[it._id]?.episode ?? 1) + 1 },
                            }))}
                          >+</Button>
                        </div>
                      </div>

                      <Button size="sm" onClick={() => saveProgress(identifier, it._id)}>
                        Save Progress
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={it.status === "want_to_watch" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateStatus(identifier, "want_to_watch")}
                    >
                      Want
                    </Button>

                    <Button
                      variant={it.status === "watching" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateStatus(identifier, "watching")}
                    >
                      Watching
                    </Button>

                    <Button
                      variant={it.status === "watched" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateStatus(identifier, "watched")}
                    >
                      Watched
                    </Button>

                    <Button variant="destructive" size="sm" onClick={() => removeItem(identifier)}>
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}