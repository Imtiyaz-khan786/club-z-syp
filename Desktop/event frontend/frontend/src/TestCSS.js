import React from 'react';

const TestCSS = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform hover:scale-105 transition-all duration-300">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-4">
          Tailwind CSS Working! 🎉
        </h1>
        <p className="text-gray-600 text-center mb-6">
          If you can see this with proper styling, Tailwind is configured correctly.
        </p>
        <div className="space-y-3">
          <button className="btn-primary w-full">
            Primary Button
          </button>
          <button className="btn-secondary w-full">
            Secondary Button
          </button>
        </div>
        <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
          <p className="text-indigo-800 text-sm">
            ✅ Colors: Blue gradients
            <br />
            ✅ Spacing: Proper padding/margins
            <br />
            ✅ Shadows: Card has shadow
            <br />
            ✅ Animations: Hover effects working
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestCSS;