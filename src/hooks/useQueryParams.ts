"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface SetParamsOptions {
  replace?: boolean;
}

export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setSearchParams = (next: URLSearchParams, options: SetParamsOptions = {}) => {
    const query = next.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    if (options.replace) {
      router.replace(url, { scroll: false });
    } else {
      router.push(url, { scroll: false });
    }
  };

  return { searchParams, setSearchParams, pathname };
}
