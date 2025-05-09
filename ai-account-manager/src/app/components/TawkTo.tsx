'use client';

import { useEffect } from 'react';

interface TawkToProps {
  propertyId: string;
  widgetId: string;
}

export default function TawkTo({ propertyId, widgetId }: TawkToProps) {
  useEffect(() => {
    // Tawk.to script'ini dinamik olarak yükleme
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/' + propertyId + '/' + widgetId;
    script.setAttribute('crossorigin', '*');
    
    // Script'i body'ye ekleme
    document.body.appendChild(script);

    // Temizleme fonksiyonu
    return () => {
      // Sayfa değiştiğinde script'i kaldır
      document.body.removeChild(script);
    };
  }, [propertyId, widgetId]);

  return null; // Bu bileşen görsel bir öğe render etmez
}
