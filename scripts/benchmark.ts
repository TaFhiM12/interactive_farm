import autocannon from "autocannon";
import { writeFile } from "fs/promises";

async function runBenchmark() {
  const result = await autocannon({
    url: "http://localhost:5000/api/v1/health",
    connections: 20,
    duration: 10,
  });

  const report = [
    "# API Benchmark Report",
    "",
    `Date: ${new Date().toISOString()}`,
    "",
    "## Target Endpoint",
    "- GET /api/v1/health",
    "",
    "## Results",
    `- Average Latency: ${result.latency.average.toFixed(2)} ms`,
    `- Requests/Sec: ${result.requests.average.toFixed(2)}`,
    `- Throughput (bytes/sec): ${result.throughput.average.toFixed(2)}`,
  ].join("\n");

  await writeFile("docs/benchmark-report.md", `${report}\n`, "utf-8");

  console.log(report);
  console.log("\nBenchmark report written to docs/benchmark-report.md");
}

void runBenchmark();
