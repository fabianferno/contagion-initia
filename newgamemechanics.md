
PRODUCT REQUIREMENTS DOCUMENT
Contagion
A Zero-Knowledge Social Deduction .io Game

Version 1.0  |  February 2026
Status: Ready for Development


1. Overview
Contagion is a persistent, real-time, multiplayer social deduction game played in the browser. Players join a shared 2D map as dots. One player is secretly patient zero. Infection spreads silently through proximity. Players don't know who is infected unless they investigate, test themselves, and collaborate to identify threats. Zero-knowledge proofs are used to let players prove their health status without revealing anything else.
The game runs continuously in an .io-game style with no rounds or restarts. Players flow in and out. Points accumulate for time alive, successful accusations, infecting others, and collecting orbs scattered around the map.

2. Core Game Loop
The 30-second pitch: One persistent room. Everyone drops in as a dot on a shared 2D map. One player is secretly patient zero. Infection spreads by proximity. You know immediately if you get infected. Healthy players want to survive and identify the infected. Infected players want to spread and hide. No rounds. No restarts. The infection is always spreading.
2.1 Player Lifecycle
	•	Join: Player enters the game and is assigned a random name from a dictionary (e.g., CrimsonBadger, SilentOwl). They appear on the map as a dot.
	•	Play: Move around the map in real-time. Collect orbs for points. Investigate other players. Visit the testing camp. Accuse suspicious players.
	•	Death & Respawn: If vote-kicked, the player is killed and their infection status is revealed. They respawn immediately with a new random name, healthy, with no link to their previous identity. Their old name persists in other players' proximity logs.
2.2 Game State
Public state (everyone sees): Player positions on the map (real-time), player names, vote-kick results, who has been eliminated, timer, and the leaderboard.
Private state (per player): Infection status (healthy or infected). An infected player knows immediately upon infection. Healthy players can only confirm their status by testing at the testing camp.
Key design principle: Position is PUBLIC. Infection status is PRIVATE. This is what makes the game social. You can see everyone moving around. You can see who is clustering together. But you cannot see who is sick.

3. Infection Mechanics
3.1 Patient Zero Selection
	•	Patient zero is selected by the game server only after at least 3 players have joined the game.
	•	Selection is random, server-side. No ZK proof is needed for this step.
	•	The selected player is notified that they are infected. No other player or system component is told.
	•	If all infected players are killed (via vote-kick), the server automatically selects a new patient zero from the healthy player pool, provided there are at least 3 players in the game.
3.2 How Infection Spreads
	•	Every game tick, the server checks proximity between all players.
	•	If an infected player is within radius R of a healthy player for T consecutive ticks, the infection transfers.
	•	The newly infected player is notified immediately. Their goal shifts to infecting others and avoiding detection.
	•	Infection spread is computed server-side. No ZK proof is needed for this.

4. The Map
The map is a bounded 2D space. The key landmark is the Testing Camp, located at the center of the map.
4.1 Testing Camp
	•	Located at the center of the map. Visually distinct.
	•	Players must physically walk their dot to the testing camp to generate a health proof.
	•	Deliberate design tension: The center of the map is high-traffic, meaning traveling to get tested exposes you to potential infection along the way.
4.2 Orbs / Collectibles
	•	Point orbs spawn randomly across the map at regular intervals.
	•	Any player (healthy or infected) can collect them by moving over them.
	•	This incentivizes movement across the map and prevents players from camping in corners. It also gives infected players a legitimate reason to be moving around near healthy players.

5. Player Actions
5.1 Move
Standard real-time movement. Everyone sees your position. This is always public.
5.2 Test Yourself (at Testing Camp)
	•	Walk to the testing camp in the center of the map.
	•	Generate a ZK proof of your health status at the current tick. The proof attests: this player was HEALTHY (or INFECTED) at tick X.
	•	Cooldown: A player can only generate a new proof once every 2 minutes.
	•	Only you see the result when it is generated. You choose what to do with it.
5.3 View Proximity List
	•	Click on any player to see their recent proximity history: a list of the last 6 player names they have been in close proximity with.
	•	This is the primary investigation mechanic. If you see a name in someone's proximity list that was previously killed and revealed as infected, that person becomes a suspect.
	•	Dead players' old names persist in proximity logs. This is how infection chains are traceable even after respawn.
5.4 Accuse
	•	A player can accuse another player by clicking on them and initiating an accusation.
	•	When accused, the accused player's most recent health proof is displayed above their character's head, along with the timestamp of when the proof was generated.
	•	If the accused has no proof (never tested or proof is expired), this is shown as well. Voters decide based on available evidence.
	•	A vote is initiated. If 30% or more of current players vote to kick, the accused is killed and their true infection status is publicly revealed. They respawn healthy with a new name.
	•	If the accusation fails (less than 30% votes), the accuser loses points. This prevents frivolous accusations.
5.5 Collect Orbs
Move over randomly spawning point orbs on the map to collect them. Available to all players.

