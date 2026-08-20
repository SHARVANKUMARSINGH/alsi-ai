# ALSI Ai — Mobile Interface Design

## Design Direction

ALSI Ai is a portrait-first conversational assistant designed for focused, one-handed use. The visual language adapts the supplied Manus reference into an original mobile interface: a warm off-white canvas, crisp black typography, restrained coral accent, quiet gray dividers, and generously rounded surfaces. The product should feel calm, fast, and deliberate rather than decorative.

## Screen List

| Screen | Primary content and functionality |
| --- | --- |
| Chat home | Header with navigation and control entry points, scrollable conversation history, empty-state suggestions, a thinking status row, and a bottom composer that remains reachable above the keyboard. |
| Controls sheet | A bottom sheet for selecting Normal or Thinking behavior and adjusting Aggressive Mode. It summarizes the active behavior and lets the user reset to balanced settings. |
| Conversation actions | Header action menu for starting a clean conversation and opening controls without leaving the chat. |

## Layout Specification

The chat home screen uses a compact 56-point header. The left control is a circular menu button; the title is ALSI Ai with a small presence indicator; the right control opens the behavior settings. The message area uses a `FlatList`, keeping user messages right-aligned in ink-dark bubbles and assistant messages left-aligned in pale, outlined cards. Each assistant response reserves enough line height for dense, wrapped text without clipping.

The composer anchors to the bottom safe area and uses a white rounded container with a multi-line text field, a settings shortcut, and a high-contrast send button. It grows vertically for longer drafts while preserving the message history above it. An unobtrusive status pill with animated dots appears in the conversation when the request is waiting.

The controls sheet presents two large segmented options: **Normal** for direct answers and **Thinking** for a concise, user-facing reasoning summary before the answer. It also contains an **Aggressive Mode** segmented intensity control that maps from balanced to maximum creativity. The sheet can be dismissed with a clear Done action or a drag-independent close icon.

## Key User Flows

| Flow | Steps |
| --- | --- |
| Send a chat message | User enters a prompt → taps Send or presses the keyboard action → message appears immediately → composer disables → Thinking indicator is shown → assistant response appears and the list scrolls to it. |
| Choose response style | User opens Controls → selects Normal or Thinking → the active segment and summary update → next API request receives the matching system instruction. |
| Increase creativity | User opens Controls → raises Aggressive Mode → label communicates intensity → next API request receives a temperature corresponding to the selected level. |
| Recover from failure | API request fails → an in-chat error card states the issue in plain language → message draft is retained → user can resend after changing settings or connectivity. |
| Start over | User taps the header menu → selects New chat → conversation state clears while behavior settings remain unchanged. |

## Color Choices

| Token | Value | Purpose |
| --- | --- | --- |
| Canvas | `#F7F7F5` | Warm-neutral main background, resembling premium editorial paper. |
| Ink | `#151515` | Primary type, user message surfaces, and primary action backgrounds. |
| Coral | `#FF5A4F` | ALSI brand accent, activity indicators, and selection emphasis. |
| Assistant surface | `#FFFFFF` | Assistant cards and input surface. |
| Quiet border | `#E8E7E4` | Dividers and card outlines. |
| Secondary text | `#6E6D6A` | Timestamps, helper labels, and inactive controls. |

## Accessibility and Interaction Notes

All tap targets will meet a minimum 44-point touch area. Message and control labels maintain readable contrast, visual state is reinforced with text rather than color alone, and the list automatically announces progress through the visible loading state. The app supports system light/dark appearance while keeping the same information hierarchy in both modes.
