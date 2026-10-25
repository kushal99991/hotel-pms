import { SalesDashboardProvider } from "contexts/SalesDashboardContext";
import GroupRoomingList from "./components/GroupRoomingList";

const SalesRoomingDetail = () => {
  return (
    <SalesDashboardProvider>
      <GroupRoomingList />
    </SalesDashboardProvider>
  );
};
export default SalesRoomingDetail;
