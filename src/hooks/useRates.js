import { useState, useEffect } from 'react';

/**
 * Hook for fetching and managing currency exchange rates
 */
export const useRates = (baseCurrency = 'PLN') => {
    const [rates, setRates] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`)
            .then(res => res.json())
            .then(data => {
                if (isMounted) {
                    if (data && data.rates) {
                        setRates(data.rates);
                    } else {
                        setError('Invalid rates data');
                    }
                }
            })
            .catch(err => {
                if (isMounted) {
                    console.error("Failed to fetch rates:", err);
                    setError(err.message);
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [baseCurrency]);

    return { rates, loading, error };
};
