import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/supabase/server";
import { AdminApp } from "./admin-app";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { supabase, isAdmin, email } = await getAdmin();
  if (!isAdmin) redirect("/admin/login");
  const ordered = (t: string) => supabase.from(t).select("*").order("sort_order").order("created_at");
  const newest = (t: string) => supabase.from(t).select("*").order("created_at", { ascending: false }).limit(300);
  const [settings, projects, timeline, credentials, gallery, contacts, messages, comments] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    ordered("projects"), ordered("timeline_entries"), ordered("credentials"), ordered("gallery_photos"), ordered("contact_links"),
    newest("messages"), newest("comments"),
  ]);
  return (
    <AdminApp
      email={email}
      settings={settings.data ?? {}}
      rows={{ projects: projects.data ?? [], timeline_entries: timeline.data ?? [], credentials: credentials.data ?? [], gallery_photos: gallery.data ?? [], contact_links: contacts.data ?? [] }}
      messages={messages.data ?? []}
      comments={comments.data ?? []}
    />
  );
}
