import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";

function labelStatus(status) {
  if (status === "want_to_watch") return "Want to watch";
  if (status === "watching") return "Watching";
  if (status === "watched") return "Watched";
  return status || "—";
}

export default function TitlePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState(null);

  const [myStatus, setMyStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");

  // ✅ Lists
  const [myLists, setMyLists] = useState([]);
  const [titleInLists, setTitleInLists] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [listsErr, setListsErr] = useState("");
  const [selectedListId, setSelectedListId] = useState("");

  const [listActionLoading, setListActionLoading] = useState(false);
  const [listActionMsg, setListActionMsg] = useState("");
  const [listActionErr, setListActionErr] = useState("");

  async function loadTitle() {
    const res = await api.get(`/titles/${id}`);
    setTitle(res.data.title);
  }

  async function loadMyStatus() {
    if (!user) {
      setMyStatus(null);
      return;
    }
    const meRes = await api.get(`/titles/${id}/me`);
    setMyStatus(meRes.data);
  }

  async function loadMyLists() {
    if (!user) {
      setMyLists([]);
      setTitleInLists([]);
      setSelectedListId("");
      return;
    }
    setListsLoading(true);
    setListsErr("");
    try {
      const [listsRes, inListsRes] = await Promise.all([
        api.get("/lists"),
        api.get(`/lists?titleId=${id}`),
      ]);
      const items = listsRes.data?.lists || [];
      setMyLists(items);
      if (!selectedListId && items.length > 0) {
        setSelectedListId(items[0]._id);
      }
      setTitleInLists(inListsRes.data?.lists || []);
    } catch (e) {
      setListsErr(e?.response?.data?.error || "Failed to load lists");
      setMyLists([]);
      setTitleInLists([]);
      setSelectedListId("");
    } finally {
      setListsLoading(false);
    }
  }

  async function loadAll() {
    setLoading(true);
    setErr("");
    try {
      await loadTitle();
      await loadMyStatus();
      await loadMyLists();
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load title");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, [id, user]);

  async function addToWatchlist(status = "want_to_watch") {
    setActionLoading(true);
    setActionMsg("");
    setActionErr("");
    try {
      await api.post("/watchlist", { titleId: id, status });
      setActionMsg("Added ✅");
      await loadMyStatus();
    } catch (e) {
      setActionErr(e?.response?.data?.error || "Add failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function setStatus(status) {
    setActionLoading(true);
    setActionMsg("");
    setActionErr("");
    try {
      await api.patch(`/watchlist/${id}`, { status });
      setActionMsg("Status updated ✅");
      await loadMyStatus();
    } catch (e) {
      const statusCode = e?.response?.status;
      if (statusCode === 404) {
        setActionErr("Update endpoint not found (PATCH /api/watchlist/:titleId).");
      } else {
        setActionErr(e?.response?.data?.error || "Update failed");
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function removeFromWatchlist() {
    setActionLoading(true);
    setActionMsg("");
    setActionErr("");
    try {
      await api.delete(`/watchlist/${id}`);
      setActionMsg("Removed ✅");
      await loadMyStatus();
    } catch (e) {
      setActionErr(e?.response?.data?.error || "Remove failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function addToSelectedList() {
    setListActionLoading(true);
    setListActionMsg("");
    setListActionErr("");

    try {
      if (!user) {
        setListActionErr("Please login first.");
        return;
      }
      if (!selectedListId) {
        setListActionErr("Please select a list.");
        return;
      }

      await api.post(`/lists/${selectedListId}/items`, { titleId: id });
      setListActionMsg("Added to list ✅");
      const inListsRes = await api.get(`/lists?titleId=${id}`);
      setTitleInLists(inListsRes.data?.lists || []);
    } catch (e) {
      if (e?.response?.status === 409) {
        setListActionErr("This title is already in that list.");
      } else {
        setListActionErr(e?.response?.data?.error || "Add to list failed");
      }
    } finally {
      setListActionLoading(false);
    }
  }

  const inWatchlist = !!myStatus?.inWatchlist;
  const statusText = labelStatus(myStatus?.status);

  const metaLine = useMemo(() => {
    if (!title) return "";
    const bits = [title.kind, title.year, title.country].filter(Boolean);
    const g = Array.isArray(title.genres) && title.genres.length ? title.genres.join(", ") : "";
    return g ? `${bits.join(" • ")} • ${g}` : bits.join(" • ");
  }, [title]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Card className="border shadow-sm">
            <CardContent className="p-6 text-sm text-muted-foreground">Loading...</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <Alert variant="destructive">
                <AlertDescription className="leading-relaxed">{err}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!title) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Card className="border shadow-sm">
            <CardContent className="p-6 text-sm text-muted-foreground">Not found</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <Card className="border shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="space-y-1">
                <CardTitle className="text-2xl">{title.name}</CardTitle>
                <CardDescription className="text-sm">{metaLine || "—"}</CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">
                  {title.kind} {title.year ? `• ${title.year}` : ""}
                </div>
                {user && (
                  <Button variant="outline" size="sm" onClick={() => nav(`/titles/${id}/edit`)}>
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Poster + Overview */}
            <div className="grid gap-5 md:grid-cols-[240px_1fr] md:items-start">
              <div className="w-full">
                {title.posterUrl ? (
                  <img
                    src={title.posterUrl.startsWith('/') ? `http://localhost:3011${title.posterUrl}` : title.posterUrl}
                    alt={title.name}
                    className="w-full max-w-[240px] rounded-xl border"
                  />
                ) : (
                  <div className="w-full max-w-[240px] aspect-[2/3] rounded-xl border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
                    No poster
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">Overview</div>
                <div className="text-sm leading-relaxed text-foreground/90">
                  {title.overview || "No overview yet."}
                </div>
              </div>
            </div>

            <div className="relative">
              <Separator />
              <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-3 text-[11px] text-muted-foreground">
                ACTIONS
              </div>
            </div>

            {/* Add to List */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm font-semibold">Add to my list</div>
                <div className="text-xs text-muted-foreground">Save titles into custom lists</div>
              </div>

              {!user ? (
                <div className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                  Login to add this title to your lists.
                </div>
              ) : (
                <div className={listsLoading || listActionLoading ? "space-y-3 opacity-60 pointer-events-none" : "space-y-3"}>
                  {titleInLists.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-xs text-muted-foreground">Already in:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {titleInLists.map((l) => (
                          <button
                            key={l._id}
                            type="button"
                            onClick={() => nav(`/lists/${l._id}`)}
                            className="text-xs px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted transition-colors cursor-pointer font-medium"
                          >
                            {l.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {myLists.length === 0 ? (
                    <div className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                      You have no lists yet. Create one in your Lists page.
                    </div>
                  ) : (
                    <div className="flex gap-2 items-end">
                      <select
                        value={selectedListId}
                        onChange={(e) => setSelectedListId(e.target.value)}
                        className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {myLists.map((l) => (
                          <option key={l._id} value={l._id}>
                            {l.title}
                          </option>
                        ))}
                      </select>

                      <Button
                        type="button"
                        onClick={addToSelectedList}
                        disabled={!selectedListId || listActionLoading}
                        size="default"
                        className="shrink-0 px-5"
                      >
                        {listActionLoading ? "Adding..." : "+ Add"}
                      </Button>
                    </div>
                  )}

                  {listsErr && (
                    <Alert variant="destructive">
                      <AlertDescription className="leading-relaxed">{listsErr}</AlertDescription>
                    </Alert>
                  )}

                  {listActionMsg && (
                    <Alert>
                      <AlertDescription className="leading-relaxed">{listActionMsg}</AlertDescription>
                    </Alert>
                  )}

                  {listActionErr && (
                    <Alert variant="destructive">
                      <AlertDescription className="leading-relaxed">{listActionErr}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            {/* Watchlist / Status */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm font-semibold">My status</div>
                <div className="text-xs text-muted-foreground">Manage your watchlist status</div>
              </div>

              {!user ? (
                <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
                  Login to see and manage your status.
                </div>
              ) : (
                <div className={actionLoading ? "space-y-3 opacity-60 pointer-events-none" : "space-y-3"}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">In watchlist</div>
                      <div className="mt-1 text-sm font-semibold">{inWatchlist ? "Yes ✅" : "No"}</div>
                    </div>

                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">Status</div>
                      <div className="mt-1">
                        {inWatchlist ? (
                          <span className="text-sm border px-2 py-1 rounded-md">
  {statusText}
</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!inWatchlist ? (
                      <Button type="button" onClick={() => addToWatchlist("want_to_watch")} disabled={actionLoading} className="w-full sm:w-auto">
                        {actionLoading ? "Working..." : "Add (Want to watch)"}
                      </Button>
                    ) : (
                      <>
                        <Button type="button" variant="outline" onClick={() => setStatus("want_to_watch")} disabled={actionLoading}>
                          Want
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setStatus("watching")} disabled={actionLoading}>
                          Watching
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setStatus("watched")} disabled={actionLoading}>
                          Watched
                        </Button>
                        <Button type="button" variant="destructive" onClick={removeFromWatchlist} disabled={actionLoading}>
                          Remove
                        </Button>
                      </>
                    )}
                  </div>

                  {actionMsg && (
                    <Alert>
                      <AlertDescription className="leading-relaxed">{actionMsg}</AlertDescription>
                    </Alert>
                  )}

                  {actionErr && (
                    <Alert variant="destructive">
                      <AlertDescription className="leading-relaxed">{actionErr}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}