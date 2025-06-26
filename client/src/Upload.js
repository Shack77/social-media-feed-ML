import React, { useState } from "react";
import axios from "axios";

const Upload = ({ onUploadSuccess }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("text", text);
    if (file) formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:3000/upload", formData);
      onUploadSuccess(res.data.post);
      setText("");
      setFile(null);
      setMessage("✅ Post uploaded!");
    } catch (err) {
      setMessage("❌ Upload failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        className="form-control mb-2"
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input
        type="file"
        className="form-control mb-2"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button className="btn btn-primary w-100">Post</button>
      {message && <div className="mt-2 text-center">{message}</div>}
    </form>
  );
};

export default Upload;
