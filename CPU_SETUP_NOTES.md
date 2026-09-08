# CPU Lineup Requirements

## Launch Behavior
- On initial load, show a setup modal before betting/dealing.
- User must select CPU count first.
- Valid CPU count range: `0` to `4`.
- If count is `0`, no identity selection is required.
- If count is `1..4`, user selects exactly that many identities.
- Start button stays disabled until selected identities match selected count.

## Identity Pool
- Available CPU identities:
  - `Alice` (Basic Strategy)
  - `Bob` (Risk Taker)
  - `Chuck` (Card Counter)
  - `Jim Bob` (Rookie)
- Identity choice determines default CPU behavior.

## Gameplay Visibility
- Only selected CPU identities appear at the table.
- A visible card counting tracker must be shown to the user:
  - Running Count (Hi-Lo)
  - True Count
  - Cards Seen
  - Decks Remaining
