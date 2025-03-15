import React, { useState } from "react";
import EnrollmentPage from "./EnrollmentPage";
import CompletionPage from "./CompletionPage";
import "./styles.css";

function App() {
  const [activeTab, setActiveTab] = useState("enrollment");

  return (
    <div className="container">
      <nav className="navbar">
        <button 
          className={activeTab === "enrollment" ? "active" : ""}
          onClick={() => setActiveTab("enrollment")}
        >
          Enrollment
        </button>
        <button
          className={activeTab === "completion" ? "active" : ""}
          onClick={() => setActiveTab("completion")}
        >
          Course Completion
        </button>
      </nav>

      <br></br>
      <hr></hr>

      {activeTab === "enrollment" ? <EnrollmentPage /> : <CompletionPage />}

     

    </div>
  );
}

export default App;
