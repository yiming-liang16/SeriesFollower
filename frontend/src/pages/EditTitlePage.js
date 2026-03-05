import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";

export default function EditTitlePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [kind, setKind] = useState("movie");
  const [form, setForm] = useState({
    name: "",
    year: "",
    country: "",
    genres: "",
    overview: "",
    duration: "",
    director: "",
    totalSeasons: "",
    totalEpisodes: "",
    episodeLength: "",
  });

  // current poster from DB
  const [currentPosterUrl, setCurrentPosterUrl] = useState("");
  // new poster file chosen by user
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");

  const [loadingData, setLoadingData] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // Load existing title + details
  useEffect(() => {
    async function load() {
      setLoadingData(true);
      setLoadErr("");
      try {
        const res = await api.get(`/titles/${id}`);
        const { title, details } = res.data;

        setKind(title.kind);
        setCurrentPosterUrl(title.posterUrl || "");

        setForm({
          name: title.name || "",
          year: title.year != null ? String(title.year) : "",
          country: title.country || "",
          genres: Array.isArray(title.genres) ? title.genres.join(", ") : "",
          overview: title.overview || "",
          duration: details?.duration != null ? String(details.duration) : "",
          director: details?.director || "",
          totalSeasons: details?.totalSeasons != null ? String(details.totalSeasons) : "",
          totalEpisodes: details?.totalEpisodes != null ? String(details.totalEpisodes) : "",
          episodeLength: details?.episodeLength != null ? String(details.episodeLength) : "",
        });
      } catch (e) {
        setLoadErr(e?.response?.data?.error || "Failed to load title");
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [id]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onPickPoster(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  }

  function onRemovePoster() {
    setPosterFile(null);
    setPosterPreview("");
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErr("");

    try {
      const fd = new FormData();
      if (form.name)     fd.append("name", form.name);
      if (form.year)     fd.append("year", form.year);
      if (form.country)  fd.append("country", form.country);
      if (form.genres)   fd.append("genres", form.genres);
      if (form.overview) fd.append("overview", form.overview);
      if (posterFile)    fd.append("poster", posterFile);

      if (kind === "movie") {
        if (form.duration)  fd.append("duration", form.duration);
        if (form.director)  fd.append("director", form.director);
      } else {
        if (form.totalSeasons)  fd.append("totalSeasons", form.totalSeasons);
        if (form.totalEpisodes) fd.append("totalEpisodes", form.totalEpisodes);
        if (form.episodeLength) fd.append("episodeLength", form.episodeLength);
      }

      await api.patch(`/titles/${id}`, fd);

      nav(`/titles/${id}`);
    } catch (e) {
      console.error("PATCH /titles/:id error:", e?.response?.status, e?.response?.data, e?.message);
      const yupErrors = e?.response?.data?.details;
      setErr(
        yupErrors
          ? yupErrors.join(" / ")
          : e?.response?.data?.error || e?.message || "Update failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Edit Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Please login to edit.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingData) {
    return <div className="mx-auto max-w-lg p-6 text-sm text-muted-foreground">Loading...</div>;
  }

  if (loadErr) {
    return <div className="mx-auto max-w-lg p-6 text-sm text-destructive">{loadErr}</div>;
  }

  // resolved poster to display (new preview > existing URL)
  const displayPoster = posterPreview || (currentPosterUrl ? `http://localhost:3011${currentPosterUrl}` : "");

  return (
    <div className="mx-auto max-w-lg p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Edit Title</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the information for this {kind}.
        </p>
      </div>

      <Separator />

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Basic info */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Title</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="e.g. Breaking Bad"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Kind</Label>
              <div className="h-10 flex items-center rounded-md border border-input bg-muted/30 px-3 text-sm text-muted-foreground">
                {kind === "movie" ? "Movie" : "Series"} (cannot be changed)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  name="year"
                  value={form.year}
                  onChange={onChange}
                  placeholder="e.g. 2008"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={onChange}
                  placeholder="e.g. USA"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="genres">Genres</Label>
                <span className="text-xs text-muted-foreground">Comma-separated</span>
              </div>
              <Input
                id="genres"
                name="genres"
                value={form.genres}
                onChange={onChange}
                placeholder="e.g. Drama,Crime,Thriller"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="overview">Overview</Label>
              <textarea
                id="overview"
                name="overview"
                value={form.overview}
                onChange={onChange}
                rows={4}
                placeholder="Brief description..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Poster */}
            <div className="space-y-2">
              <Label>Poster Image</Label>
              {displayPoster ? (
                <div className="space-y-2">
                  <img
                    src={displayPoster}
                    alt="poster"
                    className="h-48 w-32 rounded-md object-cover border border-border"
                  />
                  {posterPreview && (
                    <Button type="button" variant="outline" size="sm" onClick={onRemovePoster}>
                      Revert to current
                    </Button>
                  )}
                  {!posterPreview && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onPickPoster}
                        className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1 file:text-sm file:font-medium"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Upload a new image to replace the current one.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPickPoster}
                    className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1 file:text-sm file:font-medium"
                  />
                  <p className="text-xs text-muted-foreground">PNG / JPG / WEBP, max 5 MB</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Kind-specific */}
        {kind === "movie" ? (
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Movie Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="director">Director</Label>
                <Input
                  id="director"
                  name="director"
                  value={form.director}
                  onChange={onChange}
                  placeholder="e.g. Christopher Nolan"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={form.duration}
                  onChange={onChange}
                  placeholder="e.g. 120"
                  inputMode="numeric"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Series Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="totalSeasons">Total Seasons</Label>
                  <Input
                    id="totalSeasons"
                    name="totalSeasons"
                    value={form.totalSeasons}
                    onChange={onChange}
                    placeholder="e.g. 5"
                    inputMode="numeric"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="totalEpisodes">Total Episodes</Label>
                  <Input
                    id="totalEpisodes"
                    name="totalEpisodes"
                    value={form.totalEpisodes}
                    onChange={onChange}
                    placeholder="e.g. 62"
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="episodeLength">Episode Length (minutes)</Label>
                <Input
                  id="episodeLength"
                  name="episodeLength"
                  value={form.episodeLength}
                  onChange={onChange}
                  placeholder="e.g. 47"
                  inputMode="numeric"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {err && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {err}
          </div>
        )}

        <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11"
            onClick={() => nav(`/titles/${id}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 h-11 text-base font-semibold"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
