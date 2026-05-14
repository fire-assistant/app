# Firefighter Pup Animation Plan

Source reference:
- `../spritesheet.webp`
- Use only as visual reference. Do not overwrite or alter the source atlas.

Character lock:
- Small chibi firefighter puppy.
- Cream floppy ears, round cheeks, dark eyes, tiny mouth.
- Navy firefighter-style cap/helmet with small yellow badge.
- Orange firefighter shirt with dark navy collar.
- Thick dark outline, flat colors, simple readable silhouette.
- Transparent final assets.
- No text, UI, speech bubbles, scene backgrounds, cast shadows, or detached effects.

Palette lock:
- Cream fur target: approximately `#f6ddb8`.
- Shirt orange target: approximately `#f59038`.
- Cap/collar navy target: approximately `#2e394e`.
- Cheek peach target: approximately `#f2a25f`.
- Outline target: near black `#111111`.
- Do not brighten the fur toward pale ivory or white.
- Do not soften the sprite into a polished sticker style.
- Reject generated strips if the character reads lighter, glossier, or smoother than the source atlas.

Frame policy:
- Do not force every animation to the same frame count.
- Use the lowest frame count that loops or reads naturally.
- Quiet loops: 4 to 6 frames.
- Clear gestures/reactions: 6 frames.
- Full-body action: 6 to 8 frames.

Production phases:

- Finish every Phase 1 animation first.
- After Phase 1 is approved, make every Phase 2 animation.
- After Phase 2 is approved, make every Phase 3 animation.
- Do not mix phases unless a later animation is needed as a technical test.

Phase 1 animations:

| id | action | target frames | playback |
| --- | --- | ---: | --- |
| `idle_tail` | Waiting with gentle tail wag | 4 | loop |
| `eat` | Eating a small treat or meal | 6 | loop |
| `sleepy` | Getting sleepy, slow blink or yawn | 5 | loop |
| `sulk` | Pouting with small grumpy posture | 5 | loop |
| `surprised` | Simple startled reaction | 6 | one-shot or loop |
| `happy_jump` | Extremely happy bouncing | 8 | loop |
| `clap` | Happy clapping | 6 | loop |
| `salute` | Firefighter salute | 6 | one-shot or loop |

Phase 1 production order:
1. `surprised`
2. `clap`
3. `idle_tail`
4. `salute`
5. `sleepy`
6. `sulk`
7. `eat`
8. `happy_jump`

Reason:
- Start with actions that reveal face, arms, and body motion clearly.
- Keep harder full-body motion until the character identity is stable.

Phase 2 animations:

| id | action | target frames | playback |
| --- | --- | ---: | --- |
| `play_mischief` | Playful/mischievous movement | 6 | loop |
| `exercise` | Simple exercise motion | 6 to 8 | loop |
| `baseball_catch` | Catching a baseball fly ball | 8 | one-shot |
| `study` | Studying at a small book or desk-like pose | 6 | loop |
| `teacher` | Teacher-like explaining gesture | 6 | loop |
| `wipe_sweat` | Wiping sweat after effort | 6 | loop |

Phase 3 animations:

| id | action | target frames | playback |
| --- | --- | ---: | --- |
| `hose_spray` | Holding a fire hose and spraying water | 8 | loop |
| `searching` | Looking around as if searching for someone | 6 | loop |
| `fire_focus` | Becoming serious after noticing a small flame | 6 | one-shot |
| `gear_fix` | Adjusting firefighter cap/helmet | 6 | loop |
| `training` | Firefighter training drill | 8 | loop |
| `relieved` | Relieved after successful rescue | 6 | one-shot or loop |

Per-frame canvas:
- `192 x 208` pixels per frame.
- Sprite centered with consistent scale.
- Keep at least 8 px safe padding around the body where possible.
- Final row strips should be `frame_count * 192` wide and `208` high.

Generation note:
- Each animation should be generated as a row strip first.
- Approved strips can later be composed into a new atlas.
- The existing `spritesheet.webp` remains unchanged.

QA note:
- The first generated Phase 1 concept sheet is useful only as a visual draft.
- It contains labels, frame numbers, separator lines, shadows, and non-flat green background.
- Do not treat it as a final sprite strip.
- Final strips must be generated per action with no labels, no numbers, no separators, no shadows, and a flat removable background.
- Current `surprised-chromakey.png` and `clap-chromakey.png` are drafts only. They drift brighter than the source character, especially in the fur/face colors, and should not be accepted as final.
- Current `processed/*.png` outputs are rejected. The generated face/cheek details drift from the source, and palette remapping cannot repair shape/line-art drift.

Revised approach:
- Keep the original source atlas as the only accepted identity reference.
- Do not accept AI strips unless the face shape, cheek marks, cap, shirt, outline, and palette already match before post-processing.
- Use post-processing only for background removal and minor palette cleanup, not for rescuing mismatched art.
- Regenerate one action at a time and reject early if the first frame does not match the original standing frame.
