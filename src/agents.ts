import { 
    createAgent, 
    createHuman,
    SemanticEvent, 
    SituationSpecification, 
    SituationContext, 
    Participant 
} from "@mozaik-ai/core";
import { fetchLogs, checkMetrics, restartService, scaleResources } from "./tools";

// Utility to match events easily
export class EventMatcher extends SituationSpecification {
    constructor(private condition: (event: SemanticEvent) => boolean) {
        super();
    }
    isSatisfiedBy(context: SituationContext): boolean {
        return this.condition(context.event);
    }
}

// In Mozaik v4, we define our runtime so we can resolve it to publish events
import { defineRuntime, RuntimeState } from "@mozaik-ai/core";
export class SwarmRuntimeState extends RuntimeState {}
export const { initializeRuntime, resolveRuntime, join } = defineRuntime<SwarmRuntimeState>();

// Reusable publish helper
const publishMessage = (producerId: string, content: string) => {
    resolveRuntime().publish(SemanticEvent.create("message", producerId, content));
}

/**
 * The Detective Agent
 */
export const detectiveAgent = createAgent({
    name: "The Detective",
    capabilities: ["Log & Metric Analyzer"],
    instruction: "You analyze system alerts, fetch logs, and check metrics to identify the root cause of outages.",
    tools: [],
    handlers: [
        {
            specification: new EventMatcher(e => e.type === "alert" && typeof e.payload === "string" && e.payload.includes("URGENT:")),
            processor: {
                apply: async (ctx) => {
                    console.log(`\n[${ctx.participant.getManifest().name}] I see an alert. Investigating...`);
                    
                    const logs = await fetchLogs();
                    const metrics = await checkMetrics();

                    const findings = `Findings from logs: ${logs}\nFindings from metrics: ${metrics}\nI suspect the database is overwhelmed and might need a restart or scaling.`;
                    publishMessage(ctx.participant.getId(), findings);
                }
            }
        }
    ]
});

/**
 * The Mitigator Agent
 */
export const mitigatorAgent = createAgent({
    name: "The Mitigator",
    capabilities: ["System Engineer"],
    instruction: "You propose solutions to outages based on findings, and execute tools when the human approves.",
    tools: [],
    handlers: [
        {
            specification: new EventMatcher(e => e.type === "message" && e.producerId === detectiveAgent.getId() && typeof e.payload === "string" && e.payload.includes("Findings from")),
            processor: {
                apply: async (ctx) => {
                    console.log(`\n[${ctx.participant.getManifest().name}] Analyzing findings and proposing a solution...`);
                    const proposal = `Based on the Detective's analysis, we have high CPU usage and DB connection timeouts. I propose we restart the database service. Human, do you approve this action? (Reply 'approve' to proceed)`;
                    publishMessage(ctx.participant.getId(), proposal);
                }
            }
        },
        {
            specification: new EventMatcher(e => e.type === "message" && e.producerId === "human-admin" && typeof e.payload === "string" && e.payload.toLowerCase().includes("approve")),
            processor: {
                apply: async (ctx) => {
                    console.log(`\n[${ctx.participant.getManifest().name}] Approval received. Executing mitigation...`);
                    const result = await restartService("database");
                    publishMessage(ctx.participant.getId(), `Action completed. Result: SUCCESS - ${result}`);
                }
            }
        }
    ]
});

/**
 * The Communicator Agent
 */
export const communicatorAgent = createAgent({
    name: "The Communicator",
    capabilities: ["PR & Updates"],
    instruction: "You listen to the incident resolution process and draft customer-facing status updates.",
    tools: [],
    handlers: [
        {
            specification: new EventMatcher(e => e.type === "message" && e.producerId === mitigatorAgent.getId() && typeof e.payload === "string" && e.payload.includes("Action completed. Result: SUCCESS")),
            processor: {
                apply: async (ctx) => {
                    console.log(`\n[${ctx.participant.getManifest().name}] Issue resolved. Drafting public status update...`);
                    
                    const draft = `
*** PUBLIC STATUS PAGE UPDATE DRAFT ***
Incident: Database Latency Spike
Status: Resolved
Summary: We detected a latency spike in our database systems causing connection timeouts. Our automated systems and engineers identified high CPU usage. The database service was successfully restarted, and all systems are returning to normal operations. We apologize for the inconvenience.
***************************************
`;
                    publishMessage(ctx.participant.getId(), draft);
                }
            }
        }
    ]
});

/**
 * Human Participant
 */
export const humanAdmin = createHuman({
    name: "Human Administrator",
    capabilities: ["System Administrator"],
    handlers: [
        {
            // Human prints out messages meant for them to see the swarm communicating
            specification: new EventMatcher(e => e.type === "message"),
            processor: {
                apply: (ctx) => {
                    const producerName = resolveRuntime().getParticipant(ctx.event.producerId)?.getManifest().name || ctx.event.producerId;
                    // Don't echo our own messages
                    if (producerName !== ctx.participant.getManifest().name) {
                        console.log(`\n>>> Message from ${producerName}: ${ctx.event.payload}`);
                    }
                }
            }
        },
        {
            specification: new EventMatcher(e => e.type === "alert"),
            processor: {
                apply: (ctx) => {
                    console.log(`\n>>> ALERT: ${ctx.event.payload}`);
                }
            }
        }
    ]
});
// Override ID so it matches what we look for in Mitigator
Object.defineProperty(humanAdmin, 'getId', { value: () => "human-admin" });
