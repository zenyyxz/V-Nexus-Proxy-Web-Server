import validator from 'validator';

export function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email is required' };
    }

    if (email.length > 100) {
        return { valid: false, error: 'Email too long (max 100 characters)' };
    }

    if (!validator.isEmail(email)) {
        return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true };
}

export function validateConfigName(name) {
    if (!name || typeof name !== 'string') {
        return { valid: false, error: 'Config name is required' };
    }

    if (name.length > 50) {
        return { valid: false, error: 'Config name too long (max 50 characters)' };
    }

    // Allow alphanumeric, spaces, dashes, underscores
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
        return { valid: false, error: 'Config name contains invalid characters' };
    }

    return { valid: true };
}

export function validateUrl(url) {
    if (!url || typeof url !== 'string') {
        return { valid: false, error: 'URL is required' };
    }

    if (!validator.isURL(url, { require_protocol: true })) {
        return { valid: false, error: 'Invalid URL format' };
    }

    return { valid: true };
}

export function sanitizeString(str, maxLength = 100) {
    if (!str || typeof str !== 'string') return '';

    // Remove any HTML tags
    let sanitized = str.replace(/<[^>]*>/g, '');

    // Trim and limit length
    sanitized = sanitized.trim().substring(0, maxLength);

    return sanitized;
}

export function validateTransport(transport, allowedTransports) {
    if (!transport || typeof transport !== 'string') {
        return { valid: false, error: 'Transport is required' };
    }

    if (!allowedTransports.includes(transport)) {
        return { valid: false, error: 'Invalid transport type' };
    }

    return { valid: true };
}
