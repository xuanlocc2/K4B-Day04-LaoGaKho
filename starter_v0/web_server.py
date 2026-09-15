from __future__ import annotations

import json
import secrets
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from chat import run_model_tool_loop, safe_slug, write_transcript
from env_loader import load_lab_env
from providers import make_provider
from tools import load_tool_declarations, to_openai_tools
from versioning import artifact_version_dict, build_artifact_version


ROOT = Path(__file__).parent
WEB_ROOT = ROOT / "web"
ARTIFACTS_DIR = ROOT / "artifacts"
TRANSCRIPTS_DIR = ROOT / "transcripts"
load_lab_env(ROOT)


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.end_headers()

    def do_POST(self) -> None:
        if urlparse(self.path).path != "/api/chat":
            self._send_json(404, {"error": "not_found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            request = json.loads(self.rfile.read(length))
            provider_name = request.get("provider", "openrouter")
            version = str(request.get("version", "v3"))
            if provider_name not in {"openrouter", "openai", "anthropic", "gemini"}:
                raise ValueError("unsupported provider")
            user_message = request.get("message")
            if not isinstance(user_message, str):
                raise ValueError("message must be a string")
            user_message = user_message.strip()
            history = request.get("history", [])
            if not user_message:
                raise ValueError("message must not be empty")
            if not isinstance(history, list):
                raise ValueError("history must be a list")
            if any(
                not isinstance(item, dict)
                or item.get("role") not in {"user", "assistant"}
                or not isinstance(item.get("content"), str)
                for item in history
            ):
                raise ValueError("history must contain user/assistant messages")

            prompt_path = ARTIFACTS_DIR / "system_prompt.md"
            tools_path = ARTIFACTS_DIR / "tools.yaml"
            prompt = prompt_path.read_text(encoding="utf-8")
            declarations = load_tool_declarations(tools_path)
            artifact_version = build_artifact_version(version, prompt_path, tools_path)
            provider = make_provider(provider_name)
            messages = [
                {"role": item["role"], "content": item["content"]}
                for item in history[-10:]
                if item.get("role") in {"user", "assistant"} and item.get("content")
            ]
            messages.append({"role": "user", "content": user_message})
            result = run_model_tool_loop(
                provider=provider,
                messages=[{"role": "system", "content": prompt}, *messages],
                tools=to_openai_tools(declarations),
                model=request.get("model") or getattr(provider, "default_model", None),
                max_tool_rounds=4,
            )
            session_id = request.get("session_id")
            if not isinstance(session_id, str) or not session_id:
                session_id = f"{safe_slug(version)}_{provider_name}_{secrets.token_hex(6)}"
            transcript_path = TRANSCRIPTS_DIR / f"{safe_slug(session_id)}.transcript.json"
            if transcript_path.is_file():
                transcript = json.loads(transcript_path.read_text(encoding="utf-8"))
            else:
                transcript = {
                    "transcript_id": session_id,
                    **artifact_version_dict(artifact_version),
                    "provider": provider_name,
                    "model": request.get("model") or getattr(provider, "default_model", None),
                    "system_prompt": str(prompt_path),
                    "tools": str(tools_path),
                    "turns": [],
                }
            transcript["turns"].append({"user": user_message, **result})
            write_transcript(transcript_path, transcript)
            self._send_json(200, {
                **result,
                **artifact_version_dict(artifact_version),
                "provider": provider_name,
                "model": request.get("model") or getattr(provider, "default_model", None),
                "session_id": session_id,
                "transcript": str(transcript_path),
            })
        except Exception as exc:
            self._send_json(400, {"error": f"{type(exc).__name__}: {exc}"})

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/":
            path = "/index.html"
        file_path = (WEB_ROOT / path.lstrip("/")).resolve()
        if WEB_ROOT.resolve() not in file_path.parents or not file_path.is_file():
            self.send_error(404)
            return
        content_type = "text/html; charset=utf-8" if file_path.suffix == ".html" else "text/plain; charset=utf-8"
        if file_path.suffix == ".js":
            content_type = "text/javascript; charset=utf-8"
        elif file_path.suffix == ".css":
            content_type = "text/css; charset=utf-8"
        body = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8000), Handler)
    print("Web UI: http://127.0.0.1:8000")
    server.serve_forever()
