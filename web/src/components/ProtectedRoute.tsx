import React from 'react';

interface ProtectedRouteProps {
  component: React.ReactNode;
  allowedRoles: string[];
  userRole?: string;
  onAccessDenied?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component,
  allowedRoles,
  userRole,
  onAccessDenied,
}) => {
  if (!userRole) {
    if (onAccessDenied) onAccessDenied();
    return null;
  }

  if (!allowedRoles.includes(userRole)) {
    if (onAccessDenied) onAccessDenied();
    return null;
  }

  return <>{component}</>;
};
