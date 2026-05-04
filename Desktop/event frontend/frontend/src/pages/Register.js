import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaGraduationCap, 
  FaIdCard,
  FaUserGraduate,
  FaUserTag,
  FaUserShield,
  FaChalkboardTeacher,
  FaUsers
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    roll_number: '',
    phone: '',
    department: '',
    year: '',
    role: 'student'  // Default role is student
  });
  
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (!formData.first_name.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!formData.last_name.trim()) {
      toast.error('Last name is required');
      return false;
    }
    
    // Only validate roll number for students
    if (formData.role === 'student' && !formData.roll_number.trim()) {
      toast.error('Roll number is required for students');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    // Prepare data for backend
    const registerData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      roll_number: formData.role === 'student' ? formData.roll_number : '',
      phone: formData.phone,
      department: formData.department,
      year: formData.year,
      role: formData.role
    };
    
    const success = await register(registerData);
    setLoading(false);
    
    if (success) {
      // Show role-specific welcome message
      const roleMessages = {
        student: 'Welcome to the student community! 🎓',
        leader: 'Welcome Event Leader! You can now create and manage events. 🎯',
        admin: 'Welcome Admin! You have full access to manage the system. 🔧'
      };
      toast.success(roleMessages[formData.role] || 'Registration successful!');
      navigate('/dashboard');
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin':
        return <FaUserShield className="text-purple-600" />;
      case 'leader':
        return <FaChalkboardTeacher className="text-blue-600" />;
      default:
        return <FaUsers className="text-green-600" />;
    }
  };

  const getRoleDescription = (role) => {
    switch(role) {
      case 'admin':
        return 'Full system access, manage all events, users, and settings';
      case 'leader':
        return 'Create and manage events, mark attendance, upload gallery images';
      default:
        return 'Register for events, share moments, like gallery images';
    }
  };

  const departments = [
    'Computer Science',
    'Engineering',
    'Business',
    'Arts',
    'Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Economics'
  ];

  const years = [1, 2, 3, 4];

  return (
    <div className="max-w-3xl mx-auto mt-10 mb-10">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Create Account
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Join our university community today!
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter email"
                  required
                />
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUserGraduate className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter first name"
                  required
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUserGraduate className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            {/* Role Selection - NEW */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2 font-medium">
                Select Your Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Student Role */}
                <label
                  className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.role === 'student'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === 'student'}
                    onChange={handleChange}
                    className="absolute opacity-0"
                  />
                  <div className="flex items-center gap-3 w-full">
                    <div className="text-2xl text-green-600">
                      <FaUsers />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">Student</div>
                      <div className="text-xs text-gray-500">Register for events, share moments</div>
                    </div>
                    {formData.role === 'student' && (
                      <div className="text-green-500 text-xl">✓</div>
                    )}
                  </div>
                </label>

                {/* Event Leader Role */}
                <label
                  className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.role === 'leader'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="leader"
                    checked={formData.role === 'leader'}
                    onChange={handleChange}
                    className="absolute opacity-0"
                  />
                  <div className="flex items-center gap-3 w-full">
                    <div className="text-2xl text-blue-600">
                      <FaChalkboardTeacher />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">Event Leader</div>
                      <div className="text-xs text-gray-500">Create events, mark attendance</div>
                    </div>
                    {formData.role === 'leader' && (
                      <div className="text-blue-500 text-xl">✓</div>
                    )}
                  </div>
                </label>

                {/* Admin Role */}
                <label
                  className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.role === 'admin'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                    className="absolute opacity-0"
                  />
                  <div className="flex items-center gap-3 w-full">
                    <div className="text-2xl text-purple-600">
                      <FaUserShield />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">Admin</div>
                      <div className="text-xs text-gray-500">Full system access</div>
                    </div>
                    {formData.role === 'admin' && (
                      <div className="text-purple-500 text-xl">✓</div>
                    )}
                  </div>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                {getRoleIcon(formData.role)}
                <span>{getRoleDescription(formData.role)}</span>
              </p>
            </div>

            {/* Roll Number - Only show for students */}
            {formData.role === 'student' && (
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Roll Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="roll_number"
                    value={formData.roll_number}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Enter roll number (e.g., CS2024001)"
                    required={formData.role === 'student'}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter password (min 6 characters)"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Phone Number
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Department
              </label>
              <div className="relative">
                <FaGraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field pl-10"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Year
              </label>
              <div className="relative">
                <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="input-field pl-10"
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}st Year</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Login here
            </Link>
          </p>
        </div>

        {/* Info message */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          <p className="font-medium mb-1">📝 Note:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Choose your role carefully - this determines your access level</li>
            <li>Students must provide a valid roll number</li>
            <li>Admins and Event Leaders have special permissions</li>
            <li>Password must be at least 6 characters long</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;