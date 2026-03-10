"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

type Project = Tables<"projects">;

interface ProjectContextValue {
  project: Project | null;
  loading: boolean;
  refetch: () => void;
}

const ProjectContext = createContext<ProjectContextValue>({
  project: null,
  loading: true,
  refetch: () => {},
});

const DEFAULT_TAGS = [
  { name: "Pricing", color: "#F59E0B" },
  { name: "Trust", color: "#10B981" },
  { name: "Results", color: "#6366F1" },
  { name: "Quality", color: "#EC4899" },
  { name: "Speed", color: "#8B5CF6" },
  { name: "Features", color: "#3B82F6" },
  { name: "Support", color: "#F97316" },
  { name: "Onboarding", color: "#14B8A6" },
];

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Check for existing project membership
    const { data: members } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("user_id", user.id)
      .limit(1);

    if (members && members.length > 0) {
      const { data: proj } = await supabase
        .from("projects")
        .select("*")
        .eq("id", members[0].project_id)
        .single();

      if (proj) {
        setProject(proj);
        setLoading(false);
        return;
      }
    }

    // No project — create one
    const { data: newProject } = await supabase
      .from("projects")
      .insert({ name: "My Project", created_by: user.id })
      .select()
      .single();

    if (newProject) {
      // Add user as owner
      await supabase.from("project_members").insert({
        project_id: newProject.id,
        user_id: user.id,
        role: "owner",
      });

      // Seed default tags
      await supabase.from("tags").insert(
        DEFAULT_TAGS.map((t) => ({
          project_id: newProject.id,
          name: t.name,
          color: t.color,
        }))
      );

      setProject(newProject);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return (
    <ProjectContext.Provider
      value={{ project, loading, refetch: fetchProject }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
