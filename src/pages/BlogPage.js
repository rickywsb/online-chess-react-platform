import React from 'react';
import './BlogPage.css'; // Import the CSS file here

const BlogPage = () => {
  const blogs = [
    {
      title: "Sibo Wu: A Chess Master's Journey",
      description: "An exclusive exhibition showcasing the achievements of International Chess Master, National Master, and FIDE Instructor Sibo Wu.",
      date: "September 18-19, 2024",
      author: "Sibo Wu",
      image: "https://drive.google.com/file/d/1RWTpOMDukTbpxdLVeB7RbwZu0pPNGkv4/view?usp=sharing",
      content: "This exhibition will highlight the remarkable career of Sibo Wu, featuring his awards, signed chess sets, and notable media publications. It is a great opportunity to learn about his contributions to the chess world and to see memorabilia from his chess journey. The exhibition will take place at Xidian Memory, Building 4, Yuhe Tower, Chaoyang District, Beijing."
    },
    {
      title: "Awards and Recognitions of Sibo Wu",
      description: "A collection of awards earned by Sibo Wu during his illustrious chess career.",
      date: "September 18-19, 2024",
      author: "Sibo Wu",
      image: "https://drive.google.com/file/d/18gnIG6H4HO1x1SfoEKJWykUmMhxKQY7w/view?usp=sharing",
      content: "Visitors can explore a curated display of Sibo Wu's numerous awards and trophies, recognizing his accomplishments both as a player and a coach. His achievements reflect years of dedication to mastering the game of chess."
    },
    {
      title: "Media Features and Publications",
      description: "Explore media coverage and articles about Sibo Wu's contributions to the world of chess.",
      date: "September 18-19, 2024",
      author: "Sibo Wu",
      image: "https://drive.google.com/file/d/1a6CYRnIiAcSv9vGB6mHeUbNI2xtJx2v2/view?usp=sharing",
      content: "The exhibition includes a section devoted to media features that chronicle Sibo Wu's career, including interviews and articles from major chess publications. These materials provide insight into how his work has been recognized in the chess community."
    },
    {
      title: "Chess Sets and Memorabilia",
      description: "An exclusive look at Sibo Wu's personal chess sets and signed memorabilia.",
      date: "September 18-19, 2024",
      author: "Sibo Wu",
      image: "https://github.com/rickywsb/online-chess-react-platform/blob/master/src/images/1.png",
      content: "This section of the exhibition features Sibo Wu's personal collection of signed chess sets and memorabilia, giving visitors a chance to connect with the physical artifacts that represent key moments in his chess journey."
    }
  ];

  return (
    <div className="blog-container">
      <h1>Exhibition</h1>
      <p>Welcome to the exclusive exhibition of Sibo Wu's chess career and achievements!</p>
      <div>
        {blogs.map((blog, index) => (
          <div key={index} className="blog-post">
            <h2>{blog.title}</h2>
            <img src={blog.image} alt={blog.title} />
            <p><em>Exhibition Date: {blog.date}</em></p>
            <p><em>Organized by: {blog.author}</em></p>
            <p>{blog.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
