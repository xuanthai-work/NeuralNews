import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export const maxDuration = 300; // 5 minutes timeout

export async function POST() {
  return new Promise<NextResponse>((resolve) => {
    const scraperPath = path.join(process.cwd(), "scraper.py");

    // Load .env file if it exists
    const envPath = path.join(process.cwd(), ".env");
    let envConfig: Record<string, string> = {};

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      envContent.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.trim().split("=");
        if (key && valueParts.length > 0) {
          envConfig[key.trim()] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        }
      });
    }

    const env = {
      ...process.env,
      AZURE_OPENAI_ENDPOINT: envConfig.AZURE_OPENAI_ENDPOINT || "",
      AZURE_OPENAI_API_KEY: envConfig.AZURE_OPENAI_API_KEY || "",
      AZURE_OPENAI_DEPLOYMENT: envConfig.AZURE_OPENAI_DEPLOYMENT || "gpt-35-turbo",
    };

    const pythonProcess = spawn("python3", [scraperPath], { env });

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
      console.log(`Scraper: ${data}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.error(`Scraper error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(`Scraper exited with code ${code}: ${errorOutput}`);
        resolve(
          NextResponse.json(
            {
              success: false,
              error: `Scraper failed with code ${code}: ${errorOutput.slice(0, 500)}`,
            },
            { status: 500 }
          )
        );
        return;
      }

      try {
        // Read the generated data.json
        const dataPath = path.join(process.cwd(), "data.json");
        if (!fs.existsSync(dataPath)) {
          throw new Error("data.json was not created by scraper");
        }

        const data = fs.readFileSync(dataPath, "utf-8");
        const jsonData = JSON.parse(data);

        // Copy to public folder for frontend access
        const publicDataPath = path.join(process.cwd(), "public", "data.json");
        fs.writeFileSync(publicDataPath, data);

        console.log(`Successfully scraped ${jsonData.total_stories} stories`);

        resolve(
          NextResponse.json({
            success: true,
            message: `Successfully scraped ${jsonData.total_stories} stories from ${jsonData.sources?.length || 0} sources`,
            data: jsonData,
          })
        );
      } catch (err) {
        console.error("Post-processing error:", err);
        resolve(
          NextResponse.json(
            {
              success: false,
              error: err instanceof Error ? err.message : "Failed to process scraped data",
            },
            { status: 500 }
          )
        );
      }
    });

    pythonProcess.on("error", (err) => {
      console.error("Failed to start scraper:", err);
      resolve(
        NextResponse.json(
          {
            success: false,
            error: `Failed to start scraper: ${err.message}`,
          },
          { status: 500 }
        )
      );
    });
  });
}
