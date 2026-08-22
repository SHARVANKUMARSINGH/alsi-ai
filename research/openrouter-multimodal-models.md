# OpenRouter Multimodal Routing Findings

- OpenRouter documents base64 image input as a `data:image/jpeg;base64,{base64_data}` URL in an `image_url` content part for vision-capable models.
- OpenRouter currently lists `google/gemma-4-31b-it:free` as a free multimodal model that accepts both text and image input and returns text output.
- The official model page shows a 262K context window and a single Google AI Studio free provider with recent uptime and availability data.
- The live public model catalog lists `nvidia/nemotron-nano-12b-v2-vl:free`, not the retired `nvidia/nemotron-nano-12b-vl:free` identifier currently used in ALSI Standard.
- The live catalog also lists `google/gemma-4-26b-a4b-it:free`. Its official page confirms free text-and-image input support, a 262K context window, and a current Google AI Studio provider.
- The guessed `google/gemma-4-4b-it:free` route returned 404 and must not be used.

Sources consulted on 2026-08-22:

- https://openrouter.ai/docs/guides/overview/multimodal/overview
- https://openrouter.ai/google/gemma-4-31b-it:free
