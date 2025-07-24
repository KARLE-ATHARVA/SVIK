import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Log the pathname for debugging
  console.log('Breadcrumbs: Current pathname:', location.pathname);
  console.log('Breadcrumbs: Path segments:', pathnames);

  // Define custom labels for specific routes
  const routeLabels = {
    dashboard: 'Dashboard',
    masterTables: 'Master Tables',
    applicationMaster: 'Application Master',
    categoryMaster: 'Category Master',
    colorMaster: 'Color Master',
    companyMaster: 'Company Master',
    finishMaster: 'Finish Master',
    tileMaster: 'Tile Master',
    sizeMaster: 'Size Master',
    spaceMaster: 'Space Master',
    userMaster: 'User Master',
    loginMaster: 'Login Master',
    planMaster: 'Plan Master',
    profileMaster: 'Profile Master',
    loginHistory: 'Login History',
    userActivityLog: 'User Activity Log',
    adminActivityLog: 'Admin Activity Log',
  };

  // Only show breadcrumbs if not on the dashboard
  if (location.pathname === '/dashboard') {
    console.log('Breadcrumbs: On dashboard, hiding breadcrumbs');
    return null;
  }

  // Construct breadcrumb items
  const breadcrumbItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
    },
  ];

  // Handle routes
  if (pathnames[0] === 'masterTables') {
    breadcrumbItems.push({
      label: 'Master Tables',
      path: '/masterTables',
    });
    if (pathnames[1]) {
      breadcrumbItems.push({
        label: routeLabels[pathnames[1]] || pathnames[1]
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        path: `/masterTables/${pathnames[1]}`,
      });
    }
  } else {
    // Handle other top-level routes (e.g., loginHistory, userActivityLog, adminActivityLog)
    pathnames.forEach((value, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = routeLabels[value] || value
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      breadcrumbItems.push({ label, path });
    });
  }

  // Log the constructed breadcrumb items
  console.log('Breadcrumbs: Constructed items:', breadcrumbItems);

  return (
    <nav className="text-sm text-gray-600 mb-4 px-6">
      <ol className="list-none p-0 inline-flex space-x-2 items-center">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          return (
            <li key={item.path} className="inline-flex items-center">
              {index > 0 && <span className="mx-2 text-gray-400">›</span>}
              {isLast ? (
                <span className="text-gray-800 font-medium">{item.label}</span>
              ) : (
                <Link
                  to={item.path}
                  className="text-green-700 hover:text-green-800 hover:underline transition-colors duration-200"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}