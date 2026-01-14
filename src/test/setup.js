import '@testing-library/jest-dom';

if (typeof crypto === 'undefined') {
    global.crypto = {
        randomUUID: () => Math.random().toString(36).substring(2, 15)
    };
} else if (!crypto.randomUUID) {
    crypto.randomUUID = () => Math.random().toString(36).substring(2, 15);
}

