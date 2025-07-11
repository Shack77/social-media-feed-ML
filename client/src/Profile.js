// Profile.js
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
axios.defaults.withCredentials = true;

const Profile = () => {
  const { username } = useParams();
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const [userRes, postsRes] = await Promise.all([
          axios.get("http://localhost:3001/auth/me"),
          axios.get(`http://localhost:3001/user/${username}/posts`)
        ]);
        setCurrentUser(userRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        console.error("Failed to load profile data:", err);
      }
    };

    if (username) fetchUserPosts();
  }, [username]);

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:3001/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleEdit = (post) => {
    setEditingPostId(post.id);
    setEditText(post.text);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditText("");
  };

  const handleSaveEdit = async (postId) => {
    try {
      const res = await axios.put(`http://localhost:3001/posts/${postId}`, { text: editText });
      setPosts(prev => prev.map(p => (p.id === postId ? res.data.post : p)));
      handleCancelEdit();
    } catch (err) {
      console.error("Failed to save edit:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">👤 {username}'s Profile</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="card mb-3">
            {Array.isArray(post.image_url) && post.image_url.map((img, idx) => (
  <img
    key={idx}
    src={`http://localhost:3001${img}`}
    alt={`Post ${idx}`}
    className="img-fluid rounded mt-2"
  />
))}

            <div className="card-body">
              {editingPostId === post.id ? (
                <>
                  <textarea className="form-control mb-2" value={editText} onChange={(e) => setEditText(e.target.value)} />
                  <button className="btn btn-success btn-sm me-2" onClick={() => handleSaveEdit(post.id)}>Save</button>
                  <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <p className="card-text">{post.text}</p>
                  <small className="text-muted">{dayjs(post.created_at).fromNow()}</small>
                  <div className="mt-2">
                    <strong> {post.likes || 0} Likes</strong>
                    {post.comments && <span className="ms-3"> {post.comments.length} Comments</span>}
                  </div>
                </>
              )}
              {currentUser?.username === post.username && editingPostId !== post.id && (
                <>
                  <button className="btn btn-sm btn-outline-primary mt-3 me-2" onClick={() => handleEdit(post)}>✏️ Edit</button>
                  <button className="btn btn-sm btn-danger mt-3" onClick={() => handleDelete(post.id)}>🗑️ Delete</button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Profile;
