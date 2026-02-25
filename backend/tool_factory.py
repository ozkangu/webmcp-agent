"""Dynamic tool factory — frontend manifest'inden Agno Function proxy'leri oluşturur."""

import json
from typing import Any

from agno.tools.function import Function

from bridge import bridge


def create_proxy_tool(entry: dict[str, Any]) -> Function:
    """Bir manifest girişinden Agno Function oluşturur.

    skip_entrypoint_processing=True sayesinde proxy fonksiyonunun **kwargs imzası
    yerine frontend'den gelen zengin JSON Schema parametreleri LLM'e sunulur.
    """
    tool_name = entry["name"]

    async def proxy_entrypoint(**kwargs) -> str:
        result = await bridge.call_frontend(tool_name, kwargs)
        return json.dumps(result, ensure_ascii=False)

    return Function(
        name=tool_name,
        description=entry.get("description", ""),
        parameters=entry.get("parameters", {"type": "object", "properties": {}}),
        entrypoint=proxy_entrypoint,
        skip_entrypoint_processing=True,
    )


def create_tools_from_manifest(manifest: list[dict[str, Any]]) -> list[Function]:
    """Tüm manifest'i Function listesine çevirir."""
    return [create_proxy_tool(entry) for entry in manifest]
