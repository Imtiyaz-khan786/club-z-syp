import React, { useState, useEffect } from 'react';
import { getHolidays } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import { format } from 'date-fns';

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchHolidays();
  }, [year]);

  const fetchHolidays = async () => {
    try {
      const response = await getHolidays({ year });
      setHolidays(response.data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const years = [2023, 2024, 2025, 2026];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Academic Calendar</h1>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="input-field w-32"
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : holidays.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No holidays found for {year}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="divide-y">
            {holidays.map((holiday, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{Holidays.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {format(new Date(holiday.date), 'EEEE, MMMM d, yyyy')}
                    </p>
                    {holiday.description && (
                      <div className="flex items-start mt-2 text-gray-600">
                        <FaInfoCircle className="text-xs mr-1 mt-1" />
                        <p className="text-sm">{holiday.description}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    {holiday.is_public_holiday && (
                      <span className="badge badge-primary">Public Holiday</span>
                    )}
                    {holiday.academic_break && (
                      <span className="badge badge-warning ml-2">Academic Break</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Holidays;