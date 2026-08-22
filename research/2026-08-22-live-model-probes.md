# Live OpenRouter Multimodal Probe Findings

On 2026-08-22, the OpenRouter catalog was queried and current free image-capable models were tested with the configured server key using both a plain-text message and a strict `image_url` base64 content part.

| Candidate | Text probe | Image probe | Decision |
| --- | --- | --- | --- |
| `openrouter/free` | HTTP 200 | HTTP 200 | Use as a reliable multimodal fallback. |
| `dots-studio/dots-3-note-preview:free` | HTTP 200 | HTTP 200 | Use as the dedicated ALSI Pro multimodal route. |
| `nvidia/nemotron-nano-12b-v2-vl:free` | HTTP 200 | HTTP 502 | Do not use for image attachments. |
| `google/gemma-4-26b-a4b-it:free` | HTTP 429 | HTTP 429 | Temporarily rate-limited during the probe. |
| `google/gemma-4-31b-it:free` | HTTP 429 | HTTP 429 | Temporarily rate-limited during the probe. |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | HTTP 200 | HTTP 200 response with upstream image error | Do not use for image attachments. |

The official Dots3 page confirms its exact identifier and that it accepts text and images. The official `openrouter/free` documentation confirms that the router filters free models for needed features, including image understanding, but does not guarantee a fixed provider.

Sources: https://openrouter.ai/dots-studio/dots-3-note-preview:free and https://openrouter.ai/docs/guides/routing/routers/free-router
