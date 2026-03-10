"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/hooks/use-project";
import {
  Settings,
  Users,
  Shield,
  Trash2,
  Plus,
  Mail,
  Loader2,
  AlertTriangle,
  Crown,
  X,
  UserMinus,
} from "lucide-react";
import { inviteMemberByEmail, deleteProject } from "./actions";

type ProjectRole = "owner" | "admin" | "member";

interface TeamMember {
  id: string;
  user_id: string;
  role: ProjectRole;
  created_at: string;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  email: string | null;
}

const ROLE_BADGE_STYLES: Record<ProjectRole, string> = {
  owner:
    "bg-primary/10 text-primary border border-primary/20",
  admin:
    "bg-secondary/10 text-secondary-foreground border border-secondary/20",
  member:
    "bg-muted text-muted-foreground border border-border",
};

const ROLE_ICONS: Record<ProjectRole, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  member: Users,
};

export default function SettingsPage() {
  const { project, loading: projectLoading, refetch } = useProject();
  const router = useRouter();

  // Project settings state
  const [projectName, setProjectName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [savingProject, setSavingProject] = useState(false);
  const [projectSaveMessage, setProjectSaveMessage] = useState("");

  // Team members state
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<ProjectRole | null>(
    null
  );

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  // Remove member state
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Delete project state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Sync project fields when project loads
  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setWebsiteUrl(project.website_url ?? "");
    }
  }, [project]);

  // Fetch current user
  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    }
    fetchUser();
  }, []);

  // Fetch team members
  const fetchMembers = useCallback(async () => {
    if (!project) return;
    setLoadingMembers(true);
    const supabase = createClient();

    // Get project members
    const { data: memberData } = await supabase
      .from("project_members")
      .select("id, user_id, role, created_at")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true });

    if (memberData) {
      // Fetch profiles for all member user IDs
      const userIds = memberData.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.id, p])
      );

      // Get the current user's email
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const mappedMembers: TeamMember[] = memberData.map((m) => {
        const profile = profileMap.get(m.user_id) ?? null;

        return {
          id: m.id,
          user_id: m.user_id,
          role: m.role as ProjectRole,
          created_at: m.created_at,
          profile: profile
            ? {
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
              }
            : null,
          // We can only show the email for the current user
          email: m.user_id === user?.id ? (user?.email ?? null) : null,
        };
      });

      setMembers(mappedMembers);

      // Set current user's role
      if (user) {
        const currentMember = mappedMembers.find(
          (m) => m.user_id === user.id
        );
        if (currentMember) {
          setCurrentUserRole(currentMember.role);
        }
      }
    }

    setLoadingMembers(false);
  }, [project]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Save project settings
  async function handleSaveProject() {
    if (!project || !projectName.trim()) return;
    setSavingProject(true);
    setProjectSaveMessage("");

    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({
        name: projectName.trim(),
        website_url: websiteUrl.trim() || null,
      })
      .eq("id", project.id);

    if (error) {
      setProjectSaveMessage("Failed to save. Please try again.");
    } else {
      setProjectSaveMessage("Settings saved successfully.");
      refetch();
    }

    setSavingProject(false);
    setTimeout(() => setProjectSaveMessage(""), 3000);
  }

  // Invite member
  async function handleInvite() {
    if (!project || !inviteEmail.trim()) return;
    setInviting(true);
    setInviteError("");
    setInviteSuccess("");

    const result = await inviteMemberByEmail(
      project.id,
      inviteEmail.trim(),
      inviteRole
    );

    if (result.error) {
      setInviteError(result.error);
    } else {
      setInviteSuccess("Member added successfully!");
      setInviteEmail("");
      setInviteRole("member");
      fetchMembers();
    }

    setInviting(false);
    setTimeout(() => {
      setInviteSuccess("");
      setInviteError("");
    }, 4000);
  }

  // Remove member
  async function handleRemoveMember(memberId: string) {
    if (!project) return;
    setRemovingId(memberId);

    const supabase = createClient();
    await supabase.from("project_members").delete().eq("id", memberId);

    await fetchMembers();
    setRemovingId(null);
  }

  // Delete project
  async function handleDeleteProject() {
    if (!project || deleteConfirmName !== project.name) return;
    setDeleting(true);
    setDeleteError("");

    const result = await deleteProject(project.id);

    if (result.error) {
      setDeleteError(result.error);
      setDeleting(false);
    } else {
      // Redirect to home/dashboard — the project is gone
      router.push("/");
    }
  }

  const canManageMembers =
    currentUserRole === "owner" || currentUserRole === "admin";

  // Loading skeleton
  if (projectLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No project found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Page header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Settings className="size-6" />
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your project settings and team members.
        </p>
      </div>

      {/* ─── Project Settings ─── */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Project Settings</h2>
          <p className="text-sm text-muted-foreground">
            Update your project name and website URL.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="project-name"
              className="mb-1.5 block text-sm font-medium"
            >
              Project Name
            </label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Project"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <label
              htmlFor="website-url"
              className="mb-1.5 block text-sm font-medium"
            >
              Website URL
            </label>
            <input
              id="website-url"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveProject}
              disabled={savingProject || !projectName.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {savingProject && <Loader2 className="size-4 animate-spin" />}
              Save Changes
            </button>
            {projectSaveMessage && (
              <span
                className={`text-sm ${
                  projectSaveMessage.includes("Failed")
                    ? "text-destructive"
                    : "text-emerald-600"
                }`}
              >
                {projectSaveMessage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Team Members ─── */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Users className="size-5" />
            Team Members
          </h2>
          <p className="text-sm text-muted-foreground">
            View and manage who has access to this project.
          </p>
        </div>

        {/* Members list */}
        {loadingMembers ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => {
              const RoleIcon = ROLE_ICONS[member.role];
              const isCurrentUser = member.user_id === currentUserId;
              const canRemove = canManageMembers && !isCurrentUser && member.role !== "owner";

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium uppercase text-muted-foreground">
                      {member.profile?.avatar_url ? (
                        <img
                          src={member.profile.avatar_url}
                          alt=""
                          className="size-9 rounded-full object-cover"
                        />
                      ) : (
                        (member.profile?.full_name?.[0] ?? "U")
                      )}
                    </div>

                    {/* Name & email */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {member.profile?.full_name ?? "Unknown User"}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </div>
                      {member.email && (
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Joined{" "}
                        {new Date(member.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Role badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE_STYLES[member.role]}`}
                    >
                      <RoleIcon className="size-3" />
                      {member.role.charAt(0).toUpperCase() +
                        member.role.slice(1)}
                    </span>

                    {/* Remove button */}
                    {canRemove && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={removingId === member.id}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Remove member"
                      >
                        {removingId === member.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <UserMinus className="size-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Invite new member */}
        {canManageMembers && (
          <div className="mt-5 border-t border-border pt-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Mail className="size-4" />
              Invite New Member
            </h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              <select
                value={inviteRole}
                onChange={(e) =>
                  setInviteRole(e.target.value as "admin" | "member")
                }
                className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {inviting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Invite
              </button>
            </div>
            {inviteError && (
              <p className="mt-2 text-sm text-destructive">{inviteError}</p>
            )}
            {inviteSuccess && (
              <p className="mt-2 text-sm text-emerald-600">{inviteSuccess}</p>
            )}
          </div>
        )}
      </div>

      {/* ─── Danger Zone ─── */}
      <div className="rounded-xl border border-destructive/30 bg-card p-6">
        <div className="mb-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-destructive">
            <AlertTriangle className="size-5" />
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground">
            Irreversible actions that will permanently affect your project.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div>
            <p className="text-sm font-medium">Delete this project</p>
            <p className="text-xs text-muted-foreground">
              This will permanently delete the project, all testimonials, walls,
              forms, and team data.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90"
          >
            <Trash2 className="size-4" />
            Delete Project
          </button>
        </div>
      </div>

      {/* ─── Delete Confirmation Modal ─── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-destructive">
                <AlertTriangle className="size-5" />
                Delete Project
              </h3>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmName("");
                  setDeleteError("");
                }}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-sm text-destructive">
                <strong>Warning:</strong> This action cannot be undone. This
                will permanently delete the{" "}
                <strong>{project.name}</strong> project, all of its
                testimonials, walls, forms, tags, and team memberships.
              </p>
            </div>

            <p className="mb-3 text-sm text-muted-foreground">
              To confirm, type{" "}
              <strong className="text-foreground">{project.name}</strong>{" "}
              below:
            </p>

            <input
              type="text"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder={project.name}
              className="mb-4 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            />

            {deleteError && (
              <p className="mb-3 text-sm text-destructive">{deleteError}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmName("");
                  setDeleteError("");
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={deleting || deleteConfirmName !== project.name}
                className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {deleting && <Loader2 className="size-4 animate-spin" />}
                Delete Project Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
