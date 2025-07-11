import React, { useState } from "react";
import axios from "axios";

const PostForm = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const formData = new FormData();
    formData.append("text", text);
    if (file) formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:3001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // include cookie if needed
      });
      setMessage("Post created!");
      setText("");
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("Error creating post.");
    }
  };

  return (
    <div className="card p-3 mb-4">
      <form onSubmit={handleSubmit}>
        <textarea
          className="form-control mb-2"
          rows="3"
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="form-control mb-2"
        />
        <button className="btn btn-primary w-100" type="submit">Post</button>
        {message && <div className="mt-2 text-center">{message}</div>}
      </form>
    </div>
  );
};

export default PostForm;
