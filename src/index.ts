import { SemanticEvent } from "@mozaik-ai/core";
import { 
    initializeRuntime, 
    SwarmRuntimeState, 
    detectiveAgent, 
    mitigatorAgent, 
    communicatorAgent, 
    humanAdmin 
} from "./agents";
import * as readline from "readline";

async function main() {
    console.log("Initializing Mozaik Runtime Environment...");
    
    // Initialize the shared runtime bus
    const runtime = initializeRuntime({
        state: new SwarmRuntimeState()
    });

    // Add all participants to the shared environment
    runtime.join(detectiveAgent);
    runtime.join(mitigatorAgent);
    runtime.join(communicatorAgent);
    runtime.join(humanAdmin);

    // Set up terminal interface for human input
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Listen for human input and broadcast it to the environment as a message event
    rl.on('line', (input) => {
        runtime.publish(SemanticEvent.create("message", humanAdmin.getId(), input));
    });

    console.log("\n=== Live-Ops Incident Swarm Started ===");
    console.log("Waiting for alerts...\n");

    // Simulate an initial outage alert being broadcast to the environment
    setTimeout(() => {
        console.log("--- SYSTEM ALERT INJECTED ---");
        runtime.publish(SemanticEvent.create("alert", "SystemMonitor", "URGENT: Database latency spiked to 5000ms"));
    }, 2000);
}

main().catch(console.error);
