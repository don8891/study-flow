import { useState } from "react";
import Card from "../components/Card";
import { uploadSyllabus } from "../api/api";
import { auth } from "../firebase";

function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  async function handleUpload() {
    if (!file) {
      alert("Select a file");
      return;
    }

    const uid = auth.currentUser.uid;
    setStatus("Uploading...");

    const res = await uploadSyllabus(file, uid);

    if (res.success) {
      setStatus("Syllabus processed successfully");
      console.log(res.text); // will be used for AI
    } else {
      setStatus("Upload failed");
    }
  }

  return (
    <div className="page">
      <h2>Upload Syllabus</h2>

      <Card>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </Card>

      <button onClick={handleUpload} className="btn-sm">
        Upload & Process
      </button>

      {status && <p>{status}</p>}
    </div>
  );
}

export default Upload;
