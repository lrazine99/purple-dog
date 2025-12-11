import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUser, updateUser, type UpdateUserDto, type User } from "@/lib/api/user.service";

export function useUser(userId: number | undefined) {
  return useQuery<User>({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId!),
    enabled: !!userId,
  });
}

export function useUpdateUser(userId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      officialDocument,
    }: {
      data: UpdateUserDto;
      officialDocument?: File;
    }) => updateUser(userId!, data, officialDocument),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

