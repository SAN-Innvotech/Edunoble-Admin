import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

export default function MetaComponent({ meta }) {
  return (
    <HelmetProvider>
      <Helmet>
        <title>{meta?.title}</title>
        <meta name="description" content={meta?.description} />
        
        {/* Open Graph / Facebook */}
        {meta?.ogTitle && <meta property="og:title" content={meta.ogTitle} />}
        {meta?.ogDescription && <meta property="og:description" content={meta.ogDescription} />}
        {meta?.ogUrl && <meta property="og:url" content={meta.ogUrl} />}
        {meta?.ogImage && <meta property="og:image" content={meta.ogImage} />}
        
        {/* Twitter */}
        {meta?.twitterTitle && <meta property="twitter:title" content={meta.twitterTitle} />}
        {meta?.twitterDescription && <meta property="twitter:description" content={meta.twitterDescription} />}
        {meta?.twitterImage && <meta property="twitter:image" content={meta.twitterImage} />}
      </Helmet>
    </HelmetProvider>
  );
}
