import React, { useState, useRef } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  IReservationResponse,
  IReservationStayDetailsResponse,
} from "types/reservationTypes";
import Label from "components/elements/Label/Label";

import useAuth from "hooks/useAuth";
import { outstandingTotalsFromDataResponses } from "utils/reservations";
import ReservationDetailBox from "./components/ReservationDetailBox";
import StayInfo from "./components/StayInfo";
import RoomInfo from "../RoomInfo";
import RateDetails from "../RateDetails";
import PaymentSummary from "../PaymentSummary";
import History from "../History";
import Comments from "../Comments";
import Charges from "./components/Charges";
// import AddonSpecialRequest from "../AddonSpecialRequest";
import GuestInfo from "./components/GuestInfo";
import BookingInfo from "./components/BookingInfo";
import AdditionalGuestInfo from "./components/AdditionalGuestInfo";
import FolioPDF from "../../folios/components/FolioPDF";
import { pluralValue } from "utils/helperFunctions/common";
import SpecialRequests from "./components/SpecialRequests";
import EditGuestForm from "./components/EditGuestForm";
import AddNewGuest from "pages/booking-engine/sales/_components/AddNewGuest";
import ServiceRequest from "./components/ServiceRequest";
import { ReservationStatusEnum } from "constants/reservation";
import { useReservationDetails } from "contexts/ReservationDetailsContext";

