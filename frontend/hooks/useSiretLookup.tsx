import { useQuery } from "@tanstack/react-query";
import { searchBySiret } from "@/lib/api/siret.service";
import { SiretData } from "@/lib/type/siret-data.type";

export function useSiretLookup(siret: string) {
  return useQuery<SiretData | null>({
    queryKey: ["siret", siret],
    queryFn: () => searchBySiret(siret),
    enabled: siret.length === 14,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
