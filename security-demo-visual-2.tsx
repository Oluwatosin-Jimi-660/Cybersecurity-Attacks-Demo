import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Database as DatabaseIcon,
  Server,
  Globe,
  Shield,
  Play,
  SkipForward,
  HelpCircle,
  Keyboard as KeyboardIcon,
  BarChart3,
  Rocket,
} from "lucide-react";

// Single-file, safe classroom demo for SQL Injection & XSS concepts
// ⚠️ For education only. Do NOT deploy this publicly or use against systems you don't own.

/*********************************
 * Shared UI building blocks
 *********************************/
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl shadow-lg border border-gray-200 bg-white p-5">
      <div className="text-lg font-semibold mb-3 flex items-center gap-2">
        <span>{title}</span>
      </div>
      <div className="text-sm text-gray-700 space-y-3">{children}</div>
    </div>
  );
}

function Pill({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "danger" | "success" | "warning" | "info" }) {
  const colors: Record<string, string> = {
    default: "bg-gray-100 text-gray-700",
    danger: "bg-red-100 text-red-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-sky-100 text-sky-700",
  };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${colors[variant]}`}>{children}</span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold tracking-tight mb-3">{children}</h2>;
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="text-xs overflow-auto rounded-xl bg-gray-900 text-gray-100 p-4 leading-relaxed">
      <code>{code}</code>
    </pre>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[0.8rem] font-mono text-gray-800">{children}</code>
  );
}

function FlowStep({ icon: Icon, title, description, status }: {
  icon: any;
  title: string;
  description: string;
  status: "safe" | "danger" | "neutral";
}) {
  const colors = {
    safe: "border-green-300 bg-green-50",
    danger: "border-red-300 bg-red-50",
    neutral: "border-gray-300 bg-gray-50",
  } as const;

  const iconColors = {
    safe: "text-green-600",
    danger: "text-red-600",
    neutral: "text-gray-600",
  } as const;

  return (
    <div className={`rounded-xl border-2 ${colors[status]} p-4 flex gap-3`}>
      <Icon className={`${iconColors[status]} flex-shrink-0`} size={24} />
      <div>
        <div className="font-semibold text-sm mb-1">{title}</div>
        <div className="text-xs text-gray-700">{description}</div>
      </div>
    </div>
  );
}

/*********************************
 * Utilities
 *********************************/
const escapeHTML = (s: string) =>
  s
    .replaceAll(/&/g, "&amp;")
    .replaceAll(/</g, "&lt;")
    .replaceAll(/>/g, "&gt;")
    .replaceAll(/\"/g, "&quot;")
    .replaceAll(/'/g, "&#39;");

const highlightSQL = (sql: string, isDangerous: boolean) => {
  const escaped = escapeHTML(sql);
  const kw = /\b(SELECT|FROM|WHERE|AND|OR|INSERT|INTO|VALUES|UPDATE|SET|DELETE)\b/g;
  const base = escaped.replaceAll(kw, (m) => `<span class="text-indigo-300">${m}</span>`);
  if (!isDangerous) return base;
  return base
    .replaceAll(/(OR\s+'1'\s*=\s*'1'|--)/gi, (m) => `<span class="bg-red-500 text-white px-1 rounded">${m}</span>`)
    .replaceAll(/(=\s*'[^']*')/g, (m) => `<span class="text-rose-300">${m}</span>`);
};

const hasUnbalancedQuote = (s: string) => (s.match(/'/g) || []).length % 2 === 1;
const looksLikeTautology = (u: string, p: string) => /'\s*OR\s*'1'='1/i.test(u) || /'\s*OR\s*'1'='1/i.test(p);

/*********************************
 * Expanded demo database
 *********************************/
export type DemoUser = {
  username: string;
  password: string;
  role: "student" | "teacher" | "admin";
  email: string;
};

const USERS: DemoUser[] = [
  { username: "alice", password: "password123", role: "student", email: "alice@example.edu" },
  { username: "bob", password: "winter2024", role: "teacher", email: "bob@school.edu" },
  { username: "charlie", password: "s3cur3!", role: "student", email: "charlie@example.edu" },
];

/*********************************
 * Tutorial scaffolding
 *********************************/
function TutorialBar({
  steps,
  step,
  setStep,
  onExit,
  title,
}: {
  steps: string[];
  step: number;
  setStep: (n: number) => void;
  onExit: () => void;
  title: string;
}) {
  const pct = Math.round(((step + 1) / steps.length) * 100);
  return (
    <div className="rounded-2xl border bg-sky-50 border-sky-200 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play className="text-sky-600" size={18} />
          <div className="font-semibold text-sm">Guided Tutorial: {title}</div>
          <Pill variant="info">Step {step + 1} / {steps.length}</Pill>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            className="rounded-xl border px-2 py-1 text-xs hover:bg-white"
          >Prev [<InlineCode>[</InlineCode>]</button>
          <button
            onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
            className="rounded-xl border px-2 py-1 text-xs hover:bg-white"
          >Next [<InlineCode>]</InlineCode>]</button>
          <button onClick={onExit} className="rounded-xl border px-2 py-1 text-xs hover:bg-white flex items-center gap-1">
            <SkipForward size={14} /> Skip tutorial
          </button>
        </div>
      </div>
      <div className="mt-2 text-xs text-sky-900">{steps[step]}</div>
      <div className="mt-3 h-2 w-full rounded-full bg-sky-100 overflow-hidden">
        <div className="h-2 bg-sky-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/*********************************
 * SQL Injection demo
 *********************************/
function SQLiDemo({
  globalShortcutsOpen,
}: {
  globalShortcutsOpen: boolean;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usePrepared, setUsePrepared] = useState(false);
  const [showDB, setShowDB] = useState(true);

  // Tutorial state
  const [tutorialOn, setTutorialOn] = useState(true);
  const sqliSteps = [
    "Welcome! Intro to SQLi: observe the request → server → database flow.",
    "Legit login: auto-fill Alice's correct credentials and authenticate (both paths).",
    "Classic injection: auto-fill a tautology payload to bypass the vulnerable login.",
    "Mitigation: enable prepared statements and show the attack failing.",
    "Error handling: trigger an unterminated quote to simulate a 500 and discuss error hygiene.",
  ];
  const [step, setStep] = useState(0);

  const naiveSQL = useMemo(() => `SELECT * FROM users WHERE username = '${username}' AND password = '${password}';`, [username, password]);
  const preparedSQL = `SELECT * FROM users WHERE username = ? AND password = ?;`;
  const preparedParams = [username, password];

  type Result = { status: "success" | "fail" | "error"; http: 200 | 401 | 500; detail: string };

  const isTautology = looksLikeTautology(username, password);

  const result: Result = useMemo(() => {
    if (usePrepared) {
      const found = USERS.find((u) => u.username === username && u.password === password);
      if (found) return { status: "success", http: 200, detail: "Authenticated (parameterized query)." };
      return { status: "fail", http: 401, detail: "Invalid credentials (no injection possible)." };
    }

    if (hasUnbalancedQuote(username) || hasUnbalancedQuote(password)) {
      return { status: "error", http: 500, detail: "SQL syntax error: unterminated string near quote. (Simulated)" };
    }

    if (isTautology) {
      return {
        status: "success",
        http: 200,
        detail: "Authenticated because WHERE clause became a tautology. (SQL injection effect)",
      };
    }

    const found = USERS.find((u) => u.username === username && u.password === password);
    if (found) return { status: "success", http: 200, detail: "Authenticated (but query was vulnerable)." };
    return { status: "fail", http: 401, detail: "Invalid credentials." };
  }, [username, password, usePrepared, isTautology]);

  // Compute which rows would match for vulnerable vs prepared
  const vulnerableMatches: DemoUser[] = useMemo(() => {
    if (hasUnbalancedQuote(username) || hasUnbalancedQuote(password)) return [];
    if (isTautology) return USERS; // tautology returns all
    return USERS.filter((u) => u.username === username && u.password === password);
  }, [username, password, isTautology]);

  const preparedMatches: DemoUser[] = useMemo(() => {
    return USERS.filter((u) => u.username === username && u.password === password);
  }, [username, password]);

  // Prefills
  const prefillLegit = () => {
    setUsername("alice");
    setPassword("password123");
  };
  const prefillInjection = () => {
    setUsername("' OR '1'='1");
    setPassword("anything");
  };
  const prefillError = () => {
    setUsername("'");
    setPassword("anything");
  };

  // Tutorial effects
  useEffect(() => {
    if (!tutorialOn) return;
    switch (step) {
      case 0:
        setUsePrepared(false);
        setUsername("");
        setPassword("");
        setShowDB(true);
        break;
      case 1:
        setUsePrepared(false);
        prefillLegit();
        setShowDB(true);
        break;
      case 2:
        setUsePrepared(false);
        prefillInjection();
        setShowDB(true);
        break;
      case 3:
        setUsePrepared(true);
        prefillInjection();
        setShowDB(true);
        break;
      case 4:
        setUsePrepared(false);
        prefillError();
        setShowDB(true);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, tutorialOn]);

  const isAttack = isTautology && !usePrepared;

  // Keyboard shortcuts for SQLi section (scoped)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return; // don't hijack typing
      if (e.key === "s") setUsePrepared((v) => !v); // Safe toggle
      if (e.key === "d") setShowDB((v) => !v); // DB view
      if (e.key === "r") {
        setUsername("");
        setPassword("");
      }
      if (e.key === "[") setStep((n) => Math.max(0, n - 1));
      if (e.key === "]") setStep((n) => Math.min(sqliSteps.length - 1, n + 1));
      if (e.key.toLowerCase() === "t") setTutorialOn((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sqliSteps.length]);

  return (
    <div className="space-y-4">
      <SectionTitle>SQL Injection (visualized)</SectionTitle>

      {tutorialOn && (
        <TutorialBar
          steps={sqliSteps}
          step={step}
          setStep={setStep}
          onExit={() => setTutorialOn(false)}
          title="SQLi Walkthrough"
        />
      )}

      {/* Visual Flow */}
      <Card title="Attack Flow Visualization">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
            <FlowStep
              icon={Globe}
              title="1. User Input"
              description={username || password ? `Username: ${username || "(empty)"}, Password: ${password || "(empty)"}` : "Waiting for input..."}
              status={isAttack ? "danger" : "neutral"}
            />
            <div className="flex justify-center">
              <ArrowRight className="text-gray-400" size={20} />
            </div>
            <FlowStep
              icon={Server}
              title="2. Server"
              description={usePrepared ? "Uses prepared statement" : "Concatenates SQL string"}
              status={usePrepared ? "safe" : isAttack ? "danger" : "neutral"}
            />
            <div className="flex justify-center">
              <ArrowRight className="text-gray-400" size={20} />
            </div>
            <FlowStep
              icon={DatabaseIcon}
              title="3. Database"
              description={result.status === "success" ? "Query executed" : result.status === "error" ? "Syntax error" : "No match found"}
              status={isAttack ? "danger" : result.status === "success" ? "safe" : "neutral"}
            />
          </div>

          {isAttack && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex gap-3 animate-pulse">
              <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
              <div>
                <div className="font-semibold text-sm text-red-800 mb-1">⚠️ SQL Injection Detected!</div>
                <div className="text-xs text-red-700">The injected payload modified the SQL logic, bypassing authentication.</div>
              </div>
            </div>
          )}

          {usePrepared && (username || password) && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex gap-3">
              <Shield className="text-green-600 flex-shrink-0" size={24} />
              <div>
                <div className="font-semibold text-sm text-green-800 mb-1">✓ Protected by Prepared Statements</div>
                <div className="text-xs text-green-700">User input is treated as data only, not executable SQL code.</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Form */}
        <Card title="Login form (student input)">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm">
                <div className="mb-1 font-medium">Username</div>
                <input
                  className="w-full rounded-xl border px-3 py-2"
                  placeholder="e.g. alice or ' OR '1'='1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
              <label className="text-sm">
                <div className="mb-1 font-medium">Password</div>
                <input
                  className="w-full rounded-xl border px-3 py-2"
                  type="text"
                  placeholder="try a password or anything"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button onClick={prefillLegit} className="rounded-2xl border px-3 py-1 text-sm hover:bg-gray-50">Prefill valid</button>
              <button onClick={prefillInjection} className="rounded-2xl border px-3 py-1 text-sm hover:bg-gray-50">Prefill injection</button>
              <button onClick={() => { setUsername(""); setPassword(""); }} className="rounded-2xl border px-3 py-1 text-sm hover:bg-gray-50">Reset</button>
              <div className="ml-auto flex items-center gap-2">
                <input id="prepared" type="checkbox" checked={usePrepared} onChange={(e) => setUsePrepared(e.target.checked)} />
                <label htmlFor="prepared" className="text-sm">Use prepared statements (safe)</label>
              </div>
            </div>

            <div className="text-xs text-gray-500 flex items-center gap-2 pt-1">
              <KeyboardIcon size={14} />
              Shortcuts: <InlineCode>t</InlineCode> toggle tutorial, <InlineCode>s</InlineCode> safe/unsafe, <InlineCode>d</InlineCode> DB view, <InlineCode>[</InlineCode>/<InlineCode>]</InlineCode> prev/next step, <InlineCode>r</InlineCode> reset
            </div>
          </div>
        </Card>

        {/* Server */}
        <Card title={usePrepared ? "Server (SAFE)" : "Server (VULNERABLE)">
          {usePrepared ? (
            <div className="space-y-2">
              <div>
                <div className="font-medium mb-1">Parameterized query</div>
                <CodeBlock code={`${preparedSQL}\nParams: ${JSON.stringify(preparedParams)}`} />
              </div>
              <div className="flex items-center gap-2">
                <Pill variant={result.status === "success" ? "success" : "warning"}>HTTP {result.http}</Pill>
                <span className="text-sm">{result.detail}</span>
              </div>
              <div>
                <div className="font-medium mb-1">Why it's safe</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Query and data are sent separately; the database never parses user input as SQL.</li>
                  <li>Even payloads like <InlineCode>' OR '1'='1</InlineCode> are treated as literal strings.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <div className="font-medium mb-1">Concatenated SQL (danger)</div>
                <div
                  className="text-xs overflow-auto rounded-xl bg-gray-900 text-gray-100 p-4 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightSQL(naiveSQL, isAttack) }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Pill variant={result.status === "success" ? (isAttack ? "danger" : "success") : result.status === "fail" ? "warning" : "danger"}>
                  HTTP {result.http}
                </Pill>
                <span className="text-sm">{result.detail}</span>
              </div>
              <div>
                <div className="font-medium mb-1">Mitigations</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use parameterized queries (<InlineCode>?</InlineCode> placeholders) or ORM bindings.</li>
                  <li>Apply least-privilege DB accounts; hide detailed errors from users.</li>
                  <li>Validate inputs server-side and log suspicious patterns.</li>
                </ul>
              </div>
            </div>
          )}
        </Card>

        {/* DB Visualization */}
        <Card title="Database view & query impact">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-gray-600" />
              <span className="text-xs text-gray-600">Toggle view:</span>
              <button onClick={() => setShowDB((v) => !v)} className="rounded-xl border px-2 py-1 text-xs hover:bg-gray-50">{showDB ? "Hide" : "Show"} table</button>
            </div>

            {showDB && (
              <div className="overflow-auto rounded-xl border">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr className="text-left">
                      <th className="px-3 py-2">username</th>
                      <th className="px-3 py-2">role</th>
                      <th className="px-3 py-2">email</th>
                      <th className="px-3 py-2">password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {USERS.map((u) => {
                      const vuln = vulnerableMatches.includes(u);
                      const prep = preparedMatches.includes(u);
                      const variant = vuln && !prep ? "bg-red-50" : prep && !vuln ? "bg-green-50" : vuln && prep ? "bg-amber-50" : "";
                      return (
                        <tr key={u.username} className={`${variant} border-t`}> 
                          <td className="px-3 py-2 font-mono">{u.username}</td>
                          <td className="px-3 py-2">{u.role}</td>
                          <td className="px-3 py-2">{u.email}</td>
                          <td className="px-3 py-2 font-mono">{u.password}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border p-3">
                <div className="text-xs font-semibold mb-1">Records returned (VULNERABLE)</div>
                {vulnerableMatches.length ? (
                  <ul className="list-disc pl-5 text-xs">
                    {vulnerableMatches.map((u) => (
                      <li key={u.username}><b>{u.username}</b> – {u.role} · {u.email}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-gray-500">(none)</div>
                )}
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs font-semibold mb-1">Records returned (SAFE / Prepared)</div>
                {preparedMatches.length ? (
                  <ul className="list-disc pl-5 text-xs">
                    {preparedMatches.map((u) => (
                      <li key={u.username}><b>{u.username}</b> – {u.role} · {u.email}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-gray-500">(none)</div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Teacher guide (SQLi quick demo)">
        <ol className="list-decimal pl-6 space-y-1 text-sm">
          <li>Press <InlineCode>t</InlineCode> to toggle Tutorial Mode. Use <InlineCode>[</InlineCode>/<InlineCode>]</InlineCode> to step.</li>
          <li>Step 2 auto-fills a tautology. Discuss why <InlineCode>OR '1'='1</InlineCode> turns the WHERE clause true.</li>
          <li>Step 3 flips on prepared statements and the attack fails. Emphasize binding parameters.</li>
          <li>Step 4 shows an error leak via an unmatched quote → why to avoid verbose DB errors.</li>
          <li>Use <InlineCode>d</InlineCode> to show the <b>Database view</b> and highlight which rows are returned.</li>
        </ol>
      </Card>
    </div>
  );
}

/*********************************
 * XSS demo
 *********************************/
function XSSDemo() {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [runUntrusted, setRunUntrusted] = useState(false);

  const prefillNice = () => {
    setName("Charlie");
    setComment("Great lesson! Thanks for the demo.");
  };
  const prefillXSS = () => {
    setName("<b>Visitor</b>");
    setComment("<img src=x onerror=alert('XSS')> Hello!");
  };

  const safeRendered = useMemo(
    () => ({ name: escapeHTML(name), comment: escapeHTML(comment) }),
    [name, comment]
  );

  const unsafeRendered = useMemo(() => ({ name, comment }), [name, comment]);
  const hasXSSPayload = /<script|onerror|onload|onclick/i.test(name + comment);
  const xssFired = runUntrusted && hasXSSPayload; // used for visual banner

  // Tutorial for XSS
  const [tutorialOn, setTutorialOn] = useState(true);
  const xssSteps = [
    "Intro: escaping vs. executing HTML in the browser.",
    "Friendly input: render safely with output encoding.",
    "Malicious payload: show how escaping neutralizes it.",
    "Flip to UNSAFE renderer to demonstrate code execution.",
    "Discuss CSP & sanitization tradeoffs.",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!tutorialOn) return;
    switch (step) {
      case 0:
        setRunUntrusted(false); setName(""); setComment(""); break;
      case 1:
        setRunUntrusted(false); prefillNice(); break;
      case 2:
        setRunUntrusted(false); prefillXSS(); break;
      case 3:
        prefillXSS(); setRunUntrusted(true); break;
      case 4:
        setRunUntrusted(false); prefillXSS(); break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, tutorialOn]);

  // Keyboard shortcuts for XSS section (scoped)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key.toLowerCase() === "s") setRunUntrusted((v) => !v);
      if (e.key === "[") setStep((n) => Math.max(0, n - 1));
      if (e.key === "]") setStep((n) => Math.min(xssSteps.length - 1, n + 1));
      if (e.key.toLowerCase() === "t") setTutorialOn((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [xssSteps.length]);

  return (
    <div className="space-y-4">
      <SectionTitle>Cross-Site Scripting (XSS)</SectionTitle>

      {tutorialOn && (
        <TutorialBar
          steps={xssSteps}
          step={step}
          setStep={setStep}
          onExit={() => setTutorialOn(false)}
          title="XSS Walkthrough"
        />
      )}

      {/* Visual Flow */}
      <Card title="Attack Flow Visualization">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
            <FlowStep
              icon={Globe}
              title="1. User Input"
              description={name || comment ? `Name: ${name || "(empty)"}, Comment: ${comment || "(empty)"}` : "Waiting for input..."}
              status={hasXSSPayload ? "danger" : "neutral"}
            />
            <div className="flex justify-center">
              <ArrowRight className="text-gray-400" size={20} />
            </div>
            <FlowStep
              icon={Server}
              title="2. Server"
              description={runUntrusted ? "No sanitization applied" : "Escapes HTML entities"}
              status={runUntrusted ? (hasXSSPayload ? "danger" : "neutral") : "safe"}
            />
            <div className="flex justify-center">
              <ArrowRight className="text-gray-400" size={20} />
            </div>
            <FlowStep
              icon={Globe}
              title="3. Browser"
              description={runUntrusted ? "Executes embedded code" : "Renders escaped text"}
              status={runUntrusted && hasXSSPayload ? "danger" : "safe"}
            />
          </div>

          {xssFired && (
            <div className="bg-red-600 text-white rounded-xl p-4 flex items-center gap-3 animate-pulse">
              <AlertTriangle className="flex-shrink-0" size={24} />
              <div className="font-semibold text-sm">RED ALERT: XSS EXECUTED</div>
              <div className="text-xs opacity-90">A malicious handler executed in the victim's browser.</div>
            </div>
          )}

          {!runUntrusted && (name || comment) && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex gap-3">
              <Shield className="text-green-600 flex-shrink-0" size={24} />
              <div>
                <div className="font-semibold text-sm text-green-800 mb-1">✓ Protected by Output Encoding</div>
                <div className="text-xs text-green-700">HTML entities are escaped, preventing script execution.</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Comment form (student input)">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm">
                <div className="mb-1 font-medium">Display name</div>
                <input
                  className="w-full rounded-xl border px-3 py-2"
                  placeholder="e.g. Alex or &lt;b&gt;Alex&lt;/b&gt;"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="text-sm md:col-span-1">
                <div className="mb-1 font-medium">Comment</div>
                <input
                  className="w-full rounded-xl border px-3 py-2"
                  placeholder="type a message or try an HTML tag"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button onClick={prefillNice} className="rounded-2xl border px-3 py-1 text-sm hover:bg-gray-50">Prefill friendly</button>
              <button onClick={prefillXSS} className="rounded-2xl border px-3 py-1 text-sm hover:bg-gray-50">Prefill XSS</button>
              <button onClick={() => { setName(""); setComment(""); }} className="rounded-2xl border px-3 py-1 text-sm hover:bg-gray-50">Reset</button>
              <div className="ml-auto flex items-center gap-2">
                <input id="runHTML" type="checkbox" checked={runUntrusted} onChange={(e) => setRunUntrusted(e.target.checked)} />
                <label htmlFor="runHTML" className="text-sm">Run untrusted HTML (unsafe)</label>
              </div>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2 pt-1">
              <KeyboardIcon size={14} />
              Shortcuts: <InlineCode>t</InlineCode> tutorial, <InlineCode>s</InlineCode> safe/unsafe, <InlineCode>[</InlineCode>/<InlineCode>]</InlineCode> prev/next
            </div>
          </div>
        </Card>

        <Card title={runUntrusted ? "Renderer (VULNERABLE)" : "Renderer (SAFE)">
          {runUntrusted ? (
            <div className="space-y-3">
              <div className="text-sm">Below we render with <InlineCode>dangerouslySetInnerHTML</InlineCode> (don't do this with user input):</div>
              <div className="rounded-xl border p-3 bg-red-50">
                <div className="text-xs text-gray-500">Name:</div>
                <div dangerouslySetInnerHTML={{ __html: unsafeRendered.name || "<i>(empty)</i>" }} />
                <div className="text-xs text-gray-500 mt-2">Comment:</div>
                <div dangerouslySetInnerHTML={{ __html: unsafeRendered.comment || "<i>(empty)</i>" }} />
              </div>
              <div className="text-red-700 font-medium">If a script runs here, that's a stored/reflected XSS effect.</div>
              <div>
                <div className="font-medium mb-1">Mitigations</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Escape output by context (HTML/attr/JS/URL) or use a trusted templating engine.</li>
                  <li>Sanitize HTML with a vetted library (e.g., DOMPurify) if rich text is required.</li>
                  <li>Enable CSP (Content-Security-Policy) to reduce impact.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm">Below we escape user input before rendering (safe path):</div>
              <div className="rounded-xl border p-3 bg-green-50">
                <div className="text-xs text-gray-500">Name:</div>
                <div className="font-medium" dangerouslySetInnerHTML={{ __html: safeRendered.name || "<i>(empty)</i>" }} />
                <div className="text-xs text-gray-500 mt-2">Comment:</div>
                <div dangerouslySetInnerHTML={{ __html: safeRendered.comment || "<i>(empty)</i>" }} />
              </div>
              <div className="text-green-700 font-medium">Unsafe tags are rendered inert; scripts do not run.</div>
            </div>
          )}
        </Card>
      </div>

      <Card title="Teacher guide (XSS quick demo)">
        <ol className="list-decimal pl-6 space-y-1 text-sm">
          <li>Press <InlineCode>t</InlineCode> to toggle Tutorial Mode; use <InlineCode>[</InlineCode>/<InlineCode>]</InlineCode> to step.</li>
          <li>Use <b>Prefill XSS</b> to load a classic payload, show safe render first.</li>
          <li>Switch to <b>Run untrusted HTML</b> (unsafe) to illustrate script execution risk.</li>
          <li>Discuss defense-in-depth: sanitization libraries and CSP.</li>
        </ol>
      </Card>
    </div>
  );
}

/*********************************
 * Root component
 *********************************/
export default function SecurityDemos() {
  const [tab, setTab] = useState<"sqli" | "xss">("sqli");
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Global keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "1") setTab("sqli");
      if (e.key === "2") setTab("xss");
      if (e.key === "?") setShowShortcuts((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Classroom Demos: SQL Injection & XSS (Safe Visualizer)</h1>
          <p className="text-sm text-gray-600 mt-2 max-w-3xl">
            This self-contained page <b>simulates</b> insecure vs. secure handling of user input for two common web risks.
            It never connects to a real database and only executes scripts if you intentionally enable the unsafe toggle.
            Use it for teaching—not for attacking systems. 🧑‍🏫
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Pill>Client-side simulation</Pill>
            <Pill>No real DB</Pill>
            <Pill>Safe defaults</Pill>
            <Pill variant="info">Tutorial Mode</Pill>
          </div>
        </header>

        <nav className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("sqli")}
            className={`rounded-2xl px-4 py-2 text-sm border ${tab === "sqli" ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"}`}
          >
            SQL Injection (1)
          </button>
          <button
            onClick={() => setTab("xss")}
            className={`rounded-2xl px-4 py-2 text-sm border ${tab === "xss" ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"}`}
          >
            XSS (2)
          </button>
          <button onClick={() => setShowShortcuts((v) => !v)} className="ml-auto rounded-2xl px-3 py-2 text-sm border bg-white hover:bg-gray-50 flex items-center gap-2">
            <HelpCircle size={16} /> Keyboard Shortcuts (?)
          </button>
        </nav>

        <main className="space-y-6">
          {tab === "sqli" ? <SQLiDemo globalShortcutsOpen={showShortcuts} /> : <XSSDemo />}

          <Card title="Instructor notes & safety">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Keep this demo local or in a sandboxed environment. Do not collect real user data.</li>
              <li>Use the <b>SAFE</b> versions to emphasize proper mitigations (parameterized queries, output encoding, sanitization, CSP).</li>
              <li>Discuss defense-in-depth: input validation, least-privilege, stored procedure parameterization, secure error handling.</li>
              <li>Never test techniques on systems without explicit permission. This demo is intentionally scoped to the page only.</li>
            </ul>
          </Card>

          <Card title="How to Use in Class (suggested flow)">
            <ol className="list-decimal pl-6 space-y-1 text-sm">
              <li><b>Start with Tutorial Mode</b> – step through the basics with the progress bar guiding the class.</li>
              <li><b>Use Keyboard Shortcuts</b> – quickly switch between examples during live demos.</li>
              <li><b>Show Database View</b> – visually connect inputs to the actual rows returned by each query.</li>
              <li><b>Toggle Safe/Unsafe Modes</b> – demonstrate protection effectiveness in real time.</li>
              <li><b>Recap</b> – compare the flow colors/icons for safe vs dangerous paths.</li>
            </ol>
          </Card>
        </main>

        <footer className="text-xs text-gray-500 mt-8">© {new Date().getFullYear()} Classroom demo. Purpose: education & awareness.</footer>
      </div>

      {/* Keyboard shortcut overlay */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-2">
              <KeyboardIcon size={18} className="text-gray-700" />
              <div className="font-semibold">Keyboard Shortcuts</div>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-sm">
              <li><InlineCode>1</InlineCode>/<InlineCode>2</InlineCode> – Switch to SQLi/XSS</li>
              <li><InlineCode>?</InlineCode> – Toggle this help</li>
              <li><InlineCode>t</InlineCode> – Toggle tutorial (current tab)</li>
              <li><InlineCode>[</InlineCode>/<InlineCode>]</InlineCode> – Prev/Next tutorial step</li>
              <li><InlineCode>s</InlineCode> – Safe/Unsafe toggle</li>
              <li><InlineCode>d</InlineCode> – Show/Hide DB view (SQLi)</li>
              <li><InlineCode>r</InlineCode> – Reset inputs (SQLi)</li>
            </ul>
            <div className="mt-3 text-xs text-gray-500">Tip: Progress bar with a <b>skip</b> option makes this great for classroom pacing.</div>
            <div className="mt-4 flex justify-end">
              <button className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50" onClick={() => setShowShortcuts(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
