def calculate_priority(category: str, description: str) -> str:
    category = category.lower().strip()
    description = description.lower().strip()

    critical_keywords = [
        "fire",
        "explosion",
        "gas leak",
        "danger",
        "emergency",
        "life threatening"
    ]

    high_keywords = [
        "electric shock",
        "exposed wire",
        "short circuit",
        "major leak",
        "flood",
        "broken pipe",
        "security breach"
    ]

    for keyword in critical_keywords:
        if keyword in description:
            return "critical"

    for keyword in high_keywords:
        if keyword in description:
            return "high"

    if category in ["safety", "security"]:
        return "high"

    if category in ["electrical", "water"]:
        return "medium"

    if category in ["infrastructure", "cleanliness"]:
        return "low"

    return "medium"