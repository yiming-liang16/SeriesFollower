import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Loader2, Search } from "lucide-react";

export default function SearchPage() {
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [country, setCountry] = useState("");
  const [genres, setGenres] = useState(""); // 多个用逗号
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [sort, setSort] = useState("newest");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => {
    // 允许空条件也搜（你现在 useEffect 会默认搜一遍）
    // 这里主要用于防止 year 输入乱写
    const yminOk = !yearMin || /^\d{4}$/.test(yearMin);
    const ymaxOk = !yearMax || /^\d{4}$/.test(yearMax);
    return yminOk && ymaxOk && !loading;
  }, [yearMin, yearMax, loading]);

  async function fetchTitles(e) {
    if (e?.preventDefault) e.preventDefault();

    setLoading(true);
    setErr("");

    try {
      const params = {
        q,
        kind: kind || undefined,
        country,
        genres,
        yearMin: yearMin || undefined,
        yearMax: yearMax || undefined,
        sort,
        page: 1,
        limit: 20,
      };

      const res = await api.get("/titles", { params });
      setItems(res.data.items || []);
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTitles();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      {/* ✅ 想更宽：把 max-w-md 换成 max-w-2xl */}
      <div className="w-full max-w-md">
        <Card className="border shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Search</CardTitle>
            <CardDescription className="text-sm">
              Find movies / series by title, genre, year and more.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => nav("/submit")}>
                + Submit a Title
              </Button>
            </div>

            {err && (
              <Alert variant="destructive">
                <AlertDescription className="leading-relaxed">{err}</AlertDescription>
              </Alert>
            )}

            {/* ✅ Filters form */}
            <form onSubmit={fetchTitles} className={loading ? "space-y-4 opacity-60 pointer-events-none" : "space-y-4"}>
              <div className="space-y-2">
                <Label htmlFor="q">Title</Label>
                <Input
                  id="q"
                  placeholder="Search title..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="kind">Kind</Label>
                  <select
                    id="kind"
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">All</option>
                    <option value="movie">Movie</option>
                    <option value="series">Series</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="e.g. USA"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="genres">Genres</Label>
                  <span className="text-xs text-muted-foreground">Comma-separated</span>
                </div>
                <Input
                  id="genres"
                  placeholder="e.g. Drama,Crime"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="yearMin">Year min</Label>
                  <Input
                    id="yearMin"
                    placeholder="e.g. 1990"
                    value={yearMin}
                    onChange={(e) => setYearMin(e.target.value)}
                    inputMode="numeric"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearMax">Year max</Label>
                  <Input
                    id="yearMax"
                    placeholder="e.g. 2025"
                    value={yearMax}
                    onChange={(e) => setYearMax(e.target.value)}
                    inputMode="numeric"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort">Sort</Label>
                  <select
                    id="sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="name_asc">Name A-Z</option>
                    <option value="name_desc">Name Z-A</option>
                  </select>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>

              {/* 输入校验提示（可选） */}
              {((yearMin && !/^\d{4}$/.test(yearMin)) || (yearMax && !/^\d{4}$/.test(yearMax))) && (
                <p className="text-xs text-muted-foreground">
                  Year should be 4 digits (e.g. 2019).
                </p>
              )}
            </form>

            <div className="relative">
              <Separator />
              <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-3 text-[11px] text-muted-foreground">
                RESULTS
              </div>
            </div>

            {/* ✅ Results */}
            <div className="space-y-3">
              {!loading && items.length === 0 && (
                <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
                  No results.
                </div>
              )}

              {items.map((t) => (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => nav(`/titles/${t._id}`)}
                  className="w-full text-left rounded-xl border p-3 transition hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold leading-snug">{t.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t.kind} • {t.year} • {t.country}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{t.kind}</span>
                  </div>

                  {!!t.genres?.length && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {t.genres.slice(0, 4).map((g) => (
                        <span className="text-[11px] text-muted-foreground border px-2 py-0.5 rounded">
  {g}
</span>
                      ))}
                      {t.genres.length > 4 && (
                        <span className="text-[11px] text-muted-foreground">+{t.genres.length - 4}</span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Tip: click a result to open the title page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}