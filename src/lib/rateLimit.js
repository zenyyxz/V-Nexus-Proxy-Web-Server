// Simple in-memory rate limiter
const rateLimitStore = new Map();

export function rateLimit(identifier, maxAttempts, windowMs) {
    const now = Date.now();
    const key = identifier;

    if (!rateLimitStore.has(key)) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: maxAttempts - 1 };
    }

    const record = rateLimitStore.get(key);

    // Reset if window has passed
    if (now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: maxAttempts - 1 };
    }

    // Increment count
    record.count++;

    if (record.count > maxAttempts) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        return {
            allowed: false,
            remaining: 0,
            retryAfter
        };
    }

    return {
        allowed: true,
        remaining: maxAttempts - record.count
    };
}

// Cleanup old entries periodically (every 10 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 10 * 60 * 1000);
