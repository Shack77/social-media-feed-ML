import React, { useState, useRef } from "react";
import axios from "axios";

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "video/mp4", "application/pdf"];

const Upload = ({ onUploadSuccess }) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const resetForm = () => {
    setText("");
    setFiles([]);
    setMessage("");
  };

  const validateFiles = (fileList) => {
    const validFiles = [];
    for (let file of fileList) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setMessage("Only JPG, PNG, MP4, and PDF files are allowed.");
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setMessage(` ${file.name} exceeds 10MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }
    return validFiles;
  };

  const handleFileChange = (e) => {
    const valid = validateFiles([...e.target.files]);
    setFiles(valid);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const valid = validateFiles([...e.dataTransfer.files]);
    setFiles(valid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) {
      setMessage("Post must have text or at least one file.");
      return;
    }

    const formData = new FormData();
    formData.append("text", text);
    for (let file of files) {
      formData.append("files", file);
    }

    try {
      const res = await axios.post("http://localhost:3001/upload", formData);
      onUploadSuccess(res.data.post);
      resetForm();
      setMessage("Post uploaded!");
    } catch (err) {
      console.error("Upload failed", err);
      setMessage("Upload failed");
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

      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current.click()}
        className={`p-3 border rounded mb-2 text-center ${dragOver ? "bg-light" : ""}`}
        style={{ cursor: "pointer" }}
      >
        {files.length === 0
          ? "Drag & drop files here or click to browse"
          : `${files.length} valid file(s) selected`}
      </div>

      <input
        type="file"
        className="d-none"
        ref={fileInputRef}
        multiple
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
      />

      {files.length > 0 && (
        <div className="mb-2 d-flex flex-wrap gap-2">
          {files.map((file, idx) => {
            const fileURL = URL.createObjectURL(file);
            if (file.type.startsWith("image")) {
              return (
                <img
                  key={idx}
                  src={fileURL}
                  alt={`Preview ${idx}`}
                  style={{
                    height: "100px",
                    width: "auto",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
              );
            } else if (file.type.startsWith("video")) {
              return (
                <video key={idx} src={fileURL} controls style={{ height: "100px" }} />
              );
            } else {
              return (
                <a key={idx} href={fileURL} target="_blank" rel="noopener noreferrer">
                {file.name}
                </a>
              );
            }
          })}
        </div>
      )}

      <div className="d-flex justify-content-between">
        <button type="submit" className="btn btn-primary w-75">
          Post
        </button>
        <button type="button" className="btn btn-secondary w-25 ms-2" onClick={resetForm}>
          Clear
        </button>
      </div>

      {message && <div className="mt-2 text-center text-muted">{message}</div>}
    </form>
  );
};

export default Upload;
