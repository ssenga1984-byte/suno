export type SiteImageLoading = "hero" | "content";

export const getImageLoadingProps = (priority: SiteImageLoading) => {
  if (priority === "hero") {
    return {
      loading: "eager" as const,
      fetchPriority: "high" as const,
      decoding: "async" as const
    };
  }

  return {
    loading: "lazy" as const,
    fetchPriority: "auto" as const,
    decoding: "async" as const
  };
};

export const responsiveImageSizes = {
  hero: "(min-width: 1024px) 46vw, calc(100vw - 40px)",
  content: "(min-width: 1024px) 50vw, calc(100vw - 40px)"
} as const;
