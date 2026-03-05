import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Separator } from "../components/ui/separator";

export default function ListDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [removingId, setRemovingId] = useState(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get(`/lists/${id}`);

      // 兼容不同字段命名
      setList(res.data.list || res.data.data || res.data?.item || res.data?.list);
      setItems(res.data.items || res.data.titles || res.data.listItems || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load list");
    } finally {
      setLoading(false);
    }
  }

  async function removeTitle(e, titleId) {
    e.stopPropagation();
    setRemovingId(titleId);
    try {
      await api.delete(`/lists/${id}/items/${titleId}`);
      setItems((prev) => prev.filter((it) => {
        const tid = it.titleId?._id || it.title?._id;
        return String(tid) !== String(titleId);
      }));
    } catch (e2) {
      console.error(e2);
    } finally {
      setRemovingId(null);
    }
  }

  useEffect(() => {
    if (!authLoading && user) load();
    // eslint-disable-next-line
  }, [authLoading, user, id]);

  // ---------- UI states ----------
  if (authLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="space-y-4">
          <span className="inline-block h-9 w-40 rounded-md bg-muted animate-pulse" />
          <span className="inline-block h-8 w-72 rounded-md bg-muted animate-pulse" />
          <span className="inline-block h-4 w-96 rounded-md bg-muted animate-pulse" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-2xl">
                <CardHeader className="space-y-2">
                  <span className="inline-block h-5 w-40 rounded-md bg-muted animate-pulse" />
                  <span className="inline-block h-4 w-28 rounded-md bg-muted animate-pulse" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <span className="inline-block h-4 w-56 rounded-md bg-muted animate-pulse" />
                  <span className="inline-block h-4 w-44 rounded-md bg-muted animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="font-semibold">Please login</div>
          <div className="mt-1 text-sm text-muted-foreground">
            You need to sign in to view this list.
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={() => nav("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-block h-9 w-28 rounded-md bg-muted animate-pulse" />
          <span className="inline-block h-9 w-24 rounded-md bg-muted animate-pulse" />
        </div>

        <div className="mt-6 space-y-3">
          <span className="inline-block h-8 w-72 rounded-md bg-muted animate-pulse" />
          <span className="inline-block h-4 w-[520px] rounded-md bg-muted animate-pulse" />
        </div>

        <Separator className="my-6" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="rounded-2xl">
              <CardHeader className="space-y-2">
                <span className="inline-block h-5 w-44 rounded-md bg-muted animate-pulse" />
                <span className="inline-block h-4 w-32 rounded-md bg-muted animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-2">
                <span className="inline-block h-4 w-56 rounded-md bg-muted animate-pulse" />
                <span className="inline-block h-4 w-40 rounded-md bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
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
          <Button variant="outline" onClick={() => nav("/lists")}>
            Back
          </Button>
          <Button onClick={load}>Retry</Button>
        </div>
      </div>
    );
  }

  // ---------- main ----------
  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="px-2" onClick={() => nav("/lists")}>
            ← Back
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            {items.length} titles
          </span>
        </div>
      </div>

      {/* Header card */}
      <Card className="mt-4 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">{list?.title || "List"}</CardTitle>
          {list?.description ? (
            <CardDescription className="max-w-3xl">{list.description}</CardDescription>
          ) : (
            <CardDescription className="opacity-70">No description.</CardDescription>
          )}
        </CardHeader>
      </Card>

      <div className="my-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Titles</h3>
      </div>

      {items.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-10">
            <div className="text-center mt-5">
              <div className="text-base font-medium">No titles in this list yet.</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Add some titles from a movie/series page.
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const t = it.title || it.titleId || it;
            const titleId = t?._id || it.titleId;

            const kind = t?.kind || "";
            const year = t?.year || "";
            const country = t?.country || "";
            const meta = [kind, year, country].filter(Boolean).join(" • ");

            return (
              <Card
                key={it._id || titleId}
                className="group cursor-pointer rounded-2xl transition hover:shadow-md"
                onClick={() => nav(`/titles/${titleId}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") nav(`/titles/${titleId}`);
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-1 text-base">{t?.name || "(title)"}</CardTitle>
                  {meta ? (
                    <CardDescription className="line-clamp-1">{meta}</CardDescription>
                  ) : (
                    <CardDescription className="opacity-60">—</CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  {Array.isArray(t?.genres) && t.genres.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {t.genres.slice(0, 4).map((g) => (
                        <span
                          key={g}
                          className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                        >
                          {g}
                        </span>
                      ))}
                      {t.genres.length > 4 ? (
                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                          +{t.genres.length - 4}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No genres</div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground opacity-0 transition group-hover:opacity-100">
                      Click to open details →
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => removeTitle(e, titleId)}
                      disabled={removingId === titleId}
                    >
                      {removingId === titleId ? "Removing…" : "Remove"}
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