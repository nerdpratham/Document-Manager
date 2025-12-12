/* eslint-disable no-unused-vars */
import React, { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';  // Import Sidebar component
import Topbar from '../components/Topbar';
import { FaTimes } from 'react-icons/fa'
import axios from "axios"
import NoticesList from '../components/NoticeList';
import UsersList from '../components/UserList';
import Swal from 'sweetalert2';

function AdminDashboard() {
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [isOverlayModerator, setIsOverlayModerator] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [Error , setError] = useState({});
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [selectedContent, setSelectedContent] = useState(null); // State for selected content
    const navigate = useNavigate();
    const [notices, setNotices] = useState([]);
    const [userData, setUserData] = useState(null);
    const [errors , setErrors] = useState(null);
    const [allUsers , setAllUsers] = useState([]);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [successMessageNotice, setSuccessMessageNotice] = useState("");
    const [successMessageMod, setSuccessMessageMod] = useState("");
    const [pdfFile, setPdfFile] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
    
                if (!token) {
                    navigate("/login");
                    return;
                }
    
                const noticesResponse = await axios.get("https://rbac-app-9epa.onrender.com/api/v1/users/notices", {
                    headers: { Authorization: `Bearer ${token}` }
                });
    
                const userResponse = await axios.get("https://rbac-app-9epa.onrender.com/api/v1/users/userdata", {
                    headers: { Authorization: `Bearer ${token}` }
                });
    
                // Uncomment and modify if you want to fetch all users
                const allUserResponse = await axios.get("https://rbac-app-9epa.onrender.com/api/v1/admin/user-data", {
                    headers: { Authorization: `Bearer ${token}` }
                });
    
                setNotices(noticesResponse.data.notices);
                setUserData(userResponse.data.user);
                setAllUsers(allUserResponse.data.users);
    
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setErrors(error.response?.data?.error || "Failed to fetch data.");
                setIsLoading(false);
            }
        };
    
        fetchData();
    }, [navigate]); 

    const handleUnauthorized = () => {
      Swal.fire({
        title: 'Unauthorized!',
        text: 'You do not have permission to access this page.',
        icon: 'error',
        confirmButtonText: 'OK',
        background: '#f8d7da', // Light red background
        timer: 5000,  // Optional timer before auto-close (in ms)
      });
    };

//---------------------edit moderator overlay----------------------------------
  const handleClickEditModerator = () => {
    if(userData.role === "MODERATOR"){
      handleUnauthorized();
      setIsOverlayModerator(false);
    }
    else{
      setIsOverlayModerator(true);
    }
  }

  const handleCloseModerator = () => {
    setIsOverlayModerator(false);
  };
//-----------------------------------------------------------------------------
  const handleContentChange = (content) => {
    setSelectedContent(content);  // Update selected content based on button clicked
  };

//----------------- Notice publish overlay ------------------------------------
  const handleSendNoticeClick = () => {
    if(userData.role === "MODERATOR"){
      handleUnauthorized();
      setIsOverlayVisible(false);
    }
    else{
      setIsOverlayVisible(true);
    }
  };

  const handleCloseOverlay = () => {
    setIsOverlayVisible(false);
    setPdfFile(null); // Reset PDF file when closing overlay
    setTitle('Enter title');
    setBody('About');
    setError({});
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setPdfFile(null);
      setError({ ...Error, pdf: '' });
      return;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError({ ...Error, pdf: 'Please upload a PDF file only' });
      setPdfFile(null);
      e.target.value = ''; // Clear the input
      return;
    }

    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError({ ...Error, pdf: 'File size must be less than 5MB' });
      setPdfFile(null);
      e.target.value = ''; // Clear the input
      return;
    }

    // File is valid
    setPdfFile(file);
    setError({ ...Error, pdf: '' });
  };
