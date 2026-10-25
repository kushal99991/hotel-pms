"use client";
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, ButtonBase, Skeleton, Tooltip } from "@mui/material";
import { Add, ArrowBack } from "@mui/icons-material";
import { useGetFoliosQuery } from "services/paymentsSlice";
import FolioCharges from "./components/FolioCharges";
import CreateFolioModal from "./components/CreateFolioModal";
import { useGetLatestNightAuditQuery } from "services/nightAuditSlice";
import { useGetReservationDetailByIdMutation } from "services/reservationSlice";
import useAuth from "hooks/useAuth";
import {
  ALL_FOLIOS_ID,
  ALL_FOLIOS_KEY,
  makeAllFolioForRes,
} from "constants/ui/folios";

const FoliosPage: React.FC = () => {
  const params = useParams();
  const reservationId = parseInt(params?.reservationId ?? "-1");
  const { users: currentUser } = useAuth();
  const {
    data: reservationFolios,
    isLoading: foliosLoading,
    refetch: refetchFolios,
  } = useGetFoliosQuery({ reservation_id: reservationId });
  const [showMakeFolio, setShowMakeFolio] = useState(false);
  const { data: lastAudit } = useGetLatestNightAuditQuery({
    property_id: currentUser?.defaultPropertyId ?? 1,
  });
  const [selectedFolioIndex, setSelectionFolioIndex] = useState(0);
  const [getReservationDetailById, { data: reservation }] =
    useGetReservationDetailByIdMutation();

  function refetchReservation() {
    getReservationDetailById({
      id: reservationId,
      propertyId: currentUser?.defaultPropertyId ?? -1,
    });
  }
  useEffect(() => {
    if (reservationId && !reservation) {
      refetchReservation();
    }
  }, [reservationId, reservation]);
  function onFolioSelect(folioIdx: number) {
    return () => {
      if (folioIdx === ALL_FOLIOS_ID) {
        // refetch reservation data to ensure up to date charges/payments
        refetchReservation();
      }
      setSelectionFolioIndex(folioIdx);
    };
  }
  function handleMakeFolioClose() {
    setShowMakeFolio(false);
  }

  function getSelectedFolio() {
    if (selectedFolioIndex === ALL_FOLIOS_ID) {
      return makeAllFolioForRes(reservation);
    }
    return reservationFolios![selectedFolioIndex];
  }

  if (reservationId < 1 || !reservationFolios) {
    return <Box>No folios found for given reservation id</Box>;
  }
  if (foliosLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" width="80%" height="20%"></Skeleton>
        <Skeleton variant="rectangular" width="80%" height="80%"></Skeleton>
      </Box>
    );
  }
  return (
    <Box>
      <Box mb={3} color="secondary.main">
        <Link
          to={`/booking-engine/reservations/${reservationId}`}
          style={{ display: "flex", alignItems: "center" }}
        >
          <ArrowBack fontSize="small" sx={{ mr: 1 }} />
          Reservation Details
        </Link>
      </Box>
      <Box display="flex" alignItems="center">
        {reservationFolios.map((f, idx) => (
          <ButtonBase
            onClick={
              idx === selectedFolioIndex ? undefined : onFolioSelect(idx)
            }
            key={`folio-tab_${f.id}`}
          >
            <Box
              px={3}
              py={1}
              sx={{
                borderTopLeftRadius: "3px",
                borderTopRightRadius: "3px",
                borderBottom: "2px solid",
                borderColor:
                  idx === selectedFolioIndex ? "grey.200" : "grey.700",
                marginLeft: idx > 0 ? 1 : 0,
                backgroundColor:
                  idx === selectedFolioIndex ? "grey.200" : "grey.700",
                color: idx === selectedFolioIndex ? "unset" : "white",
              }}
            >
              {`Folio ${f.type}`}
            </Box>
          </ButtonBase>
        ))}
        <ButtonBase
          onClick={
            ALL_FOLIOS_ID === selectedFolioIndex
              ? undefined
              : onFolioSelect(ALL_FOLIOS_ID)
          }
          key={`folio-tab_${ALL_FOLIOS_KEY}`}
        >
          <Box
            px={3}
            py={1}
            sx={{
              borderTopLeftRadius: "3px",
              borderTopRightRadius: "3px",
              borderBottom: "2px solid",
              borderColor:
                ALL_FOLIOS_ID === selectedFolioIndex ? "grey.200" : "grey.700",
              marginLeft: 1,
              backgroundColor:
                ALL_FOLIOS_ID === selectedFolioIndex ? "grey.200" : "grey.700",
              color: ALL_FOLIOS_ID === selectedFolioIndex ? "unset" : "white",
            }}
          >
            {`A - Z`}
          </Box>
        </ButtonBase>
        <ButtonBase
          onClick={() => {
            setShowMakeFolio(true);
          }}
        >
          <Tooltip title="Add Folio">
            <Box
              px={3}
              py={1}
              sx={{
                borderTopLeftRadius: "3px",
                borderTopRightRadius: "3px",
                marginLeft: reservationFolios?.length ? 1 : 0,
                backgroundColor: "grey.700",
                color: "white",
              }}
            >
              <Add />
            </Box>
          </Tooltip>
        </ButtonBase>
      </Box>
      <FolioCharges
        reservation={reservation}
        reservationId={reservationId}
        folio={getSelectedFolio()}
        refetchFolios={refetchFolios}
        refetchReservation={refetchReservation}
        folios={reservationFolios}
        lastNightAudit={lastAudit}
      />
      <CreateFolioModal
        open={showMakeFolio}
        onClose={handleMakeFolioClose}
        reservationId={reservationId}
        folios={reservationFolios}
      />
    </Box>
  );
};

export default FoliosPage;
