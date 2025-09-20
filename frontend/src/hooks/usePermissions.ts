import { useMemo } from "react";
import mockData from "@/data/mockData.json";

interface ModulePermission {
  read: boolean;
  write: boolean;
}

interface Permissions {
  projects: string[];
  allProjects?: boolean; // New field for all projects access
  modules: {
    [key: string]: ModulePermission;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  joinDate: string;
  isAdmin?: boolean;
  permissions?: Permissions;
}

export function usePermissions(userId?: string) {
  const currentUser = useMemo(() => {
    // In a real app, this would come from auth context
    // For demo, we'll use the admin user
    return mockData.teamMembers.find(member => member.id === "TM-002") as TeamMember;
  }, []);

  const userPermissions = useMemo(() => {
    if (userId) {
      const user = mockData.teamMembers.find(member => member.id === userId) as TeamMember;
      return user?.permissions || null;
    }
    return currentUser?.permissions || null;
  }, [userId, currentUser]);

  const hasProjectAccess = (projectId: string) => {
    if (currentUser?.isAdmin) return true;
    if (userPermissions?.allProjects) return true;
    return userPermissions?.projects.includes(projectId) || false;
  };

  const hasModulePermission = (module: string, action: 'read' | 'write') => {
    if (currentUser?.isAdmin) return true;
    return userPermissions?.modules[module]?.[action] || false;
  };

  const canReadModule = (module: string) => hasModulePermission(module, 'read');
  const canWriteModule = (module: string) => hasModulePermission(module, 'write');

  const getAccessibleProjects = () => {
    if (currentUser?.isAdmin) {
      return mockData.projects;
    }
    if (userPermissions?.allProjects) {
      return mockData.projects;
    }
    const accessibleProjectIds = userPermissions?.projects || [];
    return mockData.projects.filter(project => accessibleProjectIds.includes(project.id));
  };

  const isAdmin = currentUser?.isAdmin || false;

  return {
    currentUser,
    userPermissions,
    hasProjectAccess,
    hasModulePermission,
    canReadModule,
    canWriteModule,
    getAccessibleProjects,
    isAdmin,
  };
}