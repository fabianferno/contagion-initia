module contagion::attestations {
    use std::signer;
    use std::vector;
    use std::error;

    /// No attestation record exists for this player yet.
    const E_NO_RECORD: u64 = 1;
    /// Commitment bytes must be exactly 32 bytes.
    const E_BAD_COMMITMENT: u64 = 2;

    /// Status flag values. We store a u8 so the client can encode
    /// 0 = healthy, 1 = infected, without extra Move enums.
    const STATUS_HEALTHY: u8 = 0;
    const STATUS_INFECTED: u8 = 1;

    /// A single health attestation signed by a player.
    /// `commitment` is a 32-byte hash that binds the player id,
    /// game tick, status, and a server-issued nonce. The full hash
    /// lives off-chain; only the commitment is kept here.
    struct Attestation has copy, drop, store {
        session_id: u64,
        tick: u64,
        status: u8,
        commitment: vector<u8>,
        submitted_at: u64,
    }

    /// Per-player resource holding the player's latest attestation
    /// and a running history of every attestation they've ever signed.
    struct Ledger has key {
        latest: Attestation,
        history: vector<Attestation>,
        infected_count: u64,
        healthy_count: u64,
    }

    /// Global counter so we can sanity-check activity across the
    /// whole module from a single address.
    struct Stats has key {
        total_attestations: u64,
        total_infected: u64,
        total_healthy: u64,
    }

    /// Initialize the module-level counters under the publisher address.
    /// Auto-invoked by the MoveVM on publish; kept private per compiler rules.
    fun init_module(publisher: &signer) {
        let addr = signer::address_of(publisher);
        if (!exists<Stats>(addr)) {
            move_to(publisher, Stats {
                total_attestations: 0,
                total_infected: 0,
                total_healthy: 0,
            });
        };
    }

    /// Record a signed health attestation for the caller.
    /// Uses auto-sign from the frontend: the signer is always the
    /// player, and they're asserting (under their own signature) that
    /// the server-issued test returned `infected`/`healthy` at `tick`.
    public entry fun record_attestation(
        player: &signer,
        module_owner: address,
        session_id: u64,
        tick: u64,
        infected: bool,
        commitment: vector<u8>,
    ) acquires Ledger, Stats {
        assert!(vector::length(&commitment) == 32, error::invalid_argument(E_BAD_COMMITMENT));

        let status = if (infected) { STATUS_INFECTED } else { STATUS_HEALTHY };
        let addr = signer::address_of(player);

        let att = Attestation {
            session_id,
            tick,
            status,
            commitment,
            submitted_at: tick,
        };

        if (!exists<Ledger>(addr)) {
            let history = vector::empty<Attestation>();
            vector::push_back(&mut history, att);
            move_to(player, Ledger {
                latest: att,
                history,
                infected_count: if (infected) { 1 } else { 0 },
                healthy_count: if (infected) { 0 } else { 1 },
            });
        } else {
            let ledger = borrow_global_mut<Ledger>(addr);
            ledger.latest = att;
            vector::push_back(&mut ledger.history, att);
            if (infected) {
                ledger.infected_count = ledger.infected_count + 1;
            } else {
                ledger.healthy_count = ledger.healthy_count + 1;
            };
        };

        if (exists<Stats>(module_owner)) {
            let stats = borrow_global_mut<Stats>(module_owner);
            stats.total_attestations = stats.total_attestations + 1;
            if (infected) {
                stats.total_infected = stats.total_infected + 1;
            } else {
                stats.total_healthy = stats.total_healthy + 1;
            };
        };
    }

    #[view]
    public fun latest_attestation(player: address): Attestation acquires Ledger {
        assert!(exists<Ledger>(player), error::not_found(E_NO_RECORD));
        *&borrow_global<Ledger>(player).latest
    }

    #[view]
    public fun history_len(player: address): u64 acquires Ledger {
        if (!exists<Ledger>(player)) { 0 } else { vector::length(&borrow_global<Ledger>(player).history) }
    }

    #[view]
    public fun player_counts(player: address): (u64, u64) acquires Ledger {
        if (!exists<Ledger>(player)) {
            (0, 0)
        } else {
            let l = borrow_global<Ledger>(player);
            (l.healthy_count, l.infected_count)
        }
    }

    #[view]
    public fun global_stats(module_owner: address): (u64, u64, u64) acquires Stats {
        if (!exists<Stats>(module_owner)) {
            (0, 0, 0)
        } else {
            let s = borrow_global<Stats>(module_owner);
            (s.total_attestations, s.total_healthy, s.total_infected)
        }
    }

    #[test_only]
    use std::vector as V;

    #[test(publisher = @contagion, alice = @0xA11CE)]
    fun records_and_counts(publisher: &signer, alice: &signer) acquires Ledger, Stats {
        init_module(publisher);

        let commit = V::empty<u8>();
        let i = 0;
        while (i < 32) { V::push_back(&mut commit, (i as u8)); i = i + 1; };

        record_attestation(alice, signer::address_of(publisher), 1, 100, false, commit);
        record_attestation(alice, signer::address_of(publisher), 1, 110, true, commit);

        let (healthy, infected) = player_counts(signer::address_of(alice));
        assert!(healthy == 1, 0);
        assert!(infected == 1, 1);

        let (total, g_healthy, g_infected) = global_stats(signer::address_of(publisher));
        assert!(total == 2, 2);
        assert!(g_healthy == 1, 3);
        assert!(g_infected == 1, 4);
    }
}
