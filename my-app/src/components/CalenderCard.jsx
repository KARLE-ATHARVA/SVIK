import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarCard() {
  const [date, setDate] = useState(new Date());

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Calendar</h2>
      <Calendar onChange={setDate} value={date} />
    </div>
  );
}
