import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_BASE_URL; // 或您的后端服务器地址
const API_BASE_URL = `${API_BASE}/api/courses`; // You might need to adjust this based on your actual API endpoint

// Add a new course
export const addCourse = async (courseData) => {
  try {
    const response = await axios.post(API_BASE_URL, courseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all courses
export const getCourses = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get a single course by ID
export const getCourseById = async (courseId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update a course by ID
export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/${courseId}`, courseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a course by ID
export const deleteCourse = async (courseId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const enrollInCourse = async (courseId) => {
  try {
    const token = localStorage.getItem('token'); // 或者从其他地方获取令牌
    const response = await axios.post(`${API_BASE_URL}/${courseId}/enroll`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取用户已注册的课程
export const getEnrolledCourses = async (userId) => {
  try {
    const token = localStorage.getItem('token'); // 或者从其他地方获取令牌
    const response = await axios.get(`${API_BASE_URL}/user/${userId}/enrolled`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 获取特定课程的已注册学生
export const getEnrolledStudents = async (courseId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/${courseId}/enrolled-students`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
