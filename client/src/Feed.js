import React, { useEffect, useState } from "react";
import axios from "axios";
import Upload from "./Upload";

const Feed = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const res = await axios.get("http://localhost:5000/posts");
    setPosts(res.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUploadSuccess = (newPost) => {
    setPosts([newPost, ...posts]); // Add new post to top
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📰 Your Feed</h2>
      <Upload onUploadSuccess={handleUploadSuccess} />

      {posts.map((post, index) => (
        <div key={index} className="card mb-3 shadow-sm">
          <div className="card-body">
            <p>{post.text}</p>
            {post.image && (
              <img
                src={`http://localhost:3000${post.image}`}
                alt="Post"
                className="img-fluid rounded"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Feed;
