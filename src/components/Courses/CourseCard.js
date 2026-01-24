import React from 'react';
import { Link } from 'react-router-dom';
import { enrollInCourse, getEnrolledStudents } from '../../api/course.js'; 
import { useState, useEffect } from 'react';
import './CourseCard.css';

const CourseCard = ({ course, onEdit, onDelete, userRole, isEnrolled }) => {
  const handleEnroll = async () => {
    try {
      await enrollInCourse(course._id);
      alert('Enrolled successfully!');
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert('Failed to enroll in course.');
    }
  };

  const [enrolledStudents, setEnrolledStudents] = useState([]);

useEffect(() => {
  const fetchEnrolledStudents = async () => {
    try {
      const students = await getEnrolledStudents(course._id);
      setEnrolledStudents(students);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
    }
  };

  fetchEnrolledStudents();
}, [course._id]);

  const canViewModules = userRole === 'admin' || userRole === 'instructor' || isEnrolled;


  return (
    <div className="course-details-container">
      {/* Course Cover Image */}
      <div className="course-image">
        {course.coverImage ? (
          <>
            <img src={course.coverImage} alt={course.title} />
            {course.category && (
              <span className="course-category-badge">{course.category}</span>
            )}
          </>
        ) : (
          <div className="course-image-placeholder">
            ♟️
            {course.category && (
              <span className="course-category-badge">{course.category}</span>
            )}
          </div>
        )}
      </div>
      
      {/* Card Content */}
      <div className="course-card-content">
        <h3 className="course-title">{course.title}</h3>
        {course.authorName && (
          <p className="course-author">by <span>{course.authorName}</span></p>
        )}
        <p className="course-subtitle">{course.description}</p>
      </div>
      
      <div className="course-footer">
        <span className="course-price">
          {course.price === 0 ? 'Free' : `$${course.price}`}
        </span>

         {/* 显示查看模块按钮 */}
         {canViewModules && (
  <div className="course-enrollment-status centered-link">
    <Link to={`/courses/${course._id}/modules`} className="view-modules-button">
      📚 View Modules
    </Link>
    <p className="enrollment-notice">Enrolled</p>
  </div>
)}

{/* Enrollment button for students */}
{userRole === 'student' && !isEnrolled && (
  <button className="enroll-button" onClick={handleEnroll}>Enroll Now</button>
)}

{/* Edit and Delete buttons for instructors and admins */}
{(userRole === 'instructor' || userRole === 'admin') && (
  <div className="edit-delete-buttons">
    <button className="edit-button" onClick={() => onEdit(course)}>Edit</button>
    <button className="delete-button" onClick={() => onDelete(course._id)}>Delete</button>
  </div>
)}
      </div>
      {enrolledStudents.length > 0 && (
      <div className="enrolled-students">
        <h4>Coursemates</h4>
        <ul>
          {enrolledStudents.slice(0, 5).map(student => (
            <li key={student._id}>
              <Link to={`/profile/${student._id}`}>{student.username}</Link>
            </li>
          ))}
          {enrolledStudents.length > 5 && (
            <li><span>+{enrolledStudents.length - 5} more</span></li>
          )}
        </ul>
      </div>
      )}
    </div>
  );
};

export default CourseCard;