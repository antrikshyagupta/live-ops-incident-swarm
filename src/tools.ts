/**
 * Dummy tools for the Live-Ops Incident Swarm scenario.
 * These simulate the actions the agents can take to diagnose and resolve system issues.
 */

/**
 * Simulates fetching recent error logs from the server.
 */
export async function fetchLogs(): Promise<string> {
  console.log("[Tool Execution] Fetching recent server logs...");
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return "ERROR: Connection timeout on Database Shard 3. Multiple retries failed. System latency at 5000ms.";
}

/**
 * Simulates checking system metrics like CPU and memory usage.
 */
export async function checkMetrics(): Promise<string> {
  console.log("[Tool Execution] Checking system metrics...");
  await new Promise(resolve => setTimeout(resolve, 800));
  return "CPU Usage: 98%. Memory Usage: 85%. Spike detected in DB Connection Pool.";
}

/**
 * Simulates restarting a specific service.
 * @param serviceName The name of the service to restart
 */
export async function restartService(serviceName: string): Promise<string> {
  console.log(`[Tool Execution] Restarting service: ${serviceName}...`);
  await new Promise(resolve => setTimeout(resolve, 1500));
  return `SUCCESS: Service ${serviceName} restarted successfully. Latency returning to normal.`;
}

/**
 * Simulates scaling up compute resources.
 * @param component The component to scale
 * @param instances The number of instances to add
 */
export async function scaleResources(component: string, instances: number): Promise<string> {
  console.log(`[Tool Execution] Scaling ${component} by ${instances} instances...`);
  await new Promise(resolve => setTimeout(resolve, 1200));
  return `SUCCESS: ${component} scaled by ${instances} instances. Load balancer updated.`;
}
