// src/components/Breadcrumb.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Breadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathnames = location.pathname.split('/').filter(x => x);

  const handleClick = (index) => {
    const to = '/' + pathnames.slice(0, index + 1).join('/');
    navigate(to);
  };

  return (
    <ol className="flex flex-wrap items-center space-x-1 text-gray-500 text-sm">
      <li
        className="cursor-pointer hover:underline text-emerald-700"
        onClick={() => navigate('/dashboard')}
      >
        Home
      </li>
      {pathnames.map((name, index) => {
        const isLast = index === pathnames.length - 1;
        return (
          <React.Fragment key={index}>
            <span>/</span>
            <li
              className={`${isLast ? 'font-medium text-gray-800' : 'cursor-pointer hover:underline text-emerald-700'}`}
              {...(!isLast && { onClick: () => handleClick(index) })}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </li>
          </React.Fragment>
        );
      })}
    </ol>
  );
}
