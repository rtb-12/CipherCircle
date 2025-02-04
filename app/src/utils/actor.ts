// src/actor.js
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "@/declarations/CipherCircleCanister_backend/CipherCircleCanister_backend.did.js";

// Use the canister ID provided by your local deployment.
const canisterId = "bkyz2-fmaaa-aaaaa-qaaaq-cai";

// Create an agent instance using the local replica endpoint.
// Note: dfx deploy shows the host as 127.0.0.1:4943.
const agent = new HttpAgent({
  host: "http://127.0.0.1:4943",
});

// In local development, you need to fetch the root key so that the agent can verify certificates.
agent.fetchRootKey().catch((err) => {
  console.warn("Unable to fetch root key. Make sure your local replica is running.", err);
});

// Create an actor using your canister’s candid interface.
export const ollamaActor = Actor.createActor(idlFactory, {
  agent,
  canisterId,
});
