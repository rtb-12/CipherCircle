import { WorldMap } from "@/components/ui/world-map";
import { motion } from "framer-motion";
import { useTheme } from '@/contexts/ThemeContext';


export function WorldMapComponent() {
  const { theme } = useTheme();
  return (
    <div className="py-40 dark:bg-neutral-950 bg-white w-full">
      <div className="max-w-7xl mx-auto text-center">
        <p className="font-bold text-xl md:text-4xl dark:text-white text-black">
          Global{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {"Confidentiality".split("").map((word, idx) => (
              <motion.span
                key={idx}
                className="inline-block"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </p>
        <p className="text-sm md:text-lg text-neutral-500 max-w-2xl mx-auto py-4">
          Securely connect with clients and colleagues worldwide. CipherCircle ensures end-to-end encrypted communication, powered by blockchain technology, for unparalleled privacy and security.
        </p>
      </div>
      <WorldMap
        dots={[
          {
            start: {
              lat: 64.2008,
              lng: -149.4937,
              label: "Alaska",
            }, // Alaska (Fairbanks)
            end: {
              lat: 34.0522,
              lng: -118.2437,
              label: "Los Angeles",
            }, // Los Angeles
          },
          {
            start: { lat: 64.2008, lng: -149.4937, label: "Alaska" }, // Alaska (Fairbanks)
            end: { lat: -15.7975, lng: -47.8919, label: "Brasília" }, // Brazil (Brasília)
          },
          {
            start: { lat: -15.7975, lng: -47.8919, label: "Brasília" }, // Brazil (Brasília)
            end: { lat: 38.7223, lng: -9.1393, label: "Lisbon" }, // Lisbon
          },
          {
            start: { lat: 51.5074, lng: -0.1278, label: "London" }, // London
            end: { lat: 28.6139, lng: 77.209, label: "New Delhi" }, // New Delhi
          },
          {
            start: { lat: 28.6139, lng: 77.209, label: "New Delhi" }, // New Delhi
            end: { lat: 43.1332, lng: 131.9113, label: "Vladivostok" }, // Vladivostok
          },
          {
            start: { lat: 28.6139, lng: 77.209, label: "New Delhi" }, // New Delhi
            end: { lat: -1.2921, lng: 36.8219, label: "Nairobi" }, // Nairobi
          },
        ]}
        lineColor="#6366f1" 
         theme={theme}// Purple color matching CipherCircle branding
      />
    </div>
  );
}