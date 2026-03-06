import UploadForm from "./components/UploadForm";

export default function Page() {
  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 16 }}>Upload Video</h2>
      <UploadForm />
    </div>
  );
}

