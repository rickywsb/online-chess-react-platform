import React, { useEffect, useState } from 'react';
import { getCourses } from '../../api/course';
import CourseCard from './CourseCard';
import './CoursesPage.css';

const categories = [
  { id: 'all', label: 'Popular now' },
  { id: 'openings', label: 'Openings' },
  { id: 'endgame', label: 'Endgame' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'tactics', label: 'Tactics' },
  { id: 'beginners', label: 'Beginners' }
];

const CourseList = ({ userRole, enrolledCourseIds = [] }) => {
  const [courses, setCourses] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesData = await getCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = activeCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === activeCategory);

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h1>Chess Courses</h1>
        <p>Master chess with courses from world-class instructors</p>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading courses...
        </div>
      ) : (
        <div className="course-list">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <CourseCard 
                key={course._id} 
                course={course} 
                userRole={userRole}
                isEnrolled={enrolledCourseIds.includes(course._id)}
              />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666', gridColumn: '1/-1' }}>
              No courses found in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseList;
