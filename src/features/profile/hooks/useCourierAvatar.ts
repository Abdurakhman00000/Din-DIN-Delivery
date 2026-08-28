import { useGetCourierMeQuery } from '@/features/profile/api/profileApi';

export function useCourierAvatar() {
  const { data } = useGetCourierMeQuery();

  return {
    fullName: data?.full_name ?? '',
    photoUrl: data?.avatar_url ?? null,
  };
}
