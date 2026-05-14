# Firefighter Pup Animation V2

This folder is a clean restart.

Do not use files from `rejected-first-pass` as production assets. They are retained only as examples of what failed:
- character became too bright
- cheek marks drifted from the source
- line art became too smooth
- chroma-key background left green edges
- post-processing could not repair mismatched face/line art

## Non-Negotiable Source Lock

Source atlas:
- `../spritesheet.webp`

The source atlas must not be modified.

Accepted output must preserve:
- same face shape
- same round cheek marks
- same cream fur tone
- same orange shirt tone
- same navy cap/collar tone
- same small yellow cap badge
- same dark outline weight
- same compact chibi body proportions
- same pixel-adjacent sprite feel

Reject output if:
- cheeks become stripes, smears, or different shapes
- fur becomes pale white or glossy
- outline becomes too smooth, too thick, or too soft
- cap shape changes noticeably
- shirt/collar design changes
- the first frame does not read as the same character as the source standing frame

## Production Rule

Generate or edit one action at a time.

For every action:
1. Generate only that action.
2. Save the raw result to `raw/`.
3. Compare the first frame against `references/standing.png`.
4. If identity fails, move on by regenerating, not by palette-rescuing.
5. Only after identity passes, remove background and normalize to frames.
6. Save accepted strips to `approved/`.

No Phase 2 or Phase 3 work starts until Phase 1 is accepted.

## Phase 1

| id | action | frames | type |
| --- | --- | ---: | --- |
| `idle_tail` | waiting with gentle tail wag | 4 | loop |
| `eat` | eating a small treat | 6 | loop |
| `sleepy` | sleepy/yawn | 5 | loop |
| `sulk` | pouting | 5 | loop |
| `surprised` | simple startled reaction | 6 | reaction |
| `happy_jump` | extremely happy bouncing | 8 | loop |
| `clap` | happy clapping | 6 | loop |
| `salute` | firefighter salute | 6 | gesture |

Recommended v2 order:
1. `idle_tail`
2. `salute`
3. `clap`
4. `surprised`
5. `sleepy`
6. `sulk`
7. `eat`
8. `happy_jump`

Reason:
- Start with small source-preserving motions.
- Delay expressions and props until identity lock is proven.

## Phase 2

| id | action | frames |
| --- | --- | ---: |
| `play_mischief` | playful/mischievous movement | 6 |
| `exercise` | simple exercise motion | 6 to 8 |
| `baseball_catch` | catching a baseball fly ball | 8 |
| `study` | studying | 6 |
| `teacher` | teacher-like explaining gesture | 6 |
| `wipe_sweat` | wiping sweat | 6 |

## Phase 3

| id | action | frames |
| --- | --- | ---: |
| `hose_spray` | holding a fire hose and spraying water | 8 |
| `searching` | looking around as if searching for someone | 6 |
| `fire_focus` | serious after noticing a small flame | 6 |
| `gear_fix` | adjusting firefighter cap/helmet | 6 |
| `training` | firefighter training drill | 8 |
| `relieved` | relieved after successful rescue | 6 |
