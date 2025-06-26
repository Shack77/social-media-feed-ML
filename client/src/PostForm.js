import React, { useState } from "react";
import axios from "axios";

const PostForm = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      const res = await axios.post("http://localhost:3s000/api/posts/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ Post created!");
      setContent("");
      setImage(null);
    } catch (err) {
      setMessage("❌ Error creating post.");
    }
  };

  return (
    <div className="card p-3 mb-4">
      <form onSubmit={handleSubmit}>
        <textarea
          className="form-control mb-2"
          rows="3"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="form-control mb-2"
        />
        <button className="btn btn-primary w-100" type="submit">Post</button>
        {message && <div className="mt-2 text-center">{message}</div>}
      </form>
    </div>
  );
};

export default PostForm;
