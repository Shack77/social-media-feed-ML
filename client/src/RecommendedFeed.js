import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
axios.defaults.withCredentials = true;

const RecommendedFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await axios.get("http://localhost:3001/recommended-feed");
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to fetch recommended feed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommended();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Recommended for You</h2>
      {loading && <p className="text-center">Loading recommendations...</p>}
      {posts.map((post) => (
        <div key={post.id} className="card mb-3">
          <div className="card-body">
            <p className="fw-bold">
              <Link to={`/profile/${post.username}`}>{post.username}</Link> • <small>{dayjs(post.created_at).fromNow()}</small>
            </p>
            <p>{post.text}</p>
            {post.image_url.map((img, idx) => (
              <img
                key={idx}
                src={`http://localhost:3001${img}`}
                alt="Post"
                className="img-fluid rounded mb-2"
              />
            ))}
            <div className="text-muted">{post.likes || 0} Likes •  {post.comments || 0} Comments</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendedFeed;
