# Installation Guide

This guide describes the steps to set up and run **CipherCircle** — the decentralized legal communication platform built with Calimero and ICP.

---

## Prerequisites


- **Node.js & pnpm:** Make sure you have Node.js (v14+) installed and install pnpm globally:
  
  ```sh
  npm install -g pnpm
  ```
- **Rust Toolchain:** Required for building the backend. Install via [rustup](https://rustup.rs/).
- **ICP Setup:** Ensure you have an ICP configured.
- **Git:** For cloning the repository.
- **Calimero:** Set up a Calimero node.

---

## Step 1: Clone the Repository

Open your terminal and run:

```sh
git clone https://github.com/your-repo/ciphercircle.git
cd ciphercircle
```

---

## Step 2: Install Frontend Dependencies

Navigate to the app directory and install the dependencies:

```sh
cd app
# Using pnpm 
pnpm install
```

---

## Step 3: Run the Frontend Application in Development Mode

Start the development server:

```sh
# Using pnpm
pnpm dev
```

The app will start at [http://localhost:5173](http://localhost:5173).

---

## Step 4: Install and Build the Backend (Logic)

Navigate to the logic directory to install Rust dependencies and build the backend:

```sh
cd ../logic
# Ensure the build script is executable (if required)
chmod +x build.sh
./build.sh
```

This script compiles the Rust components and prepares the backend for deployment.

Then follow the steps on how to create a context with Calimero:  
[Calimero Context Tutorial](https://calimero-network.github.io/tutorials/create-context/)

---

## Step 5: Setting Up ICP Backend Canister

Clone the ICP canister repository:

```sh
git clone https://github.com/rtb-12/CipherCircleICP-Canister.git
```

Ensure `dfx` is installed and set up by following the instructions here:  
[ICP DFX Installation](https://internetcomputer.org/docs/current/developer-docs/getting-started/install)

Then, start the dfx environment with a clean slate and deploy the canister:

```sh
dfx start --clean --background
dfx deploy
```

---
