// Feature: карта
export { MapScreen } from './screens/MapScreen';
export type {
  CourierMapStats,
  CourierOnlineStatus,
  CourierProfilePreview,
  IncomingOrder,
  MapPlace,
} from './types';
export {
  useGetCourierMapStatsQuery,
  useGetCourierOnlineStatusQuery,
  useGetCourierProfilePreviewQuery,
  useSearchPlacesQuery,
  useGoOnlineMutation,
  useGoOfflineMutation,
  useGetIncomingOrderQuery,
  useAcceptOrderMutation,
  useDeclineOrderMutation,
  useArriveAtPickupMutation,
  useConfirmPickupMutation,
  useArriveAtDropoffMutation,
  useCompleteOrderMutation,
} from './api/mapApi';
