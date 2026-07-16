import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const JargonTextFormatter = ({ text, jargonMap }) => {
  if (!jargonMap || Object.keys(jargonMap).length === 0) return <>{text}</>;

  // Convert jargon words into a Regex pattern (Example: \b(API|Backend)\b)
  const escapedWords = Object.keys(jargonMap).map(w =>
    w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  );

  const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');

  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {

        // Check whether the word exists in the jargon map
        const matchedWord = Object.keys(jargonMap).find(
          w => w.toLowerCase() === part.toLowerCase()
        );


        if (matchedWord) {

          return (
            <span
              key={i}
              className="relative group cursor-help border-b-2 border-dotted border-indigo-500 bg-indigo-50 px-1 font-semibold text-indigo-700 rounded transition hover:bg-indigo-100"
            >

              {part}


              {/* Tooltip displayed when hovering */}
              <span className="absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 scale-0 rounded-lg bg-gray-950 p-2 text-center text-xs font-normal text-white shadow-lg transition-all duration-150 group-hover:scale-100">

                {jargonMap[matchedWord]}


                {/* Tooltip arrow */}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-950"></span>

              </span>

            </span>
          );

        }


        return part;

      })}
    </>
  );
};


const CourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // States
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [progress, setProgress] = useState({ progressPercentage: 0, completedModuleIds: [] });

  // New Module Form States (for teachers)
  const [newModule, setNewModule] = useState({ title: '', textContent: '', audioUrl: '' });
  const [jargonInput, setJargonInput] = useState(''); 
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return navigate('/login');
    fetchModules();
    fetchProgress();
  }, [courseId]);


  // Fetch all modules
  const fetchModules = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/courses/${courseId}/modules`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setModules(res.data);

      if (res.data.length > 0 && !selectedModule) {
        setSelectedModule(res.data[0]); // Select the first module initially
      }

    } catch (err) {
      setError('Failed to fetch modules.');
    }
  };


  // Fetch student progress
  const fetchProgress = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/progress/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProgress(res.data);

    } catch (err) {
      console.log('Unable to fetch progress data.');
    }
  };


  // Add a new module (Only for teachers)
  const handleCreateModule = async (e) => {
  e.preventDefault();
  try {
    // ExampleInput: API: Application Interface, Backend: Server-side logic
    let parsedJargon = {};
    if (jargonInput.trim()) {
      jargonInput.split(',').forEach(pair => {
        const [word, meaning] = pair.split(':');
        if (word && meaning) parsedJargon[word.trim()] = meaning.trim();
      });
    }

    await axios.post(`http://localhost:5000/api/courses/${courseId}/modules`, 
      { ...newModule, jargon: parsedJargon }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    setNewModule({ title: '', textContent: '', audioUrl: '' });
    setJargonInput('');
    fetchModules();
  } catch (err) {
    setError('Failed to add the module.');
  }
};


  // Mark module as completed (Only for students)
  const handleMarkComplete = async (moduleId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/progress/mark-complete`,
        { courseId, moduleId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchProgress(); // Refresh progress after completion

    } catch (err) {
      alert(err.response?.data?.msg || 'An error occurred.');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 flex items-center font-semibold text-indigo-600 transition hover:text-indigo-800"
      >
        ← Back to Dashboard
      </button>


      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-600">
          {error}
        </div>
      )}



      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">


        {/* Left Side: Module List & Progress */}
        <div className="space-y-6 lg:col-span-1">


          {/* Progress Section */}
          <div className="rounded-xl bg-white p-4 shadow-sm">

            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
              Your Progress
            </h3>

            <div className="mb-1 flex items-center justify-between font-bold text-gray-800">
              <span>{progress.progressPercentage}% Completed</span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-gray-200">
              <div
                className="h-2.5 rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progress.progressPercentage}%` }}
              ></div>
            </div>

          </div>



          {/* Module List */}
          <div className="rounded-xl bg-white p-4 shadow-sm">

            <h3 className="mb-4 text-lg font-bold text-gray-800">
              Lesson Modules
            </h3>


            <div className="space-y-2">

              {modules.map((mod, index) => {

                const isCompleted = progress.completedModuleIds?.includes(mod._id);
                const isSelected = selectedModule?._id === mod._id;


                return (

                  <button
                    key={mod._id}
                    onClick={() => setSelectedModule(mod)}
                    className={`flex w-full items-center justify-between rounded-lg p-3 text-left font-medium transition ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >

                    <span className="truncate">
                      {index + 1}. {mod.title}
                    </span>

                    {isCompleted && (
                      <span className="text-sm font-bold text-green-600">
                        ✓
                      </span>
                    )}

                  </button>

                );

              })}

            </div>

          </div>



          {/* Add Module Form for Teachers */}
          {user.role === 'teacher' && (

            <div className="rounded-xl bg-white p-4 shadow-sm">

              <h3 className="mb-3 text-md font-bold text-gray-800">
                Add New Lesson
              </h3>


              <form onSubmit={handleCreateModule} className="space-y-3">

                <input
                  type="text"
                  placeholder="Lesson title"
                  required
                  value={newModule.title}
                  onChange={(e) =>
                    setNewModule({ ...newModule, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                />


                <textarea
                  placeholder="Notes Content"
                  required
                  rows="4"
                  value={newModule.textContent}
                  onChange={(e) =>
                    setNewModule({ ...newModule, textContent: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                ></textarea>


                <input
                  type="text"
                  placeholder="Difficult words (Example: API:Application Programming Interface, Backend:Server side)"
                  value={jargonInput}
                  onChange={(e) => setJargonInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                />

                <input
                  type="text"
                  placeholder="Audio Link (mp3 URL)"
                  required
                  value={newModule.audioUrl}
                  onChange={(e) =>
                    setNewModule({ ...newModule, audioUrl: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                />


                <button
                  type="submit"
                  className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Add Module
                </button>


              </form>

            </div>

          )}

        </div>





        {/* Right Side: Main Content Area */}
        <div className="lg:col-span-3">

          {selectedModule ? (

            <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm">


              <div>

                <h2 className="text-3xl font-bold text-gray-800">
                  {selectedModule.title}
                </h2>

                <hr className="mt-4 border-gray-200" />

              </div>



              {/* Audio Section */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">

                <h4 className="mb-2 text-sm font-bold text-indigo-900">
                  Teacher's Voice Explanation
                </h4>


                <audio
                  key={selectedModule._id}
                  controls
                  className="mt-2 w-full"
                >

                  <source
                    src={selectedModule.audioUrl}
                    type="audio/mp3"
                  />

                  Your browser does not support this audio player.

                </audio>

              </div>


              {/* Text Notes Section */}
              <div className="prose max-w-none whitespace-pre-wrap rounded-xl border border-gray-100 bg-slate-50 p-4 leading-relaxed text-gray-700">

                <JargonTextFormatter
                  text={selectedModule.textContent}
                  jargonMap={selectedModule.jargon}
                />

              </div>


              {/* Mark Complete Button */}
              {user.role === 'student' &&
                !progress.completedModuleIds?.includes(selectedModule._id) && (

                <button
                  onClick={() => handleMarkComplete(selectedModule._id)}
                  className="w-full rounded-lg bg-green-600 py-3 text-center font-semibold text-white shadow-md transition hover:bg-green-700"
                >
                  I have completed this lesson (Mark as Complete)
                </button>

              )}




              {progress.completedModuleIds?.includes(selectedModule._id) && (

                <div className="w-full rounded-lg border border-green-200 bg-green-100 py-3 text-center font-semibold text-green-700">

                  You have successfully completed this lesson!

                </div>

              )}


            </div>


          ) : (

            <div className="rounded-xl bg-white p-12 text-center text-gray-500 shadow-sm">

              No modules have been added to this course yet.

            </div>

          )}

        </div>


      </div>

    </div>
  );
};


export default CourseView;