// Feed.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Upload from "./Upload";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link } from "react-router-dom";

dayjs.extend(relativeTime);
axios.defaults.withCredentials = true;

const Feed = () => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComments, setNewComments] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  const fetchRecommendedPosts = async () => {
    try {
      const res = await axios.get("http://localhost:3001/recommended-feed");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch recommended feed:", err);
      setError("Unable to load recommended posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendedPosts();
    axios.get("http://localhost:3001/auth/me").then(res => setCurrentUser(res.data.username));

    const socket = io("http://localhost:3001", { withCredentials: true });
    socket.on("new_post", (newPost) => setPosts((prev) => [newPost, ...prev]));
    socket.on("like_update", (updatedPost) => setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))));
    socket.on("new_comment", ({ postId, comments }) => setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments } : p))));

    return () => socket.disconnect();
  }, []);

  const handleUploadSuccess = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`http://localhost:3001/posts/${postId}/like`);
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleCommentChange = (postId, value) => {
    setNewComments((prev) => ({ ...prev, [postId]: value }));
  };

  const handleAddComment = async (postId) => {
    const content = newComments[postId]?.trim();
    if (!content) return;

    try {
      const res = await axios.post(`http://localhost:3001/posts/${postId}/comment`, { text: content });
      setNewComments((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: res.data.comments } : p)));
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:3001/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error(" Failed to delete post:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Recommended for You</h2>
      <Upload onUploadSuccess={handleUploadSuccess} />
      {loading && (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status" />
          <div className="mt-2">Loading recommendations...</div>
        </div>
      )}
      {error && <p className="text-center text-danger">{error}</p>}
      {!loading && posts.length === 0 && !error && <p className="text-center text-muted">No posts found.</p>}

      {posts.map((post) => (
        <div key={post.id} className="card mb-3 shadow-sm">
          <div className="card-body">
            <p className="fw-bold">
              <Link to={`/profile/${post.username}`}>{post.username}</Link> • <small>{dayjs(post.created_at).fromNow()}</small>
            </p>
            <p>{post.text}</p>

            {Array.isArray(post.image_url) && post.image_url.map((img, idx) => (
              <img
                key={`${post.id}-${idx}`}
                src={`http://localhost:3001${img}`}
                alt={`Post ${idx}`}
                className="img-fluid rounded mt-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/fallback.jpg";
                }}
              />
            ))}

            <div className="d-flex justify-content-between align-items-center mt-3">
              <button className="btn btn-sm btn-outline-primary" onClick={() => handleLike(post.id)}> Like</button>
              <span className="text-muted">{post.likes || 0} Likes</span>
              <span className="text-muted">{post.comments?.length || 0} Comments</span>
              {currentUser === post.username && (
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(post.id)}>Delete</button>
              )}
            </div>

            <div className="mt-3">
  <h6>Comments</h6>
  {Array.isArray(post.comments) ? (
    post.comments.map((comment, idx) => (
      <div key={`comment-${post.id}-${idx}`} className="text-muted small mb-1">
        <strong>{comment.user || "Anon"}</strong>: {comment.text} {comment.time && <em>({dayjs(comment.time).fromNow()})</em>}
      </div>
    ))
  ) : (
    <p className="text-muted">No comments yet.</p>
  )}

              <div className="input-group mt-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Add a comment..."
                  value={newComments[post.id] || ""}
                  onChange={(e) => handleCommentChange(post.id, e.target.value)}
                />
                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleAddComment(post.id)}>Post</button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="text-center my-3">
          <button className="btn btn-outline-secondary" onClick={() => { const nextPage = page + 1; setPage(nextPage); fetchRecommendedPosts(); }}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Feed;
