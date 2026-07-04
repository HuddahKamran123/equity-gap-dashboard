"""
Skill: wfa-scope-guard
Form: Skill (hard gate — blocks the run, like Kinquiry's codebook-guard)
Capability map #4: Validate WFA scope

CLAUDE.md fixed rule (no discretion):
    WFA comparison -> only for the four EE Act designated groups and their
    subgroups. NEVER for D117 (2SLGBTQIA+), D116 (religion), or
    D115 (ethnocultural origin) — no WFA benchmark exists for them.

Usage
-----
    from skills.wfa_scope_guard import assert_wfa_allowed, WfaScopeError

    assert_wfa_allowed("Women")          # passes silently
    assert_wfa_allowed("D117")           # raises WfaScopeError
    assert_wfa_allowed("2SLGBTQIA+")     # raises WfaScopeError

Call this immediately before rendering ANY WFA benchmark, gap, or
comparison. It raises rather than warns: a blocked group must never
reach a WFA display.
"""

import re
import unicodedata

# ── Groups with NO workforce-availability benchmark (extended PSES only) ───
_BLOCKED_CODES = {"D115", "D116", "D117"}
_BLOCKED_NAMES = {
    "2slgbtqia+", "2slgbtqia", "lgbtq", "lgbtq2+", "sexual orientation",
    "gender diverse",
    "religion", "religious affiliation",
    "ethnocultural origin", "ethnocultural", "ethnocultural group",
}

# ── The four EE Act designated groups (and label variants in this project) ─
_ALLOWED_NAMES = {
    "women", "woman",
    "indigenous", "indigenous peoples", "first nations", "metis", "inuit",
    "persons with disabilities", "disability", "persons with a disability",
    "racialized", "racialized persons", "racialized person",
    "visible minorities", "visible minority",  # 2020-2022 label, same population
    "black", "south asian", "chinese", "filipino", "arab", "latin american",
    "southeast asian", "west asian", "korean", "japanese",  # racialized subgroups
}
_ALLOWED_CODE_PREFIXES = ("D111", "D112", "D113", "D114", "EEDV")


class WfaScopeError(Exception):
    """Raised when a WFA comparison is attempted for a group with no benchmark."""


def _norm(group: str) -> str:
    s = unicodedata.normalize("NFKD", str(group))
    s = "".join(c for c in s if not unicodedata.combining(c))  # strip accents
    return re.sub(r"\s+", " ", s.strip().lower())


def assert_wfa_allowed(group: str) -> None:
    """
    Hard gate. Raises WfaScopeError if `group` (a demographic code like
    'D117' / 'D116 = 3', or a display name like '2SLGBTQIA+') has no WFA
    benchmark. Passes silently for the four designated groups and their
    subgroups. Unknown groups are BLOCKED by default (fail closed).
    """
    g = _norm(group)
    code = re.match(r"([A-Z]+\d*[A-Z]*)", str(group).strip().upper())
    code = code.group(1) if code else ""

    if code in _BLOCKED_CODES or any(g.startswith(_norm(b)) for b in _BLOCKED_NAMES):
        raise WfaScopeError(
            f"WFA comparison blocked for '{group}': no workforce-availability "
            f"benchmark exists for this group (extended PSES group — experience "
            f"scores only). See CLAUDE.md fixed rule."
        )
    if code.startswith(_ALLOWED_CODE_PREFIXES) or g in _ALLOWED_NAMES:
        return
    # Fail closed: an unrecognized group must be explicitly added, not assumed.
    raise WfaScopeError(
        f"WFA comparison blocked for unrecognized group '{group}'. "
        f"If this is a designated-group label variant, add it to "
        f"_ALLOWED_NAMES in skills/wfa_scope_guard.py."
    )


def wfa_allowed(group: str) -> bool:
    """Boolean form for filtering; same rules as assert_wfa_allowed."""
    try:
        assert_wfa_allowed(group)
        return True
    except WfaScopeError:
        return False


# ════════════════════════════════════════════════════════════════════════════
#  SELF-TEST  (run with: python -m skills.wfa_scope_guard)
# ════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("── WFA Scope Guard Self-Test ──")

    # Allowed: designated groups, label variants, subgroup codes
    for g in ("Women", "Racialized persons", "Visible minorities",
              "Indigenous peoples", "Persons with disabilities",
              "D111A = 1", "D112 = 1", "EEDV_03", "Black", "Métis".lower()):
        assert_wfa_allowed(g)
    print("  ✓  All 4 designated groups + subgroups + label variants pass")

    # Blocked: extended PSES groups, by code and by name
    blocked = 0
    for g in ("D117", "D116 = 3", "D115", "2SLGBTQIA+", "Religion",
              "Ethnocultural origin"):
        try:
            assert_wfa_allowed(g)
            raise SystemExit(f"FAIL: '{g}' was not blocked")
        except WfaScopeError:
            blocked += 1
    assert blocked == 6
    print("  ✓  D115/D116/D117 and their display names all raise WfaScopeError")

    # Fail closed: unknown group blocked
    try:
        assert_wfa_allowed("Some new group")
        raise SystemExit("FAIL: unknown group was not blocked")
    except WfaScopeError:
        print("  ✓  Unknown group blocked (fail closed)")

    print("\n  All tests passed. WFA scope guard is ready.")
