import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [editingCourseId, setEditingCourseId] = useState(null);

  const [editCourseData, setEditCourseData] = useState({
    title: '',
    description: ''
  });


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

  // Start editing course
  const startEditingCourse = (course) => {

    setEditingCourseId(course._id);

    setEditCourseData({
      title: course.title,
      description: course.description
    });

  };

const handleDeleteCourse = async (courseId) => {

  if (
    !window.confirm(
      "Are you sure you want to delete this course and all its lessons?"
    )
  )
    return;

  try {

    await axios.delete(
      `http://localhost:5000/api/courses/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    fetchCourses();

  } catch (err) {
    setError("Failed to delete course.");
  }

};

  // Update course
  const handleUpdateCourse = async (e, courseId)=>{

    e.preventDefault();

    try {

      await axios.put(
        `http://localhost:5000/api/courses/${courseId}`,
        editCourseData,
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );


      setEditingCourseId(null);

      fetchCourses();


    } catch(err){

      setError("Failed to update course");

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

          {courses.map((course)=>{

            const isEditingThis = editingCourseId === course._id;


            return (

            <div
            key={course._id}
            className="rounded-xl bg-white p-6 shadow-sm border"
            >


            {isEditingThis ? (

            <form
            onSubmit={(e)=>handleUpdateCourse(e,course._id)}
            className="space-y-3"
            >


            <input
            value={editCourseData.title}
            onChange={(e)=>
            setEditCourseData({
            ...editCourseData,
            title:e.target.value
            })
            }
            className="w-full border p-2 rounded"
            />



            <textarea
            value={editCourseData.description}
            onChange={(e)=>
            setEditCourseData({
            ...editCourseData,
            description:e.target.value
            })
            }
            className="w-full border p-2 rounded"
            />



            <div className="flex gap-2">

            <button
            type="submit"
            className="bg-green-600 text-white px-3 py-2 rounded"
            >
            Save
            </button>


            <button
            type="button"
            onClick={()=>setEditingCourseId(null)}
            className="bg-gray-400 text-white px-3 py-2 rounded"
            >
            Cancel
            </button>


            </div>


            </form>


            ):(


            <>


            <div className="flex justify-between">


            <h3 className="text-xl font-bold">
            {course.title}
            </h3>



            {user.role === 'teacher' && user.id === course.teacher?._id && (
              <div className="flex gap-2">

                <button
                  onClick={() => startEditingCourse(course)}
                  className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold px-2.5 py-1 rounded transition"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteCourse(course._id)}
                  className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-bold px-2.5 py-1 rounded transition"
                >
                  Delete
                </button>

              </div>
            )}


            </div>


            <p className="mt-3 text-gray-600">
            {course.description}
            </p>



            <button

            onClick={()=>
            navigate(`/course/${course._id}`)
            }

            className="mt-5 w-full bg-gray-800 text-white py-2 rounded"

            >
            Go To Lessons →
            </button>


            </>


            )}


            </div>

            );


            })}



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