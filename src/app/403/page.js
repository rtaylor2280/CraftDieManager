export default function AccessDenied() {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>403 - Access Denied</h1>
        <p>You do not have permission to view this page.</p>
        <a href="/" style={{ color: "blue", textDecoration: "underline" }}>
          Return to Homepage
        </a>
      </div>
    );
  }