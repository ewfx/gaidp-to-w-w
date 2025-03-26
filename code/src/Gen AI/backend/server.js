const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const OpenAI = require("openai");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const pdf = require("pdf-parse");
const csv = require("csv-parse");
const Joi = require("joi");
const axios = require("axios"); // Add axios for API calls

const app = express();
const port = 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000", 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
const upload = multer({ dest: "uploads/" });

// OpenAI and Grok configuration
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

const grokApi = axios.create({
  baseURL: "https://api.x.ai/v1",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer "
  }
});

// SQLite database setup remains the same
// SQLite database setup
const db = new sqlite3.Database("./rules.db", (err) => {
  if (err) console.error("Error opening database:", err.message);
  else {
    console.log("Connected to SQLite database.");
    // Create the table with all required columns
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS rules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          confidence REAL NOT NULL,
          status TEXT DEFAULT 'pending',
          crossValidated INTEGER DEFAULT 0,
          discrepancies TEXT
        )
      `, (err) => {
        if (err) console.error("Error creating table:", err.message);
      });

      // Verify the table structure by adding missing columns if they don't exist
      db.run(` 
        ALTER TABLE rules ADD COLUMN crossValidated INTEGER DEFAULT 0
      `, (err) => {
        if (err && !err.message.includes("duplicate column name")) {
          console.error("Error adding crossValidated column:", err.message);
        }
      });

      db.run(`
        ALTER TABLE rules ADD COLUMN discrepancies TEXT
      `, (err) => {
        if (err && !err.message.includes("duplicate column name")) {
          console.error("Error adding discrepancies column:", err.message);
        }
      });
    });
  }
});

// Rule validation schema and validateRule function remain the same
const ruleSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  confidence: Joi.number().min(0).max(100).required(),
  constraints: Joi.object({
    allowedValues: Joi.array().items(Joi.string()).optional(),
    format: Joi.string().optional(),
  }).optional(),
});

function validateRule(rule) {
  const { error } = ruleSchema.validate(rule);
  return error ? error.details : null;
}

async function extractTextFromFile(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdf(dataBuffer);
  return pdfData.text;
}

function safeParseJSON(jsonString) {
  try {
    const cleanJson = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    return parsed.rules || (Array.isArray(parsed) ? parsed : [parsed]);
  } catch (error) {
    console.error("JSON Parsing Error:", error);
    return [];
  }
}

function crossValidateRules(openaiRules, grokRules) {
  const validatedRules = [];
  openaiRules.forEach((openaiRule) => {
    const grokMatch = grokRules.find((gr) => gr.title === openaiRule.title);
    if (grokMatch) {
      const discrepancies = [];
      if (openaiRule.description !== grokMatch.description) {
        discrepancies.push(`Description mismatch: OpenAI="${openaiRule.description}", Grok="${grokMatch.description}"`);
      }
      if (openaiRule.category !== grokMatch.category) {
        discrepancies.push(`Category mismatch: OpenAI="${openaiRule.category}", Grok="${grokMatch.category}"`);
      }
      validatedRules.push({
        ...openaiRule,
        crossValidated: discrepancies.length === 0 ? 1 : 0,
        discrepancies: discrepancies.length > 0 ? JSON.stringify(discrepancies) : null,
        confidence: Math.min(openaiRule.confidence, grokMatch.confidence),
      });
    } else {
      validatedRules.push({ ...openaiRule, crossValidated: 0, discrepancies: JSON.stringify(["No match in Grok"]) });
    }
  });
  return validatedRules;
}

app.post("/api/upload-document", upload.single("document"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const documentText = await extractTextFromFile(filePath);

    if (!documentText.trim()) {
      return res.status(400).json({ error: "No text extracted" });
    }

    const prompt = `You are an expert in banking regulatory compliance, specializing in ASC 815 hedging rules. Extract compliance rules from the following document text, focusing on tables.

    Format requirements:
    - Return a "rules" array.
    - Each rule must have:
      * title: "Field Name" from the table.
      * description: "Description" column, summarized if needed.
      * category: Infer from context (default "Hedging").
      * confidence: Number 0-100.
      * constraints: Object with "allowedValues" (from "Allowable Values") and "format" if applicable.

    Document text:
    ${documentText}`;

    // Grok API call
    const grokResponse = await grokApi.post("/chat/completions", {
      messages: [
        {
          role: "system",
          content: "You are an expert in banking regulatory compliance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "grok-2-latest",
      stream: false,
      temperature: 0
    });
    const grokRules = safeParseJSON(grokResponse.data.choices[0].message.content);

    //print the response
    console.log(grokRules);

    // OpenAI API call
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
    });
    const openaiRules = safeParseJSON(openaiResponse.choices[0].message.content);

    //print the response
    console.log(openaiRules);  

    const validatedRules = crossValidateRules(openaiRules, grokRules);

    const stmt = db.prepare(`
      INSERT INTO rules (title, description, category, confidence, status, crossValidated, discrepancies)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    validatedRules.forEach((rule) => {
      if (!validateRule(rule)) {
        stmt.run(
          rule.title,
          rule.description,
          rule.category,
          rule.confidence,
          "pending",
          rule.crossValidated,
          rule.discrepancies
        );
      }
    });

    stmt.finalize();
    fs.unlinkSync(filePath);

    res.json({ message: "Rules stored", rulesCount: validatedRules.length });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Processing failed", details: error.message });
  }
});

