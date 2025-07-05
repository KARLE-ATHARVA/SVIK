import React from 'react';

export default function Widgets({ title, amount }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-start">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-2xl font-semibold">{amount}</p>
    </div>
  );
}
