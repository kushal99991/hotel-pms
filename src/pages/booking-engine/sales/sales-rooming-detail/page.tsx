import { SalesDashboardProvider } from "contexts/SalesDashboardContext";
import SalesRoomingDetailPage from "./SalesRoomingDetailPage";

const SalesRoomingDetail = () => {
  return (
    <SalesDashboardProvider>
      <SalesRoomingDetailPage />
    </SalesDashboardProvider>
  );
};
export default SalesRoomingDetail;
