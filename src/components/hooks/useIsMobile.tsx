import React from 'react';

export default function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

    React.useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth <= 640);
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return isMobile;
}