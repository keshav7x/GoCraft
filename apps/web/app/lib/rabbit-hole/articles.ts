/* ------------------------------------------------------------------ */
/* Rabbit Hole article dataset.                                        */
/* Local, strongly typed sample content — NOT connected to a backend.  */
/* Kept separate from UI so it can later be replaced by a              */
/* database-backed implementation without touching components.         */
/* No authors, dates, or popularity metrics are fabricated.            */
/* ------------------------------------------------------------------ */

export const ARTICLE_CATEGORIES = [
  "System Design",
  "Backend",
  "Go",
  "Databases",
  "Architecture",
  "Programming",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export type ArticleBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; filename?: string; code: string }
  | { type: "callout"; tone: "info" | "tip" | "warning"; text: string };

export type Article = {
  /** Route id, also used in /dashboard/rabbit-hole/[slug]. */
  slug: string;
  title: string;
  description: string;
  category: ArticleCategory;
  readingMinutes: number;
  /** Marks the article shown in the featured slot. */
  featured?: boolean;
  blocks: ArticleBlock[];
};

const ARTICLES: Article[] = [
  {
    slug: "url-shorteners-at-scale",
    title: "How URL shorteners work at scale",
    description:
      "Turning long URLs into tiny keys sounds trivial until you factor in billions of reads, hot keys, and collision-safe encoding.",
    category: "System Design",
    readingMinutes: 9,
    featured: true,
    blocks: [
      {
        type: "paragraph",
        text: "A URL shortener is a lookup table: a short key maps to a long URL, and the read path is a single point lookup followed by a redirect. The interesting engineering is not the redirect — it is generating keys that are short, unique, and cheap to issue when writes are bursty and reads outnumber writes by orders of magnitude.",
      },
      { type: "heading", text: "The mapping" },
      {
        type: "paragraph",
        text: "Two approaches dominate. You can hash the long URL and truncate, which risks collisions, or you can issue keys from a counter and encode them. Seven base-62 characters give roughly 3.5 trillion unique keys, which is more headroom than most products will ever need.",
      },
      {
        type: "code",
        filename: "base62.go",
        code: `package main

import "strings"

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

// encodeID turns a monotonically increasing id into a short key.
func encodeID(id uint64) string {
	if id == 0 {
		return alphabet[:1]
	}
	var buf [12]byte
	i := len(buf)
	for id > 0 {
		i--
		buf[i] = alphabet[id%62]
		id /= 62
	}
	return string(buf[i:])
}`,
      },
      { type: "heading", text: "Serving the read path" },
      {
        type: "list",
        items: [
          "Cache the hottest keys in memory or Redis — the database should be the source of truth, not the per-request path.",
          "301 redirects are cached aggressively by browsers but hide analytics; 302 keeps you in control at the cost of an extra round trip.",
          "Precompute the full redirect response if the target never changes — most keys are effectively immutable.",
        ],
      },
      {
        type: "callout",
        tone: "tip",
        text: "If you hash and collide, store the full original URL alongside the key and rehash with a salt on conflict. Never silently overwrite an existing mapping.",
      },
      { type: "heading", text: "Issuing keys without a hotspot" },
      {
        type: "paragraph",
        text: "A single auto-increment column works until every write lands on one row. Range allocation sidesteps this: each app instance reserves a block of ids, so the counter advances once per block instead of once per request. Timestamp-based ids (snowflake-style) trade a little coordination for natural ordering.",
      },
    ],
  },
  {
    slug: "database-indexes-trade-offs",
    title: "Database indexes and their trade-offs",
    description:
      "Indexes make reads fast and writes slower. Understanding B-tree structure, selectivity, and composite key order is what keeps that trade honest.",
    category: "Databases",
    readingMinutes: 11,
    blocks: [
      {
        type: "paragraph",
        text: "An index is an auxiliary structure the database maintains alongside your table so it can find rows without a full scan. Every index you add is extra work on every insert, update, and delete — plus disk — so the goal is not more indexes, it is the right ones.",
      },
      { type: "heading", text: "B-trees and covering indexes" },
      {
        type: "paragraph",
        text: "Most OLTP indexes are B-trees: a shallow, wide tree where each level holds many keys, so a lookup is three or four page reads even for huge tables. Leaves hold pointers to rows — unless the index already contains every column the query needs, in which case the database answers from the index alone. That is a covering index, and it removes table access entirely.",
      },
      {
        type: "code",
        filename: "schema.sql",
        code: `-- Composite index: column order matters (leftmost prefix rule).
CREATE INDEX idx_orders_customer_status
    ON orders (customer_id, status, created_at);

-- This query uses it:
--   SELECT id FROM orders
--   WHERE customer_id = $1 AND status = $2
--   ORDER BY created_at DESC LIMIT 20;`,
      },
      { type: "heading", text: "The costs you pay" },
      {
        type: "list",
        items: [
          "Write amplification: every insert updates each affected index, not just the table.",
          "Space: each index is a full copy of its keys plus pointers.",
          "Planning time: more candidate indexes can push the query planner toward bad choices.",
          "Low-cardinality columns (a boolean, a status with three values) rarely pay for themselves on their own.",
        ],
      },
      {
        type: "paragraph",
        text: "Selectivity decides who wins: an index on a column that splits your table into two huge buckets rarely filters anything. Composite indexes earn their keep when they match the query's filter, order, and limit together — put the equality-filtered column first, then the range or sort column.",
      },
      {
        type: "callout",
        tone: "warning",
        text: "Indexing every column trades write throughput and disk for reads you may not have. Read your query patterns first, then index.",
      },
    ],
  },
  {
    slug: "redis-internals-caching",
    title: "Redis internals and caching strategies",
    description:
      "Why a single-threaded in-memory store is fast, how its data structures are encoded, and how to cache without stampedes.",
    category: "Backend",
    readingMinutes: 10,
    blocks: [
      {
        type: "paragraph",
        text: "Redis keeps everything in memory and serves commands from a single-threaded event loop. Because one thread owns the data structures, there is no lock contention on a key — a read-modify-write sequence like INCR is atomic by construction, not by mutex.",
      },
      { type: "heading", text: "Data structures under the keys" },
      {
        type: "list",
        items: [
          "Strings are length-prefixed buffers (SDS) with O(1) length — no trailing-newline rescanning.",
          "Hashes and lists start compact (listpack-style encodings) and upgrade to linked or skiplist forms when they grow, keeping small keys cheap.",
          "Sorted sets are a skiplist plus a hash map, giving O(log N) rank queries and range scans in one structure.",
        ],
      },
      { type: "heading", text: "Durability: fast, then honest" },
      {
        type: "paragraph",
        text: "RDB gives point-in-time snapshots on a fork schedule; AOF logs every write with configurable fsync policy (every write, every second, or never). They answer different questions: snapshots are fine for caches, an AOF with fsync=always is what you treat as a source of truth.",
      },
      { type: "heading", text: "Cache-aside without stampedes" },
      {
        type: "paragraph",
        text: "The application owns the cache: on a miss it loads from the database and writes the entry back. The failure mode is a stampede — a popular key expires and hundreds of requests all hit the database at once. A short-lived lock makes exactly one request rebuild the entry while the others wait or serve stale.",
      },
      {
        type: "code",
        filename: "cache.go",
        code: `// getOrLoad rebuilds a hot entry exactly once after expiry.
func (c *Cache) getOrLoad(key string, load func() (string, error)) (string, error) {
	if v, ok := c.rdb.Get(ctx, key).Result(); ok {
		return v, nil
	}

	lease := "lease-" + strconv.FormatInt(time.Now().UnixNano(), 36)
	ok, err := c.rdb.SetNX(ctx, "lock:"+key, lease, 5*time.Second).Result()
	if err != nil {
		return "", err
	}

	if !ok {
		// Someone else is rebuilding; poll briefly instead of hammering the DB.
		return c.waitForValue(key)
	}

	v, err := load()
	if err != nil {
		return "", err
	}
	// Jitter the TTL so popular keys do not expire together.
	ttl := 5*time.Minute + time.Duration(rand.Intn(60))*time.Second
	c.rdb.Set(ctx, key, v, ttl)
	return v, nil
}`,
      },
      {
        type: "callout",
        tone: "info",
        text: "A Redis instance with maxmemory and noeviction configured starts rejecting writes once it fills. Pick an eviction policy (allkeys-lru, volatile-ttl, …) deliberately — eviction of the wrong keys is an outage with a different name.",
      },
    ],
  },
  {
    slug: "designing-rate-limiters",
    title: "Designing rate limiters",
    description:
      "Fixed windows leak bursts across boundaries; sliding logs cost memory. Picking an algorithm means knowing exactly which imperfection you can live with.",
    category: "System Design",
    readingMinutes: 8,
    blocks: [
      {
        type: "paragraph",
        text: "A rate limiter answers one question per request: is this client allowed right now? Every algorithm is a different way of counting cheaply while approximating a smooth limit — the differences are in burst behavior, memory, and how badly they behave at window edges.",
      },
      { type: "heading", text: "The usual suspects" },
      {
        type: "list",
        items: [
          "Fixed window: one counter per window. Simple, but a client can send the limit at the end of one window and again at the start of the next — twice the intended burst.",
          "Sliding window log: keep timestamps of every request. Exact, but memory grows with the limit itself.",
          "Sliding window counter: weight the previous window by how much of it overlaps the current one. Good accuracy for two counters.",
          "Token bucket: tokens refill continuously at a steady rate; the bucket size defines the allowed burst. This is the model behind most Go and cloud limiters.",
        ],
      },
      {
        type: "code",
        filename: "limiter.go",
        code: `// tokenBucket allows burst requests, then refills at rate per second.
type tokenBucket struct {
	mu     sync.Mutex
	tokens float64
	burst  float64
	rate   float64 // tokens per second
	last   time.Time
}

func (b *tokenBucket) allow(now time.Time) bool {
	b.mu.Lock()
	defer b.mu.Unlock()

	elapsed := now.Sub(b.last).Seconds()
	b.last = now
	b.tokens = min(b.burst, b.tokens+elapsed*b.rate)

	if b.tokens < 1 {
		return false
	}
	b.tokens--
	return true
}`,
      },
      { type: "heading", text: "Going distributed" },
      {
        type: "paragraph",
        text: "Once limiters live across instances, the count has to live somewhere shared — typically a Redis counter with EXPIRE, or a Lua script that increments and checks atomically so two nodes cannot both see one remaining token. Clock skew between nodes is why window boundaries are computed on the store's clock, not the caller's.",
      },
      {
        type: "callout",
        tone: "warning",
        text: "Decide explicitly what happens when the limiter's store is down: fail open (availability over strict limits) or fail closed (limits over availability). The wrong default shows up as an outage on your busiest day.",
      },
    ],
  },
  {
    slug: "goroutines-go-concurrency",
    title: "Goroutines and Go concurrency",
    description:
      "The M:N scheduler, channels versus mutexes, and the handful of mistakes that turn healthy Go services into leaky ones.",
    category: "Go",
    readingMinutes: 10,
    blocks: [
      {
        type: "paragraph",
        text: "A goroutine is not an OS thread. The Go runtime multiplexes many goroutines onto a smaller pool of threads (the M:N scheduler), which is why starting tens of thousands of them costs a few kilobytes each instead of a megabyte stack per thread.",
      },
      { type: "heading", text: "Scheduling in one paragraph" },
      {
        type: "paragraph",
        text: "Each goroutine is a G, each OS thread an M, and each logical processor a P. Run queues live on the Ps, work-stealing keeps them balanced, and when a goroutine makes a blocking syscall its M is detached so other goroutines on that P keep running. GOMAXPROCS sets how many Ps execute Go code simultaneously — by default, the number of CPUs.",
      },
      { type: "heading", text: "Sharing memory the sanctioned way" },
      {
        type: "paragraph",
        text: "Channels give you a happens-before edge: a value sent on a channel is visible to whoever receives it. That makes \"share memory by communicating\" correct without locks. When the shared state is a struct with independent fields, a mutex is simpler — and often faster than serializing everything through one channel.",
      },
      {
        type: "code",
        filename: "workers.go",
        code: `// A bounded worker pool that stops cleanly on cancellation.
func run(ctx context.Context, jobs []Job, workers int) error {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	jobCh := make(chan Job)
	errCh := make(chan error, 1)

	var wg sync.WaitGroup
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for job := range jobCh {
				if err := ctx.Err(); err != nil {
					return
				}
				if err := job.Run(ctx); err != nil {
					select {
					case errCh <- err:
						cancel()
					default:
					}
					return
				}
			}
		}()
	}

	go func() {
		defer close(jobCh)
		for _, job := range jobs {
			select {
			case jobCh <- job:
			case <-ctx.Done():
				return
			}
		}
	}()

	wg.Wait()
	select {
	case err := <-errCh:
		return err
	default:
		return ctx.Err()
	}
}`,
      },
      { type: "heading", text: "The mistakes that actually happen" },
      {
        type: "list",
        items: [
          "Goroutine leaks: a goroutine blocked forever on a channel send or an unclosed response body, usually because cancellation never reaches it.",
          "Unbounded fan-out: launching one goroutine per item with no semaphore turns a traffic spike into memory pressure.",
          "Ranging over a channel nobody writes to: the loop never exits; pair every range with a close.",
          "Data races on struct fields shared across goroutines — a mutex or channel makes the field safe, and `go test -race` proves it.",
        ],
      },
      {
        type: "callout",
        tone: "tip",
        text: "Every goroutine should have an owner: a WaitGroup, a context, or a lifecycle that guarantees it terminates. If nobody can say who stops it, it is already a leak.",
      },
    ],
  },
  {
    slug: "sql-transactions-isolation-levels",
    title: "SQL transactions and isolation levels",
    description:
      "Dirty reads, phantoms, and write skew mapped to the four isolation levels — and what MVCC is actually hiding under them.",
    category: "Databases",
    readingMinutes: 9,
    blocks: [
      {
        type: "paragraph",
        text: "A transaction promises atomicity and durability directly; isolation is the interesting one, because it defines which anomalies other transactions are allowed to observe. The SQL standard lists four levels, and each is named after the anomaly it stops.",
      },
      { type: "heading", text: "Levels and the anomalies they permit" },
      {
        type: "list",
        items: [
          "Read uncommitted: dirty reads allowed — you can see another transaction's uncommitted writes.",
          "Read committed: blocks dirty reads, but the same row can change between two reads in one transaction (non-repeatable reads).",
          "Repeatable reads: the snapshot is stable, but new rows matching your query can still appear (phantoms). Postgres adds snapshot isolation here, which also closes many write-skew cases.",
          "Serializable: transactions behave as if run one at a time. Correct by default, and the most expensive.",
        ],
      },
      { type: "heading", text: "What MVCC changes" },
      {
        type: "paragraph",
        text: "Multi-version concurrency control gives readers a snapshot of row versions instead of taking locks — readers do not block writers and writers do not block readers. The cost shows up later: dead tuples pile up until vacuum recycles them, and long-running transactions hold back cleanup for everyone.",
      },
      {
        type: "code",
        filename: "transfer.go",
        code: `// Move funds in one transaction; deadlock or serialization failures retry.
func transfer(from, to string, amount int) error {
	for attempt := 0; attempt < 3; attempt++ {
		err := db.RunTx(func(tx *sql.Tx) error {
			// Lock both rows in a deterministic order to avoid deadlocks.
			var fromBal, toBal int
			if err := tx.QueryRow(
				"SELECT balance FROM accounts WHERE id = $1 ORDER BY id",
				from,
			).Scan(&fromBal); err != nil {
				return err
			}
			if err := tx.QueryRow(
				"SELECT balance FROM accounts WHERE id = $1 ORDER BY id",
				to,
			).Scan(&toBal); err != nil {
				return err
			}
			if fromBal < amount {
				return ErrInsufficientFunds
			}
			_, err := tx.Exec(
				"UPDATE accounts SET balance = balance - $1 WHERE id = $2",
				amount, from,
			)
			if err != nil {
				return err
			}
			_, err = tx.Exec(
				"UPDATE accounts SET balance = balance + $1 WHERE id = $2",
				amount, to,
			)
			return err
		})
		if err == nil {
			return nil
		}
		if !isRetryable(err) {
			return err
		}
	}
	return ErrTooManyRetries
}`,
      },
      {
        type: "callout",
        tone: "info",
        text: "Postgres defaults to read committed; MySQL defaults to repeatable read. Cross the two in your head once and you will spend an afternoon debugging a 'phantom' that is actually a default setting.",
      },
    ],
  },
  {
    slug: "monoliths-vs-microservices",
    title: "Monoliths vs. microservices",
    description:
      "Deployment independence is the real prize. Everything else — team size, failure domains, data ownership — decides when to pay for it.",
    category: "Architecture",
    readingMinutes: 7,
    blocks: [
      {
        type: "paragraph",
        text: "The choice is not code style, it is operational topology. A monolith ships as one unit with shared memory and one database; microservices ship independently and pay for every interaction with a network call. Both are correct at the right scale.",
      },
      { type: "heading", text: "When a monolith wins" },
      {
        type: "list",
        items: [
          "Early products where the domain boundaries are still guesses — splitting too early hardens the wrong ones.",
          "Small teams: one deploy pipeline, one repo, local function calls instead of retries and timeouts.",
          "Transactions that genuinely span entities — they are trivial in one process and awkward across services.",
        ],
      },
      { type: "heading", text: "When services win" },
      {
        type: "list",
        items: [
          "Independent scaling: the image processor should not deploy alongside the read-heavy API just because they share a repo.",
          "Team ownership: a service boundary is a contract two teams can evolve separately.",
          "Failure isolation — if the network between them is designed for, a slow dependency degrades one path instead of the process.",
        ],
      },
      {
        type: "paragraph",
        text: "The trap is the distributed monolith: services with chatty synchronous calls, a shared database, or releases that must ship together. You kept all the coupling and added the network — the worst of both. A modular monolith — hard module boundaries enforced in code, one deploy — usually buys most of the discipline at a fraction of the cost.",
      },
      {
        type: "callout",
        tone: "warning",
        text: "Split along boundaries you have already observed in the domain, not along a diagram you hope will be true. Rejoining services later is far cheaper than untangling premature ones.",
      },
    ],
  },
  {
    slug: "choosing-data-structures",
    title: "Choosing data structures you actually reach for",
    description:
      "Slices, maps, heaps, and ring buffers in practice — with the access patterns that decide which one belongs in your code.",
    category: "Programming",
    readingMinutes: 6,
    blocks: [
      {
        type: "paragraph",
        text: "Most application code needs four structures: a dynamic array, a hash map, a priority queue, and a fixed ring. Picking well is not about theoretical elegance — it is about matching the shape of your reads and writes.",
      },
      { type: "heading", text: "Start with the slice" },
      {
        type: "paragraph",
        text: "A slice is contiguous memory, so iteration is cache-friendly and append is amortized O(1) with occasional growth copies. A nil slice behaves like an empty one — no nil checks needed for range or append. Prefer slices until profiling says otherwise; linked structures in Go tend to allocate per node and scatter across the heap.",
      },
      {
        type: "code",
        filename: "lookup.go",
        code: `// Sorted slice + binary search beats a map when you also need order.
items := []Item{ /* kept sorted by Key */ }

i, found := sort.Find(len(items), func(i int) int {
	return strings.Compare(items[i].Key, target)
})
if found {
	item := items[i] // exact match
	_ = item
}
// i is also the insertion point for a missing key — no extra pass.`,
      },
      { type: "heading", text: "Where the others earn their place" },
      {
        type: "list",
        items: [
          "Map: O(1) point lookups with no order — remember iteration order is randomized in Go, so sort before rendering anything user-facing.",
          "container/heap: a priority queue for the next item to process (schedulers, merge k streams, top-K) — pushing is O(log n) with no full re-sort.",
          "Ring buffer over a slice: fixed-size history like the last N requests or metrics samples — constant memory, no allocations after warm-up.",
          "Set: Go has none natively; a map[T]struct{} is the idiom and it really is O(1) membership.",
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: "The expensive operation is often not the one you assumed. Measuring before switching structures keeps cleverness proportional to the actual cost.",
      },
    ],
  },
];

export function listArticles(): Article[] {
  return [...ARTICLES];
}

export function findArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export function getFeaturedArticle(): Article | null {
  return ARTICLES.find((article) => article.featured) ?? ARTICLES[0] ?? null;
}
