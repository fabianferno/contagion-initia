# Infection Dynamics

How infection affects player behavior, social deduction, and emergent gameplay.

---

## 1. Infection as Hidden State

- **Position is public.** Everyone sees where everyone is.
- **Infection status is private.** Only the infected player knows they are infected (until killed and revealed).
- This asymmetry creates the core tension: you can see movement patterns and clustering, but not who is sick.

---

## 2. Infected Player Behavior

- **Goal shift:** Upon infection, the player's goal shifts from survival to spreading and avoiding detection.
- **Act normal:** Infected players do task, accuse others, and move casually. They have no visible tell.
- **Plausible deniability:** tasks give infected players a legitimate reason to be near healthy players.
- **Accuse to deflect:** Infected can accuse healthy players to create confusion and draw suspicion elsewhere.

---

## 3. Healthy Player Behavior

- **Survival:** Stay alive, avoid proximity to suspected infected.
- **Investigation:** Use proximity lists to trace who was near whom. If a killed-infected name appears in someone's list, that person becomes a suspect.
- **Test to prove:** Walk to the camp to get a timestamped status. A recent test is more trustworthy than an old one.
- **Accuse carefully:** Failed accusations cost points. Evidence (proximity + test staleness) guides who to accuse.

---

## 4. Infection Graph (Hidden but Deducible)

- The actual infection chain is never shown. Players infer it from:
  - Who was near whom (proximity logs)
  - Who has been killed and revealed as infected
  - Who has been killed and revealed as healthy
- **Example:** If A was infected and killed, and A was near B and C, then B and C are suspects. The deduction tree gets messy as more players are involved.
- **Respawn breaks links:** A killed player returns with a new name. Their old name's ghost lingers in proximity logs, so infection trails remain traceable even after respawn.

---

## 5. Proximity as Evidence

- **Proximity history is public.** Click any player to see the last 6 names they were near.
- **Dead names persist.** If "CrimsonBadger" was killed and revealed infected, and "SilentOwl" has CrimsonBadger in their proximity list, SilentOwl is a suspect.
- **High-traffic center:** The testing camp is at the center. Traveling there exposes you to infection. Proximity logs near the camp are especially dense and ambiguous.

---

## 6. Test Staleness

- **Recent test = trustworthy.** A proof from 10 seconds ago carries strong weight.
- **Old test = less trustworthy.** A proof from 90 seconds ago is less convincing—they could have been infected since.
- **No test = signal.** Never tested or very old test is suspicious, but could mean they haven't reached the camp yet.
- **Ambiguity is the game.** Players must interpret incomplete evidence.

---

## 7. Respawn and Identity

- **Respawn breaks identity.** Killed player returns with a new random name, healthy, with no link to their previous identity.
- **Old name lingers.** Dead players' names persist in proximity logs. This is how infection chains remain traceable even after respawn.
- **No permanent link.** You cannot tell that "NewPlayer" is the same person as "CrimsonBadger" who was just killed.
