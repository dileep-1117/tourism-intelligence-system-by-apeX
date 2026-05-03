import { useState } from "react";
import Globe from "../components/Globe";
import ControlPanel from "../components/ControlPanel";

function Home() {
  // 🔥 SINGLE SOURCE OF TRUTH
  const [month, setMonth] = useState("Jan");

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>

      {/* 🌍 Globe (updates when month changes) */}
      <Globe month={month} />

      {/* 🎛 Control Panel */}
      <div
        style={{
          position: "absolute",
          right: 20,
          top: 20,
          width: "320px",
          zIndex: 10,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(10px)",
          padding: "20px",
          borderRadius: "16px",
          color: "white"
        }}
      >
        <ControlPanel month={month} setMonth={setMonth} />
      </div>

    </div>
  );
}

export default Home;