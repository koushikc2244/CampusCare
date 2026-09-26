ALLOWED_TRANSITIONS = {
    "reported": ["under_review"],
    "under_review": ["assigned"],
    "assigned": ["in_progress"],
    "in_progress": ["resolved"],
    "resolved": ["closed"],
    "closed": []
}


def can_change_status(current_status: str, new_status: str) -> bool:
    allowed_statuses = ALLOWED_TRANSITIONS.get(
        current_status,
        []
    )

    return new_status in allowed_statuses