const ReservationDetail: React.FC<{
  isLoading: boolean;
  isRefreshing: boolean;
  details: IReservationResponse | null;
  onRefresh?: () => void;
  onAssignRoom: () => void;
  onPaymentClick?: () => void;
  editDatesOpen: boolean;
  setEditDatesOpen: (newVal: boolean) => void;
}> = ({
  isLoading,
  isRefreshing,
  details,
  editDatesOpen,
  setEditDatesOpen,
  onRefresh,
  onAssignRoom,
  onPaymentClick,
}) => {
  const { users: currentUser, properties } = useAuth();
  const { viewState } = useReservationDetails();
  const chargesBoxRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [refreshOnModalClose, setRereshOnModalClose] = useState(false);

  const handleOpenModal = (section: string) => {
    setCurrentSection(section);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    if (refreshOnModalClose) {
      onRefresh?.();
    }
    setOpenModal(false);
    setCurrentSection(null);
    setRereshOnModalClose(false);
  };

  const handleModalNeedsRefresh = () => {
    setRereshOnModalClose(true);
  };

  const handleGoToChargesClick = (evt: any) => {
    evt.preventDefault();
    if (chargesBoxRef.current) {
      chargesBoxRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handlePrintChargesClick = async () => {
    const property = properties.find(
      (p) => p.id === currentUser?.defaultPropertyId
    );
    const folio = details?.folios.find((f) => f.type === "A");
    if (!folio) {
      console.warn("Folio A could not be found in reservation data");
      return;
    }
    const blob = await pdf(
      <FolioPDF
        tableData={folio?.charges ?? []}
        property={property}
        reservation={details ?? undefined}
        folio={{
          type: folio.type,
          reservation_id: details?.id ?? -1,
          id: folio.id,
          primary_payment_method: folio.primary_payment_method,
        }}
        totals={outstandingTotalsFromDataResponses(
          folio?.payments,
          folio?.charges
        )}
      />
    ).toBlob();

    const link = document.createElement("a");
    const blobUrl = URL.createObjectURL(blob);
    link.href = blobUrl;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const childrenCount = details?.children_count ?? 0;
  const guestCount = details?.guests?.length ?? 0;
  const adultCount = guestCount;
  return (
    <>
      <Grid container spacing={2}>
        <Grid
          item
          xs={12}
          md={4}
          sm={12}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <ReservationDetailBox label="Booking Info" isLoading={isLoading}>
            <BookingInfo reservation={details} />
          </ReservationDetailBox>

          <ReservationDetailBox label="Guests" isLoading={isLoading}>
            <>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Label>Occupancy:</Label>
                <Box display="flex">
                  <Typography>
                    {pluralValue(adultCount, "Adult", "Adults")}
                  </Typography>
                  <Typography ml={2}>
                    {pluralValue(childrenCount, "Child", "Children")}
                  </Typography>
                </Box>
              </Box>
            </>
          </ReservationDetailBox>

          <ReservationDetailBox label="Guest Info" isLoading={isLoading}>
            <>
              {details?.reservation_first_guest_info?.id && (
                <GuestInfo
                  key={details?.reservation_first_guest_info.id.toString()}
                  item={details?.reservation_first_guest_info}
                  index={0}
                />
              )}
              <Box textAlign="right" mt={2}>
                <Button
                  variant="text"
                  sx={{
                    textTransform: "none",
                    textDecoration: "underline",
                    color: "#32A1AE",
                  }}
                  onClick={() => handleOpenModal("guestInfo")}
                >
                  View/Edit Guests
                </Button>
              </Box>
            </>
          </ReservationDetailBox>

          <ReservationDetailBox label="Rate Code" isLoading={isLoading}>
            <RateDetails details={details} onRefresh={onRefresh} />
          </ReservationDetailBox>

          <ReservationDetailBox label="Special Requests" isLoading={isLoading}>
            {/* <AddonSpecialRequest /> */}
            <SpecialRequests
              reservation={details}
              refetchReservation={onRefresh}
            />
          </ReservationDetailBox>
          {details &&
            [
              ReservationStatusEnum.RESERVED,
              ReservationStatusEnum.ARRIVING,
              ReservationStatusEnum.IN_HOUSE,
            ].includes(details?.status) && <ServiceRequest />}
        </Grid>
        <Grid
          item
          xs={12}
          md={8}
          sm={12}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <ReservationDetailBox
            label="Stay Info"
            isContentRemovePending={true}
            isLoading={isLoading}
          >
            <StayInfo
              details={details}
              onRefresh={onRefresh}
              editOpen={editDatesOpen}
              setEditOpen={setEditDatesOpen}
            />
          </ReservationDetailBox>
          <ReservationDetailBox
            label="Room Info"
            isContentRemovePending={true}
            isLoading={isLoading}
          >
            <RoomInfo
              details={details}
              onEditClick={onAssignRoom}
              onRefresh={onRefresh}
            />
          </ReservationDetailBox>
          <ReservationDetailBox
            label="Folio"
            isContentRemovePending={true}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            actions={[
              {
                label: "Manage Folios",
                onClick: () => {
                  navigate(
                    `/booking-engine/reservations/folios/${details?.id}`
                  );
                },
                newTabAction: true,
              },
            ]}
          >
            <PaymentSummary
              folios={details?.folios ?? []}
              paymentMethods={viewState.paymentMethods ?? []}
              payments={details?.payments ?? []}
              onPaymentClick={onPaymentClick}
              onGoToCharges={handleGoToChargesClick}
              reservation={details}
              onRefresh={onRefresh}
            />
          </ReservationDetailBox>
          <ReservationDetailBox
            label="Comments"
            isContentRemovePending={true}
            isLoading={isLoading}
          >
            <Comments
              reservationId={details?.id ?? null}
              comments={details?.comments ?? []}
              onRefresh={onRefresh}
            />
          </ReservationDetailBox>
          <ReservationDetailBox
            label="History"
            isContentRemovePending={true}
            isLoading={isLoading}
          >
            <Box px={2} pt={2}>
              <History reservationId={details?.id ?? null} />
            </Box>
          </ReservationDetailBox>
          <div ref={chargesBoxRef}>
            <ReservationDetailBox
              label="Charges Details"
              isContentRemovePending={true}
              isLoading={isLoading}
              actions={[
                {
                  label: "Print",
                  onClick: handlePrintChargesClick,
                },
              ]}
            >
              <Box px={2} pt={2}>
                <Charges
                  folio={details?.folios.find((f) => f.type === "A")}
                  reservationId={details?.id}
                />
              </Box>
            </ReservationDetailBox>
          </div>
        </Grid>
      </Grid>
      {/* Modal for displaying detailed information */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth={currentSection === "addGuestInfo" ? "xs" : "md"}
        fullWidth
        PaperProps={{
          sx: {
            maxWidth: currentSection === "guestInfo" ? "500px" : null,
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: currentSection === "guestInfo" ? "center" : null,
            fontSize: "1.5rem",
          }}
        >
          {currentSection === "bookingInfo"
            ? "Booking Info"
            : currentSection === "addGuestInfo"
              ? `Add Secondary Guest ${(details?.guests?.length ?? 0) + 1}`
              : "Guest List"}
        </DialogTitle>
        <DialogContent>
          {currentSection === "bookingInfo" && (
            <>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Label>Confirmation:</Label>
                <Typography>#{details?.id ?? ""}</Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Label>Itinerary:</Label>
                <Typography>-</Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Label>Source:</Label>
                <Typography>-</Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Label>Vendor:</Label>
                <Typography>-</Typography>
              </Box>
            </>
          )}
          {currentSection === "guestInfo" && (
            <EditGuestForm
              guests={details?.guests ?? []}
              onRefreshNeeded={handleModalNeedsRefresh}
              reservationHolder={details?.reservation_holder_info}
              addGuestCallback={() => handleOpenModal("addGuestInfo")}
            />
          )}
          {currentSection === "addGuestInfo" && (
            <AddNewGuest
              onClose={() => handleOpenModal("guestInfo")}
              onRefresh={onRefresh}
              reservation_id={details?.id ?? null}
            />
          )}
          {currentSection === "additionalGuests" && (
            <>
              {(details?.reservation_stay_details ?? []).map(
                (value: IReservationStayDetailsResponse, index: number) => (
                  <>
                    <Typography>Guest {index + 1}</Typography>
                    <AdditionalGuestInfo
                      key={index.toString()}
                      index={index}
                      item={value}
                    />
                  </>
                )
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReservationDetail;
