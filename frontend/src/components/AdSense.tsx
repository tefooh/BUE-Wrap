import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdSenseProps {
  client: string;
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const AdSense: React.FC<AdSenseProps> = ({
  client,
  slot,
  format = 'auto',
  responsive = true,
  style = { display: 'block' },
  className = '',
}) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
        ref={adRef}
      />
    </div>
  );
};

export default AdSense;
