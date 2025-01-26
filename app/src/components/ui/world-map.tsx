import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
  theme?: "light" | "dark"; // Theme as a prop
}

export function WorldMap({
  dots = [],
  lineColor = "#0ea5e9",
  theme = "light",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgMap, setSvgMap] = useState<string>("");

  // Regenerate the map when theme changes
  useEffect(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" });
    const svg = map.getSVG({
      radius: 0.22,
      color: theme === "dark" ? "#FFFFFF20" : "#00000020", // Adjusted opacity for better contrast
      shape: "circle",
      backgroundColor: "transparent", // Make background transparent to use CSS background
    });
    setSvgMap(svg);
  }, [theme]);

  // Project latitude/longitude to SVG coordinates
  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  // Create a curved SVG path between two points
  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  if (!svgMap) return null; // Don't render until the SVG map is ready

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "2/1",
        backgroundColor: theme === "dark" ? "black" : "white",
        borderRadius: "8px",
        position: "relative",
        fontFamily: "sans-serif",
      }}
    >
      {/* Background Map Image */}
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        alt="world map"
        style={{
          width: "100%",
          height: "100%",
          maskImage:
            "linear-gradient(to bottom, transparent, white 10%, white 90%, transparent)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* SVG Overlay for Connections and Dots */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {/* Gradient Definition for Paths */}
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Render Connections */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);

          return (
            <React.Fragment key={`connection-${i}`}>
              {/* Animated Path */}
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 * i, ease: "easeOut" }}
              />

              {/* Start Point */}
              <circle
                cx={startPoint.x}
                cy={startPoint.y}
                r="2"
                fill={lineColor}
              />
              <circle
                cx={startPoint.x}
                cy={startPoint.y}
                r="2"
                fill={lineColor}
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  from="2"
                  to="8"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.5"
                  to="0"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* End Point */}
              <circle
                cx={endPoint.x}
                cy={endPoint.y}
                r="2"
                fill={lineColor}
              />
              <circle
                cx={endPoint.x}
                cy={endPoint.y}
                r="2"
                fill={lineColor}
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  from="2"
                  to="8"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.5"
                  to="0"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
}