6. Scoring System
Action
Who Earns
Points
Staying alive (per tick)
Healthy players
+1 per tick (configurable)
Successful accusation (voted out an infected player)
Accuser
+X points (configurable)
Infecting another player
Infected player
+Y points per infection
Collecting an orb
Any player
+Z points per orb
Failed accusation (voted out a healthy player or vote didn't pass)
Accuser
-W points (penalty)

A persistent leaderboard tracks cumulative points. Points carry across lives (respawns). The leaderboard is visible to all players at all times.

7. Zero-Knowledge Proof Scope
ZK proofs are scoped tightly to one purpose: proving health status at a point in time. Everything else (infection spread, patient zero selection, proximity tracking, voting) is handled server-side.
7.1 Health Proof Circuit
Purpose: Allow a player to generate a cryptographic proof that they were HEALTHY or INFECTED at a specific game tick, without revealing any other information.
Inputs: Player ID, player's infection status (from committed private state), current game tick.
Output: A proof that the player's status was HEALTHY or INFECTED at tick X. This proof is verifiable by anyone.
Where it is used:
	•	At the testing camp: player generates a proof of their current health status.
	•	During accusations: the accused player's most recent proof is displayed publicly with its timestamp.
7.2 Why ZK Matters Here
	•	Without ZK, the server could lie about a player's status, or a player could forge a false health claim.
	•	The proof is timestamped. Other players can see when the proof was generated and judge how trustworthy it is. A proof from 90 seconds ago is less trustworthy than one from 10 seconds ago.
	•	This is the one place where trustlessness adds real gameplay value. The rest of the game can be server-authoritative without losing the social deduction dynamic.
7.3 What Does NOT Need ZK
Mechanic
Handled By
Rationale
Patient zero selection
Server
Random selection after 3 players join. No trust issue.
Infection spread
Server
Proximity checks computed server-side each tick.
Proximity tracking
Server
Rolling list of last 6 names near each player.
Voting / accusations
Server
Vote tallying is straightforward.
Orb spawning / collection
Server
No trust-sensitive logic.
Respawn / name assignment
Server
Random dictionary name, no linkage needed.

8. Social Dynamics (Why It's Fun)
The game is mechanically simple. The depth is behavioral:
	•	Proximity history is public. Everyone can see who was near who. If you see a killed-infected name in someone's proximity list, the social pressure starts.
	•	Proof staleness creates tension. A health proof is trustworthy, but it decays. Someone flashing a proof from 90 seconds ago while standing in a crowd? That proof means less and less.
	•	No proof is a signal. If someone has never tested or their proof is ancient, that's suspicious. But maybe they just haven't had time to walk to the camp. Ambiguity is the game.
	•	Infected players act normal. They collect orbs. They accuse others. They walk around casually. Classic social deduction with cryptographic teeth.
	•	The infection graph is hidden but deducible. If you know A was infected and A was near B and C, then B and C are suspects. But the deduction tree gets messy fast.
	•	Respawn breaks identity links. A killed player returns with a new name. But their old name's ghost lingers in proximity logs, creating traceable infection trails.
	•	Orbs force movement. Nobody can safely camp. Infected players have a plausible reason to be near anyone. Healthy players have to take risks to earn points.

9. Technical Architecture
9.1 High-Level Architecture
The system has three layers: the browser client, the game server, and the ZK proving layer. The server manages all game state except health proofs. The client renders the game and handles user input. The ZK layer runs client-side in the browser for proof generation.
Layer
Responsibility
Trust Level
Client (Browser)
Renders 2D map, handles input, generates ZK proofs client-side
Untrusted (proofs are verified)
Game Server
Real-time position sync, infection spread, proximity tracking, voting, scoring, patient zero selection
Trusted (server-authoritative)
ZK Layer (Client-side)
Health proof generation and verification
Trustless (cryptographic verification)

9.2 Suggested Stack
Component
Suggested Tool
Notes
ZK Circuits
Noir (Aztec) or Circom + snarkjs
Noir has Rust-like syntax, fast iteration. Circom has more tutorials.
Frontend
Phaser.js or raw HTML5 Canvas
Lightweight 2D rendering, fast to prototype.
Real-time Sync
Socket.io or PartyKit
WebSocket-based multiplayer. PartyKit is simpler for hackathons.
Backend
Node.js
Handles game loop, infection logic, proximity, voting.
ZK Proving (client)
snarkjs (WASM) or Noir WASM
Proofs generated in the browser. No server knowledge of health state.
Database
In-memory (Redis or plain JS objects)
Game state is ephemeral. No persistence needed beyond session.

9.3 Key WebSocket Events
Event
Direction
Payload
player:join
Client → Server
Player connects, server assigns random name.
player:move
Client → Server
Position update (x, y).
state:sync
Server → Client
All player positions, orb locations, active votes.
infection:notify
Server → Client (private)
You have been infected.
test:request
Client → Server
Player requests health data for ZK proof generation.
test:proof
Client → Server
Player submits generated ZK proof for storage.
player:inspect
Client → Server
Request proximity list for a target player.
accuse:start
Client → Server
Initiate accusation against a target player.
vote:cast
Client → Server
Vote yes/no on active accusation.
vote:result
Server → All
Accusation result, accused player's proof displayed.
player:killed
Server → All
Player eliminated, true status revealed.
player:respawn
Server → Client (private)
New name assigned, healthy status.
orb:spawn
Server → All
New orb location.
orb:collect
Client → Server
Player collected an orb.

10. Data Model
10.1 Player Object
Field
Type
Notes
id
string (UUID)
Unique per connection session.
name
string
Random dictionary name. Changes on respawn.
position
{ x: number, y: number }
Real-time, public.
isInfected
boolean
Server-side private state.
infectedAt
number (tick) | null
Tick when infection occurred.
lastProof
{ status, tick, proof } | null
Most recent ZK health proof.
lastTestTime
number (timestamp)
For enforcing 2-minute cooldown.
proximityLog
string[] (max 6)
Rolling list of last 6 names in close proximity.
points
number
Cumulative score across lives.
isAlive
boolean
False between death and respawn.

10.2 Game State
Field
Type
Notes
players
Map<id, Player>
All active players.
orbs
Array<{ x, y, value }>
Currently spawned orbs on the map.
currentTick
number
Game tick counter.
activeAccusation
{ accuser, accused, votes } | null
One active vote at a time (or per accused).
deadNames
Map<name, infectionStatus>
Killed players' names and their revealed status. Used for proximity log investigation.
patientZeroAssigned
boolean
Whether initial patient zero has been selected.

11. Configurable Parameters
Parameter
Default
Description
INFECTION_RADIUS
R (e.g., 50px)
Proximity radius for infection spread.
INFECTION_TICKS
T (e.g., 10 ticks)
Consecutive ticks in proximity to trigger infection.
TEST_COOLDOWN
120 seconds
Minimum time between health proof generations.
VOTE_THRESHOLD
30%
Percentage of players needed to vote-kick.
VOTE_DURATION
30 seconds
Time window for voting on an accusation.
MIN_PLAYERS_FOR_PZ
3
Minimum players before patient zero is selected.
PROXIMITY_LOG_SIZE
6
Number of recent names stored in proximity log.
ORB_SPAWN_INTERVAL
Configurable
How often new orbs appear on the map.
POINTS_PER_TICK
1
Points healthy players earn per game tick.
POINTS_PER_INFECTION
Configurable
Points infected players earn per infection.
POINTS_PER_ACCUSATION
Configurable
Points earned for successful accusation.
POINTS_PENALTY_FALSE_ACCUSATION
Configurable
Points lost for failed accusation.
POINTS_PER_ORB
Configurable
Points earned per orb collected.

12. Hackathon Scoping
12.1 MVP (Must Ship)
	•	2D shared room with real-time position sync via WebSockets.
	•	Random dictionary name assignment on join.
	•	Server-side patient zero selection after 3 players join.
	•	Proximity-based infection spread (server-side, per tick).
	•	Infected player is notified immediately.
	•	Testing camp at center of map with ZK health proof generation (2-minute cooldown).
	•	Proximity list (last 6 names) viewable by clicking on any player.
	•	Accusation system: show proof above head, 30% vote threshold, kill and respawn with new name.
	•	Point penalty for failed accusations.
	•	Basic scoring: time alive, infections caused, successful accusations, orbs.
	•	Orb spawning and collection.
	•	Auto-select new patient zero when all infected are killed.
	•	Leaderboard.
12.2 Nice to Have (If Time Permits)
	•	Incubation delay (infected player doesn't know for a few ticks after contact).
	•	Quarantine / safe zones with limited capacity.
	•	Visual infection trail effects.
	•	Chat or emote system.
	•	Sound effects and ambient audio.
	•	On-chain settlement of proofs.
	•	Mobile-responsive controls.
12.3 Demo Tips
	•	Lead with: "The server doesn't know who's infected." That's the killer line. It shows you've built something fundamentally cheat-proof.
	•	The money moment: If during the demo someone accuses someone else and it leads to a forced reveal, that's the clip. That's what judges remember.
	•	Run 5+ browser tabs simultaneously to simulate a real multiplayer session.

13. Open Questions for Development
	•	What dictionary should be used for random name generation? (adjective + animal? fantasy names? etc.)
	•	Should there be a maximum number of players per room? If so, what's the cap?
	•	How should the map scale with player count?
	•	Should accusation voting be anonymous or public?
	•	Can a player be accused while already under an active vote?
	•	What happens if a player disconnects mid-game? Grace period or immediate removal?
	•	Should orb values vary (some worth more than others)?
	•	Should there be visual indicators for the testing camp cooldown?
	•	How should the proximity detection handle edge cases (players moving in and out of range rapidly)?
