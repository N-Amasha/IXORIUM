import React, { useState, useEffect, useRef } from 'react'; 
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; 

// Convert Google Drive URL into preview URL
const getDirectDriveUrl = (url) => {
  if (!url || !url.includes("drive.google.com")) {
    return url;
  }

  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (match && match[1]) {
    const fileId = match[1];

    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  return url;
};

const JargonTextFormatter = ({ text, jargonMap }) => {

  if (!jargonMap || Object.keys(jargonMap).length === 0) {
    return text;
  }

  // Convert React children array into normal text
  if (Array.isArray(text)) {
    text = text.join('');
  }

  if (typeof text !== "string") {
    return text;
  }

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
  const [isEditing, setIsEditing] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [editData, setEditData] = useState({
      title: "",
      textContent: "",
      audioUrl: "",
      imageUrl: "",
      jargonInput: ""
  });

  // New Module Form States (for teachers)
  const [newModule, setNewModule] = useState({ title: '', textContent: '', audioUrl: '' });
  const [jargonInput, setJargonInput] = useState(''); 
  const [error, setError] = useState('');

  const audioRef = useRef(null); // Control the audio player
  const [speed, setSpeed] = useState(1); // Save current playback speed

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
    console.log("MODULE CREATE ERROR:", err.response?.data || err.message);
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

  const startEditing = () => {
  const jargonString = Object.entries(selectedModule.jargon || {})
      .map(([word, meaning]) => `${word}:${meaning}`)
      .join(", ");

    setEditData({
      title: selectedModule.title,
      textContent: selectedModule.textContent,
      audioUrl: selectedModule.audioUrl,
      imageUrl: selectedModule.imageUrl || "",
      jargonInput: jargonString
    });

    setIsEditing(true);
  };


  const handleDeleteModule = async (moduleId) => {

      if (
        !window.confirm(
          "Are you sure you want to delete this lesson?"
        )
      )
        return;

      try {

        await axios.delete(
          `http://localhost:5000/api/courses/modules/${moduleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setSelectedModule(null);

        fetchModules();

      } catch (err) {
        setError("Failed to delete module.");
      }

    };

  const handleUpdateModule = async (e) => {
    e.preventDefault();

    try {
      let parsedJargon = {};

      if (editData.jargonInput.trim()) {
        editData.jargonInput.split(",").forEach(pair => {
          const [word, meaning] = pair.split(":");

          if (word && meaning) {
            parsedJargon[word.trim()] = meaning.trim();
          }
        });
      }

    const res = await axios.put(
        `http://localhost:5000/api/courses/modules/${selectedModule._id}`,
        {
          title: editData.title,
          textContent: editData.textContent,
          audioUrl: editData.audioUrl,
          imageUrl: editData.imageUrl,
          jargon: parsedJargon
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSelectedModule(res.data);

      fetchModules();

      setIsEditing(false);

    } catch (err) {
      setError("Failed to update module.");
    }
  };

const handleFileUpload = async (file) => {

  

  const formData = new FormData();

  formData.append("file", file);


  try {

    const res = await axios.post(
      "http://localhost:5000/api/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      }
    );


    console.log("Upload Response:", res.data);

    return res.data.url;


  } catch(error){

    console.log(
      "Upload failed:",
      error.response?.data || error.message
    );

    return null;
  }
  

};

const handleEditUpload = async (file, type) => {

  if (!file) return;

  setUploading(true);

  const url = await handleFileUpload(file);

  if (url) {

    if (type === "audio") {
      setEditData(prev => ({
        ...prev,
        audioUrl: url
      }));
    }


    if (type === "image") {
      setEditData(prev => ({
        ...prev,
        imageUrl: url
      }));
    }

  }

  setUploading(false);

};

  const changeSpeed = (newSpeed) => {
  if (audioRef.current) {
    audioRef.current.playbackRate = newSpeed;
    setSpeed(newSpeed);
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
                  type="file"
                  accept="audio/*"
                  onChange={async (e)=>{

                    const url = await handleFileUpload(e.target.files[0]);

                    if(url){

                    setNewModule(prev=>({
                      ...prev,
                      audioUrl:url
                    }));

                    }

                  }}
                  className="w-full rounded-lg border p-2"
                />

                  {uploading && (
                    <p className="text-sm text-indigo-600">
                      Uploading audio...
                    </p>
                  )}

                  {newModule.audioUrl && newModule.audioUrl !== "" && (
                    <audio controls className="w-full mt-2">
                      <source 
                      src={newModule.audioUrl || null}
                      type="audio/mpeg"
                      />
                    </audio>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {

                      setUploading(true);

                      const url = await handleFileUpload(e.target.files[0]);

                      if (url) {
                        setNewModule(prev => ({
                          ...prev,
                          textContent:
                            prev.textContent +
                            `\n\n![Lesson Image](${url})`
                        }));
                      }

                      setUploading(false);

                    }}
                    className="w-full rounded-lg border p-2"
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


                      <div className="flex items-center justify-between">

          <h2 className="text-3xl font-bold text-gray-800">
            {selectedModule.title}
          </h2>

          {user.role === "teacher" && !isEditing && (
            <div className="flex gap-2">

              <button
                onClick={startEditing}
                className="rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 font-medium text-sm transition shadow-sm"
              >
                Edit Lesson
              </button>

              <button
                onClick={() => handleDeleteModule(selectedModule._id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 font-medium text-sm transition shadow-sm"
              >
                🗑️ Delete Lesson
              </button>

            </div>
          )}

        </div>

      <hr className="mt-4 border-gray-200" />

      {isEditing ? (

          <form
            onSubmit={handleUpdateModule}
            className="space-y-4 rounded-xl border bg-gray-50 p-5"
          >

            <input
              type="text"
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              className="w-full rounded border p-2"
            />

            <textarea
              rows="10"
              value={editData.textContent}
              onChange={(e) =>
                setEditData({ ...editData, textContent: e.target.value })
              }
              className="w-full rounded border p-2"
            />

            <label className="font-semibold">
            Audio Explanation
            </label>


            {editData.audioUrl && (

            <audio controls className="w-full">

            <source
            src={editData.audioUrl}
            type="audio/mpeg"
            />

            </audio>

            )}


            <input
            type="file"
            accept="audio/*"
            onChange={(e)=>
            handleEditUpload(e.target.files[0],"audio")
            }
            className="w-full border p-2"
            />
          <label className="font-semibold">
          Lesson Image
          </label>


          {editData.imageUrl && (

          <img
          src={editData.imageUrl}
          alt="Lesson"
          className="w-full max-h-80 object-contain rounded-lg border"
          />

          )}


          <input
          type="file"
          accept="image/*"
          onChange={(e)=>
          handleEditUpload(e.target.files[0],"image")
          }
          className="w-full border p-2"
          />
            <input
              type="text"
              value={editData.jargonInput}
              onChange={(e) =>
                setEditData({ ...editData, jargonInput: e.target.value })
              }
              className="w-full rounded border p-2"
            />

            <div className="flex gap-3">

              <button
                type="submit"
                className="rounded bg-green-600 px-4 py-2 text-white"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded bg-gray-500 px-4 py-2 text-white"
              >
                Cancel
              </button>

            </div>

          </form>

          ) : (

          <>

            {/* Audio Section */}
            <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-indigo-900">Voice Explanation</h4>
                  
                  {/* Playback Speed Buttons */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-indigo-200 w-fit">
                    <span className="text-xs font-semibold text-gray-500 px-2">Speed:</span>
                    {[1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => changeSpeed(s)}
                        className={`px-2 py-0.5 text-xs font-bold rounded transition ${
                          speed === s 
                            ? 'bg-indigo-600 text-white' 
                            : 'text-gray-600 hover:bg-indigo-100'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* HTML5 Audio Player with ref */}
                <audio 
                  key={selectedModule._id} 
                  ref={audioRef}
                  controls 
                  className="w-full mt-2"
                  onPlay={() => {
                    // When navigating to a different module or resuming playback, maintain the selected speed
                    if(audioRef.current) audioRef.current.playbackRate = speed;
                  }}
                >
                  <source 
                      src={
                      selectedModule.audioUrl 
                      ? getDirectDriveUrl(selectedModule.audioUrl)
                      : null
                      }
                      type="audio/mpeg"
                  />
                      Your browser does not support the audio element.
                </audio>
              </div>


              {/* Text Notes Section - Markdown, Images, Videos and Jargon */}
              <div className="prose max-w-none text-gray-700 leading-relaxed bg-slate-50 p-6 rounded-xl border border-gray-100">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                  // Headings
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold my-4 text-gray-900">
                      {children}
                    </h1>
                  ),

                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold my-3 text-gray-900">
                      {children}
                    </h2>
                  ),

                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold my-3 text-gray-800">
                      {children}
                    </h3>
                  ),


                  // Paragraphs + Jargon Tooltip
                  p: ({ children }) => {

                    return (
                      <p className="mb-4">
                        {typeof children === "string" ? (
                          <JargonTextFormatter
                            text={children}
                            jargonMap={selectedModule.jargon || {}}
                          />
                        ) : (
                          children
                        )}
                      </p>
                    );

                  },

                  // Images
                  img: ({ node, ...props }) => (
                  <>
                    <img
                      {...props}
                      src={getDirectDriveUrl(props.src)}
                      className="rounded-xl shadow-md max-h-96 object-contain border border-gray-200 my-4"
                      alt={props.alt || "Lesson Image"}
                    />

                    {props.alt && (
                      <span className="block text-xs text-gray-500 mt-2">
                        Image: {props.alt}
                      </span>
                    )}
                </>
              ),

                  // YouTube Embed
                  a: ({ node, ...props }) => {

                  const url = props.href || "";


                  if (
                    url.includes("youtube.com/watch") ||
                    url.includes("youtu.be")
                  ) {

                    const extractYoutubeId = (url) => {

                      const regex =
                        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/;

                      const match = url.match(regex);

                      return match ? match[1] : null;
                    };


                    const youtubeId = extractYoutubeId(url);


                    if (!youtubeId) {
                      return (
                        <a href={url}>
                          {props.children}
                        </a>
                      );
                    }


                    return (
                      <div className="my-6 aspect-video w-full rounded-xl overflow-hidden shadow-lg">

                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title="Lesson Video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />

                      </div>
                    );

                  }


                  return (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {props.children}
                    </a>
                  );
                }
                }}
                >
                  {selectedModule.textContent}
                </ReactMarkdown>
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

            </>
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