//------------------------------------------------------------------------------
  const handleSubmitRoles = async (e) => {
    e.preventDefault();

    if(email === "" || role === ""){
        setError({
            email : email === "" ? "Enter an email address*" : "",
            role : role === "" ? "Please select a role*" : "",
        })

        return
    }

    setError({})
    setIsLoading(true);

    try{

        const token = localStorage.getItem("token");

        const response = await axios.put("https://rbac-app-9epa.onrender.com/api/v1/admin/edit-moderator" ,{
            email : email,
            role : role
        },
        {
            headers: { Authorization: `Bearer ${token}` }
        })

        if(response.status == 201){
            setSuccessMessageMod("Success")
            setIsOverlayModerator(false);
        }
    }
    catch(error){
        if (error.response && error.response.data.message) {
            setError({ message: error.response.data.message });
        } else {
            setError({ message: "Something went wrong. Please try again later." });
        }
    }finally {
      setIsLoading(false);  // Reset loading state after the request finishes
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(title === "" || body === ""){
        setError({
            title : title === "" ? "Please enter a title*" : "",
            body : body === "" ? "Please enter the body*" : "" 
        })

        return;
    }

    setError({})
    setIsLoading(true)

    try{
        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', body);
        if (pdfFile) {
          formData.append('pdf', pdfFile);
        }

        const response = await axios.post("https://rbac-app-9epa.onrender.com/api/v1/admin/create-notice",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            }
          })

        if(response.status == 201){
            setSuccessMessageNotice("Success")
            setIsOverlayVisible(false);
        }

    }catch(error){
        if (error.response && error.response.data.message) {
            setError({ message: error.response.data.message });
        } else {
            setError({ message: "Something went wrong. Please try again later." });
        }
    }finally {
      setIsLoading(false);  // Reset loading state after the request finishes
    }
  };

  if (isLoading) {
      return <div>Loading...</div>;
  }

  if (errors) {
      return <div>Error: {errors}</div>;
  }

  return (

    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        setSidebarExpanded={setIsSidebarExpanded} 
        onContentChange={handleContentChange} 
        
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarExpanded ? 'ml-64' : 'ml-16'
        }`}
      >
        <Topbar 
            handleSendNoticeClick={handleSendNoticeClick}
            userdata={userData}
            Role="ADMIN"
            handleClickEditModerator={handleClickEditModerator}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
          <div>
              <h1 className="text-2xl font-semibold text-gray-900">Welcome 👋 ,{userData.firstname} {userData.lastname}</h1>
              <p className="mt-2 text-gray-600">This is admin dashboard, navigate on the side bar to view records</p>
            </div>

            <div className="mt-6">
              {selectedContent === 'notices' && (
                <NoticesList notices={notices} />
              )}

              {selectedContent === 'users' && (
                <UsersList users={allUsers} />
              )}
            </div>
          </div>
        </main>
        </div>

      {isOverlayVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          onClick={handleCloseOverlay}
        >

          <div
            className="bg-white p-6 rounded-lg w-96 shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseOverlay}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4">Send a Notice</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
                {Error.title && <p className="italic text-red-500 text-xs">{Error.title}</p>}

              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
                {Error.body && <p className="italic text-red-500 text-xs">{Error.body}</p>}

              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">PDF Document (Optional)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    border border-gray-300 rounded-md px-3 py-2"
                />
                {pdfFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                {Error.pdf && <p className="italic text-red-500 text-xs mt-1">{Error.pdf}</p>}
                <p className="mt-1 text-xs text-gray-500">Maximum file size: 5MB</p>
              </div>
              <button
                onClick={handleSubmit}
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded"
              >
                {isLoading ? "Sending..." : "Send Notice"}
              </button>
            </form>
            {successMessageNotice && <p className="text-green-600">{successMessageNotice}</p>}
          </div>
        </div>
      )}


      {isOverlayModerator && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          onClick={handleCloseModerator}
        >
          <div
            className="bg-white p-6 rounded-lg w-96 shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModerator}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4">Assign Roles</h2>
            <form onSubmit={handleSubmitRoles}>
                <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">User Email</label>
                <input
                    type="email"
                    placeholder='Enter email id of user'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                />
                {Error.email && <p className="italic text-red-500 text-xs">{Error.email}</p>}
                </div>

                <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                >
                    <option value="">Select Role</option>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MODERATOR">Moderator</option>
                </select>
                {Error.role && <p className="italic text-red-500 text-xs">{Error.role}</p>}
                </div>

                <button
                type="submit"
                onClick={handleSubmitRoles}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded"
                >
                  {isLoading ? "Making changes..." : "Make Changes"}
                </button>

                {Error.message && <p className="mt-2 text-red-500 text-sm">{Error.message}</p>}
            </form>
            {successMessageMod && <p className="text-green-600">{successMessageMod}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
