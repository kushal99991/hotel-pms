import { useParams } from "react-router-dom";
import { Box, Skeleton } from "@mui/material";
import { pdf } from "@react-pdf/renderer";
import { useGetFoliosQuery } from "services/paymentsSlice";
import FolioCharges from "pages/booking-engine/reservations/folios/components/FolioCharges";
import FolioPDF from "pages/booking-engine/reservations/folios/components/FolioPDF";
import { useGetLatestNightAuditQuery } from "services/nightAuditSlice";
import useAuth from "hooks/useAuth";
import { openBlobInNewTab } from "utils/pdf";
import { modifyToDisplayDate } from "utils/helperFunctions/dateFormat";
import { ISalesGroupDetail } from "types/salesTypes";
import { PaymentParentEnum } from "constants/ui/payments";
import { PaymentMethodType } from "constants/payments";
import { PaymentTotalsData } from "components/ui/PaymentTotals/PaymentTotals";
import { formatPhone } from "utils/helperFunctions/dataFormatters";

const GroupMasterFolio: React.FC<{ groupDetail?: ISalesGroupDetail }> = ({
  groupDetail,
}) => {
  const params = useParams();
  const groupId = parseInt(params?.id ?? "-1");
  const { users: currentUser, currentProperty } = useAuth();
  const {
    data: masterFolioResponse,
    isLoading: folioLoading,
    refetch: refetchFolio,
  } = useGetFoliosQuery(
    { sales_group_id: groupId },
    { skip: !groupId || groupId < 0 }
  );
  const { data: lastAudit } = useGetLatestNightAuditQuery({
    property_id: currentUser?.defaultPropertyId ?? 1,
  });

  async function handlePrintFolioClick (tableData: any[], totals: PaymentTotalsData) {
    const baseInfo = [
      {
        info: [
          {
            label: "Group Name",
            value: groupDetail?.group_name,
          },
          {
            label: "Group Code",
            value: groupDetail?.group_code,
          },
          {
            label: "Rooms Booked",
            value: `${groupDetail?.rooms_booked ?? ""}`,
          },
        ],
      },
      {
        info: [
          {
            label: "Arrival Date",
            value: modifyToDisplayDate(groupDetail?.group_arrival_date ?? ""),
          },
          {
            label: "Departure Date",
            value: modifyToDisplayDate(groupDetail?.group_departure_date ?? ""),
          }
        ]
      },
      {
        info: [
          {
            label: "Group Contact",
            value: `${groupDetail?.sales_contact?.first_name ?? ""} ${groupDetail?.sales_contact?.last_name ?? ""}`,
          },
          {
            label: "Group Contact No.",
            value: formatPhone(groupDetail?.sales_contact?.phone),
          },
        ],
      }
    ];
    if (groupDetail?.shoulder_arrival_date) {
      const dateSection = baseInfo[1];
      dateSection.info = [
        {
          label: "Shoulder Arrival Date",
          value: modifyToDisplayDate(groupDetail?.shoulder_arrival_date ?? ""),
        },
        ...dateSection.info,
      ]
    }
    if (groupDetail?.shoulder_departure_date) {
      const dateSection = baseInfo[1];
      dateSection.info = [
        ...dateSection.info,
        {
          label: "Shoulder Departure Date",
          value: modifyToDisplayDate(groupDetail?.shoulder_departure_date ?? ""),
        },
      ]
    }
    const blob = await pdf(
      <FolioPDF
        tableData={tableData}
        property={currentProperty}
        folio={masterFolioResponse?.[0]}
        totals={totals}
        infoSections={baseInfo}
      />
    ).toBlob();
    openBlobInNewTab(blob);
  }

  if (
    !groupDetail ||
    groupDetail?.id < 1 ||
    !masterFolioResponse ||
    masterFolioResponse?.length < 0
  ) {
    return <Box>No folios found for Group</Box>;
  }
  if (folioLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" width="80%" height="20%"></Skeleton>
        <Skeleton variant="rectangular" width="80%" height="80%"></Skeleton>
      </Box>
    );
  }
  return (
    <Box>
      <FolioCharges
        reservationId={-1}
        folio={masterFolioResponse?.[0]}
        refetchFolios={refetchFolio}
        refetchReservation={undefined}
        folios={masterFolioResponse}
        lastNightAudit={lastAudit}
        onPrintClick={handlePrintFolioClick}
        parent={{
          type: PaymentParentEnum.SALES_GROUP,
          id: groupId,
          paymentType: PaymentMethodType.SALES_GROUP,
          rate_code_id: groupDetail?.rate_code_id ?? undefined,
        }}
        preventMove
      />
    </Box>
  );
};

export default GroupMasterFolio;
