# The Live-Ops Incident Swarm

A concurrent incident response room built with the Mozaik framework.

## The Concept
Traditional multi-agent systems often rely on rigid, sequential pipelines or central orchestrators to pass data back and forth. **The Live-Ops Incident Swarm** takes a different approach by leveraging **Mozaik's** core philosophy: event-driven concurrency via a shared broadcast bus.

In this system, all participants (Humans, Agents, Tools) join a shared `AgenticEnvironment`. Context items (messages, alerts, logs) are streamed to all participants concurrently. Each agent independently decides when and how to react using an `onContextItem` callback, resulting in a swarm of specialized agents working in tandem rather than waiting in line.

## The Swarm
When a simulated server outage occurs, three specialized AI agents enter the environment:
1. **The Detective (Log & Metric Analyzer):** Reacts to urgent system alerts, fetches logs, checks metrics, and broadcasts its findings.
2. **The Mitigator (System Engineer):** Listens for findings from the Detective, proposes solutions, and waits for a human to approve the action. Once approved, it executes the necessary tools.
3. **The Communicator (PR & Updates):** Concurrently listens to the entire chatter and automatically drafts customer-facing status updates when the issue is resolved.

## Getting Started

### Prerequisites
- Node.js (v18+)
- TypeScript

### Installation
1. Clone this repository.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Simulation
To start the incident swarm and trigger the simulated server outage, run:
```bash
npm start
```

### How to Interact
Once the simulation starts:
1. The environment will broadcast an `URGENT` system alert.
2. The Detective will investigate and report findings.
3. The Mitigator will propose a solution and ask for your approval.
4. Type `approve` into the terminal and press Enter.
5. The Mitigator will execute the tool, and the Communicator will immediately draft a public status update.

## License
MIT
