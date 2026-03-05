import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';

export default function ProfilePage() {
  const { user, loading, refreshMe, signOut } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({ name: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarMsg, setAvatarMsg] = useState('');
  const [avatarErr, setAvatarErr] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', bio: user.bio || '' });
    }
  }, [user]);

  if (loading) return <div className="mx-auto max-w-lg p-6">Loading...</div>;
  if (!user) return <div className="mx-auto max-w-lg p-6">Not logged in.</div>;

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSave() {
    setSaving(true);
    setMsg('');
    setErr('');
    try {
      await api.patch('/users/me', form);
      await refreshMe();
      setMsg('Profile updated.');
    } catch (e) {
      setErr(e?.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  function onPickAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarErr('');
    setAvatarMsg('');
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function onUploadAvatar() {
    if (!avatarFile) {
      setAvatarErr('Please choose an image first.');
      return;
    }
    setAvatarUploading(true);
    setAvatarErr('');
    setAvatarMsg('');
    try {
      const fd = new FormData();
      fd.append('avatar', avatarFile);
      await api.post('/users/me/avatar', fd);
      await refreshMe();
      setAvatarMsg('Avatar updated.');
      setAvatarFile(null);
      setAvatarPreview('');
    } catch (e) {
      setAvatarErr(e?.response?.data?.error || 'Upload failed');
    } finally {
      setAvatarUploading(false);
    }
  }

  function onSignOut() {
    signOut();
    nav('/');
  }

  const avatarSrc = avatarPreview
    ? avatarPreview
    : user.avatarUrl
    ? `http://localhost:3011${user.avatarUrl}`
    : null;

  return (
    <div className="mx-auto max-w-lg p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account information.</p>
      </div>

      <Separator />

      {/* Avatar */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Avatar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="avatar"
                className="h-20 w-20 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-semibold text-secondary-foreground">
                {user.username?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={onPickAvatar}
                className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1 file:text-sm file:font-medium"
              />
              <Button size="sm" onClick={onUploadAvatar} disabled={avatarUploading}>
                {avatarUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
          {avatarMsg && <p className="text-sm text-green-600">{avatarMsg}</p>}
          {avatarErr && <p className="text-sm text-destructive">{avatarErr}</p>}
        </CardContent>
      </Card>

      {/* Account info */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Username</span>
            <span className="font-medium">{user.username}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={form.name} onChange={onChange} placeholder="Your name" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={onChange}
              rows={4}
              placeholder="Tell us about yourself"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <Button onClick={onSave} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>

          {msg && <p className="text-sm text-green-600">{msg}</p>}
          {err && <p className="text-sm text-destructive">{err}</p>}
        </CardContent>
      </Card>

      {/* Sign out */}
      <Card className="rounded-2xl">
        <CardContent className="py-4">
          <Button variant="destructive" className="w-full" onClick={onSignOut}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
