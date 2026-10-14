#!/usr/bin/env python3
"""
The one place this pipeline talks to a model: the `claude -p` CLI on the Max
login. No API key anywhere (vault rule: Max login, no exported keys). Pattern
copied from zz_System/Scripts/at-weekly-read.py run_claude(): headless `-p`,
JSON output, a nonzero exit is an INSTRUMENT FAILURE that raises, never an
empty result.

Two additions over that helper:
  - every CLAUDE* env var is scrubbed, so the drafting step also runs when a
    Claude Code session is the operator (the CLI refuses to nest otherwise);
  - an empty or is_error reply raises too.
"""
import json
import os
import shutil
import subprocess
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
DEFAULT_MODEL = "sonnet"
TIMEOUT_SEC = 300


def find_claude() -> str:
    """Locate the claude CLI; a LaunchAgent PATH will not include nvm."""
    found = shutil.which("claude")
    if found:
        return found
    for c in sorted((Path.home() / ".nvm" / "versions" / "node").glob("*/bin/claude"), reverse=True):
        if c.exists():
            return str(c)
    raise RuntimeError("claude CLI not found on PATH or under ~/.nvm")


def run_claude(prompt: str, model: str = DEFAULT_MODEL, timeout: int = TIMEOUT_SEC) -> str:
    """Return the model's text reply. Raises RuntimeError on any failure."""
    claude_bin = find_claude()
    env = {k: v for k, v in os.environ.items() if not k.startswith("CLAUDE")}
    env["PATH"] = os.pathsep.join([str(Path(claude_bin).parent), "/opt/homebrew/bin",
                                   env.get("PATH", "/usr/bin:/bin")])
    if not env.get("USER"):
        import pwd
        env["USER"] = env["LOGNAME"] = pwd.getpwuid(os.getuid()).pw_name
    cmd = [claude_bin, "-p", prompt, "--model", model, "--output-format", "json"]
    r = subprocess.run(cmd, capture_output=True, text=True, env=env, cwd=str(REPO), timeout=timeout)
    if r.returncode != 0:
        raise RuntimeError(f"claude exited {r.returncode}: {(r.stderr or r.stdout).strip()[:300]}")
    try:
        data = json.loads(r.stdout)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"claude returned non-JSON output: {r.stdout[:200]!r}") from e
    if data.get("is_error"):
        raise RuntimeError(f"claude reported an error: {str(data.get('result'))[:300]}")
    text = (data.get("result") or "").strip()
    if not text:
        raise RuntimeError("claude returned an empty result")
    return text


def parse_model_json(raw: str) -> dict:
    """Tolerate a model that wrapped the JSON in prose or ``` fences."""
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.lstrip().startswith("json"):
            raw = raw.lstrip()[4:]
    start, end = raw.find("{"), raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("no JSON object found in model reply")
    return json.loads(raw[start:end + 1])
