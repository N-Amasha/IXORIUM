import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Get User and Token details from LocalStorage
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  // Fetch all courses when the page loads
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
    } catch (err) {
      setError('Failed to fetch courses.');
    }
  };

  // Create a new course (Only for teachers)
  const handleCreateCourse = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        'http://localhost:5000/api/courses',
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTitle('');
      setDescription('');
      fetchCourses(); // Refresh course list

    } catch (err) {
      setError('Unable to create the course.');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Top Navigation Bar */}
      <div className="mb-8 flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user.name}!
          </h1>

          <p className="text-sm text-gray-500 capitalize">
            Role: {user.role === 'teacher' ? 'Teacher' : 'Student'}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-600"
        >
          Logout
        </button>
      </div>


      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-600">
          {error}
        </div>
      )}


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Left Side: Course Creation Form for Teachers */}
        {user.role === 'teacher' && (
          <div className="h-fit rounded-xl bg-white p-6 shadow-sm">

            <h2 className="mb-4 text-xl font-bold text-gray-800">
              Create a New Course
            </h2>

            <form onSubmit={handleCreateCourse} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Course Title
                </label>

                <input
                  type="text"
                  value={title}
                  required
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  value={description}
                  required
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-indigo-500 focus:outline-none"
                ></textarea>
              </div>


              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
              >
                Create Course
              </button>

            </form>

          </div>
        )}



        {/* Right Side: Course List */}
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
            user.role === 'teacher' ? 'lg:col-span-2' : 'lg:col-span-3'
          }`}
        >

          {courses.map((course) => (

            <div
              key={course._id}
              className="flex flex-col justify-between rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >

              <div>

                <h3 className="text-xl font-bold text-gray-800">
                  {course.title}
                </h3>

                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                  {course.description}
                </p>

                <p className="mt-4 text-xs font-medium text-indigo-600">
                  Teacher: {course.teacher?.name}
                </p>

              </div>


              <button
                onClick={() => navigate(`/course/${course._id}`)}
                className="mt-6 w-full rounded-lg bg-gray-800 py-2 text-center font-semibold text-white transition hover:bg-gray-900"
              >
                Go to Lessons →
              </button>


            </div>

          ))}



          {courses.length === 0 && (

            <div className="col-span-full rounded-xl bg-white py-12 text-center text-gray-500 shadow-sm">
              No courses have been added yet.
            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default Dashboard;