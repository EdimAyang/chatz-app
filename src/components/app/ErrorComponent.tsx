export default function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const handleReset = () => {
    reset();
  };
  

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "24px",
        textAlign: "center",
        fontFamily:
          "Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <h1>{error.message || "An unexpected error occurred."}</h1>

      {/* <p
        style={{
          maxWidth: "500px",
          marginTop: "8px",
          color: "#666",
        }}
      >
        {error.message || "An unexpected error occurred."}
      </p> */}

      <button
        type="button"
        onClick={handleReset}
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontFamily:"inherit"
        }}
      >
        Try again
      </button>
    </div>
  );
}
