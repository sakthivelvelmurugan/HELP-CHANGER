import React from "react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

const formatPostedTime = (createdAt) => {
  const createdTime = new Date(createdAt).getTime();

  if (Number.isNaN(createdTime)) {
    return "Posted recently";
  }

  const elapsedHours = Math.max(1, Math.floor((Date.now() - createdTime) / (1000 * 60 * 60)));

  if (elapsedHours < 24) {
    return `Posted ${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `Posted ${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
};

const getStatusLabelClass = (status) => {
  if (status === "accepted") return "status-badge status-accepted";
  if (status === "completed") return "status-badge status-completed";
  return "status-badge status-open";
};

function HomePage() {
  const [helpRequests, setHelpRequests] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadHelpRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/requests`);
      const body = await response.json();

      if (!response.ok) {
        setErrorMessage(body.message || "Could not load requests");
        return;
      }

      setErrorMessage("");
      setHelpRequests(Array.isArray(body.data) ? body.data : []);
    } catch (error) {
      setErrorMessage("Unable to reach server");
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadHelpRequests();
  }, []);

  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!title.trim() || !description.trim()) {
      setErrorMessage("Please fill title and description");
      return;
    }

    try {
      setIsFormSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          location: location.trim()
        })
      });

      const body = await response.json();

      if (!response.ok) {
        setErrorMessage(body.message || "Could not create request");
        return;
      }

      setTitle("");
      setDescription("");
      setLocation("");
      setSuccessMessage("Request posted successfully");
      loadHelpRequests();
    } catch (error) {
      setErrorMessage("Unable to reach server");
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleStatusChange = async (requestId, action) => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      setActiveRequestId(requestId);

      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/${action}`, {
        method: "PATCH"
      });

      const body = await response.json();

      if (!response.ok) {
        setErrorMessage(body.message || "Could not update request");
        return;
      }

      setSuccessMessage(action === "accept" ? "Request accepted" : "Request marked as completed");
      loadHelpRequests();
    } catch (error) {
      setErrorMessage("Unable to reach server");
    } finally {
      setActiveRequestId("");
    }
  };

  return (
    <section>
      <header className="page-header">
        <h1 className="home-title">Help Requests</h1>
        <p className="home-subtitle">Post a request or support someone nearby.</p>
      </header>

      <form className="request-form" onSubmit={handleRequestSubmit}>
        <h2>Add Request</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <textarea
          rows={4}
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <input
          type="text"
          placeholder="Location (optional)"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
        <button type="submit" className="help-button" disabled={isFormSubmitting}>
          {isFormSubmitting ? "Posting request..." : "Post request"}
        </button>
      </form>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="form-error">{errorMessage}</p>}

      {isInitialLoading ? (
        <p className="state-message">Loading requests...</p>
      ) : helpRequests.length === 0 ? (
        <div className="empty-state">
          <h3>No requests yet</h3>
          <p>Be the first one to post a help request.</p>
        </div>
      ) : (
        <div className="request-grid">
          {helpRequests.map((helpRequest) => (
            <article className="request-card" key={helpRequest._id}>
              <div className="request-top">
                <h2>{helpRequest.title}</h2>
                <span className={getStatusLabelClass(helpRequest.status)}>{helpRequest.status}</span>
              </div>

              <p className="request-description">{helpRequest.description}</p>

              <div className="request-meta">
                <p className="request-location">Location: {helpRequest.location || "Not shared"}</p>
                <p className="request-time">{formatPostedTime(helpRequest.createdAt)}</p>
              </div>

              {helpRequest.status === "open" && (
                <button
                  type="button"
                  className="help-button"
                  onClick={() => handleStatusChange(helpRequest._id, "accept")}
                  disabled={activeRequestId === helpRequest._id}
                >
                  {activeRequestId === helpRequest._id ? "Accepting..." : "I can help"}
                </button>
              )}

              {helpRequest.status === "accepted" && (
                <button
                  type="button"
                  className="help-button"
                  onClick={() => handleStatusChange(helpRequest._id, "complete")}
                  disabled={activeRequestId === helpRequest._id}
                >
                  {activeRequestId === helpRequest._id ? "Completing..." : "Mark as completed"}
                </button>
              )}

              {helpRequest.status === "completed" && (
                <button type="button" className="help-button" disabled>
                  Completed
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default HomePage;



