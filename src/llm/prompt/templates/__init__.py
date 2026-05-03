"""Provider-specific prompt templates."""

TEMPLATES: dict[str, str] = {}


def get_template(name: str) -> str | None:
    return TEMPLATES.get(name)


def get_template_or_default(name: str, default: str = "") -> str:
    return TEMPLATES.get(name, default)