// Rest of the endpoints remain the same
app.get("/api/rules", (req, res) => {
  db.all("SELECT * FROM rules", [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.put("/api/rules/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.run("UPDATE rules SET status = ? WHERE id = ?", [status, id], function (err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ message: "Rule updated" });
  });
});


// Add this helper function to call Grok API for analysis
async function analyzeIssuesWithGrok(row, issues, rules) {
  const prompt = `
    You are an expert in banking regulatory compliance, specializing in ASC 815 hedging rules.
    Given the following customer data and identified issues, provide:
    1. A detailed explanation of the risks.
    2. Specific remediation steps to resolve the issues.

    Customer Data: ${JSON.stringify(row)}
    Issues: ${JSON.stringify(issues)}
    Relevant Rules: ${JSON.stringify(rules.filter(r => issues.some(i => i.includes(r.title))))}

    Return a JSON object with:
    - explanation: String describing the risks
    - remediation: Array of specific steps to fix the issues
  `;

  try {
    const grokResponse = await grokApi.post("/chat/completions", {
      messages: [
        {
          role: "system",
          content: "You are an expert in banking regulatory compliance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "grok-2-latest",
      stream: false,
      temperature: 0.2 // Lower temperature for more precise responses
    });

    const responseContent = grokResponse.data.choices[0].message.content;
    const cleanJson = responseContent.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Grok API Error:", error.message);
    return {
      explanation: "Unable to analyze due to processing error.",
      remediation: ["Contact support for manual review."]
    };
  }
}

// Updated /api/upload-data endpoint
app.post("/api/upload-data", upload.single("csv"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const rules = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM rules WHERE status = 'validated' AND crossValidated = 1", [], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });

    const results = [];
    const stream = fs.createReadStream(filePath)
      .pipe(csv.parse({ columns: true, trim: true }));

    for await (const row of stream) {
      const issues = [];
      rules.forEach((rule) => {
        const value = row[rule.title];
        const constraints = rule.constraints ? JSON.parse(rule.constraints) : {};
        if (value && constraints.allowedValues && !constraints.allowedValues.includes(value)) {
          issues.push(`${rule.title}: Value '${value}' not in ${constraints.allowedValues}`);
        }
        if (constraints.format === "yyyy-mm-dd" && value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          issues.push(`${rule.title}: Invalid date format`);
        }
      });

      // Enhanced risk scoring
      const riskScore = issues.length / rules.length;
      const status = issues.length > 1 ? "high-risk" : issues.length === 1 ? "medium-risk" : "compliant";

      // Use Grok to analyze issues and get remediation
      let analysis = { explanation: "", remediation: [] };
      if (issues.length > 0) {
        analysis = await analyzeIssuesWithGrok(row, issues, rules);
      }

      results.push({
        ...row,
        issues,
        status,
        riskScore,
        explanation: analysis.explanation,
        remediation: analysis.remediation
      });
    }

    fs.unlinkSync(filePath);
    res.json({ message: "Data processed", results });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Processing failed", details: error.message });
  }
});


app.listen(port, () => console.log(`Server running at http://localhost:${port}`));