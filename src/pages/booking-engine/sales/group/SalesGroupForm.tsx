import React, { useCallback, useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Box, Button } from "@mui/material";
import { Hotel } from "@mui/icons-material";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import { ErrorResponse } from "types/apiTypes";
import { useNavigate } from "react-router-dom";
import GroupDateSelection from "./components/GroupDateSelection";
import { RoomBlocksSection } from "./components/RoomBlocksSection";
import { CustomerDetailsSection } from "./components/CustomerDetailsSection";
import GroupSelectPlaceholder from "../_components/GroupSelectPlaceholder";
import { GroupAvailabilityData } from "hooks/useGetGroupAvailabiilty";
import useAuth from "hooks/useAuth";
import {
  CreateSalesContact,
  ISalesAccountGroupRequest,
  ISalesContract,
} from "types/salesTypes";
import { getMoment } from "utils/helperFunctions/common";
import { appConfig } from "config/app.config";
import { SET_VALUE_OPTIONS } from "constants/forms";
import { useCreateSalesAccountGroupMutation } from "services/salesSlice";
import {
  makeNewGroupSchema,
  GroupReservationFormData,
} from "forms/schemas/salesGroup.validations";
import ApiErrorDisplay from "components/ui/ApiErrorDisplay/ApiErrorDisplay";
import { FolioTypes } from "constants/folios";
import { SalesGroupPaymentType } from "constants/sales";

interface GroupReservationFormProps {
  onSubmit: (data: any) => void;
  propertyId?: number;
}

const GroupReservationForm: React.FC<GroupReservationFormProps> = ({}) => {
  const navigate = useNavigate();
  const [availabilityData, setAvailabilityData] = useState<
    GroupAvailabilityData | undefined
  >(undefined);
  const [availabilityStale, setAvailabilityStale] = useState(false);
  const { timezoneCurrentDate, currentProperty } = useAuth();
  const [getRoomTypeByPropertyId, { data: apiRoomTypes }] =
    useGetRoomTypeByPropertyIdMutation();
  const [createGroup, { isLoading: creatingGroup, error }] =
    useCreateSalesAccountGroupMutation();
  const methods = useForm<GroupReservationFormData>({
    resolver: yupResolver(makeNewGroupSchema(timezoneCurrentDate)),
    mode: "onSubmit",
    defaultValues: {
      main_group_rooms: 1,
      shoulder_rooms: 0,
      group_blocks: [],
      catering: false,
      banquet: false,
      contract_signed: false,
      shoulder_dates: false,
      booking_channel: "GROUPS",
      market_segment: "GROUP",
      property_id: currentProperty?.id ?? -1,
      payment_routing: [],
      group_attributes: [],
    },
  });

  useEffect(() => {
    if (currentProperty) {
      methods.setValue("property_id", currentProperty.id, SET_VALUE_OPTIONS);
      getRoomTypeByPropertyId({
        propertyId: currentProperty?.id ?? -1,
      });
    }
  }, [currentProperty]);

  const handleFormSubmit = async (data: GroupReservationFormData) => {
    // Transform the data to match the API format
    let salesContact = data.sales_contact as CreateSalesContact;
    if (!salesContact) {
      salesContact = {
        property_id: currentProperty?.id ?? -1,
        billing_name: data.group_name,
        address: data.address,
        country: data.country ?? "US",
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || "",
        phone_extension: data.phone_extension || "",
        cell_phone: data.cell_phone || "",
        email: data.email || "",
      };
    }
    const transformedData: ISalesAccountGroupRequest = {
      group_code: data.group_code || "",
      group_name: data.group_name,
      group_description: data.group_description || "",
      group_status: data.group_status || "",
      group_arrival_date: getMoment(
        data.group_arrival_date,
        currentProperty?.timezone
      ).format(appConfig.dateApiFormat),
      shoulder_arrival_date:
        data.shoulder_rooms > 0
          ? getMoment(
              data.shoulder_arrival_date,
              currentProperty?.timezone
            ).format(appConfig.dateApiFormat)
          : undefined,
      shoulder_departure_date:
        data.shoulder_rooms > 0
          ? getMoment(
              data.shoulder_departure_date,
              currentProperty?.timezone
            ).format(appConfig.dateApiFormat)
          : undefined,
      group_departure_date: getMoment(
        data.group_departure_date,
        currentProperty?.timezone
      ).format(appConfig.dateApiFormat),
      group_release_date: getMoment(
        data.group_release_date,
        currentProperty?.timezone
      ).format(appConfig.dateApiFormat),
      group_cutoff_date: getMoment(
        data.group_cutoff_date,
        currentProperty?.timezone
      ).format(appConfig.dateApiFormat),
      group_attributes: data.group_attributes || [],
      catering: data.catering ?? false,
      banquet: data.banquet ?? false,
      contract_signed: data.contract_signed,
      shoulder_dates: data.shoulder_dates,
      booking_channel: data.booking_channel || "",
      market_segment: data.market_segment || "",
      sales_distribution: data.sales_distribution || "",
      method_of_payment: data.method_of_payment || "",
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || "",
      phone_extension: data.phone_extension || "",
      cell_phone: data.cell_phone || "",
      address: data.address || "",
      email: data.email,
      country: data.country || "",
      notes: data.notes || "",
      property_id: data.property_id || 0,
      sales_contact_id: data.sales_contact_id || 0,
      rate_code_id: data.rate_code_id || 0,
      status: data.status || "",
      payment_routing:
        data.payment_routing && data.payment_routing.length > 1
          ? data.payment_routing
          : [
              {
                folio: FolioTypes.D,
                payment_type: SalesGroupPaymentType.DBA,
              },
            ],
      sales_contact: salesContact || undefined,
      group_blocks: data.group_blocks
        .filter((block) => block.alloc_count)
        .map((block) => ({
          ...block,
          start_date: getMoment(
            block.start_date,
            currentProperty?.timezone
          ).format(appConfig.dateApiFormat),
          end_date: getMoment(block.end_date, currentProperty?.timezone).format(
            appConfig.dateApiFormat
          ),
        })),
    };

    try {
      const { data: createdGroup } = await createGroup(transformedData);
      if (createdGroup?.id) {
        navigate(`/booking-engine/sales/group-detail/${createdGroup?.id}`);
      }
    } catch (err) {
      console.error("Error creating: ", err);
    }
  };

  function handleCancelClick() {
    methods.reset();
    navigate(-1);
  }

  const handleCheckAvailabilityChange = (data: GroupAvailabilityData) => {
    setAvailabilityData(data);
    setAvailabilityStale(false);
  };

  const handleAvailabilityInputChange = useCallback(() => {
    if (availabilityData) setAvailabilityStale(true);
  }, [availabilityData]);
  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={methods.handleSubmit(handleFormSubmit)}>
        <GroupDateSelection
          onAvailabilityChange={handleCheckAvailabilityChange}
          onAvailabilityInputChange={handleAvailabilityInputChange}
          roomTypes={apiRoomTypes}
        />

        {!availabilityData && (
          <GroupSelectPlaceholder
            message="Define a date range and check availability to configure rooms for each day."
            icon={
              <Hotel sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
            }
          />
        )}

        {availabilityData && availabilityStale && (
          <GroupSelectPlaceholder
            message='Availability information has changed, after making all your changes click "Check Availability" to ensure you are working with the most up to date availability'
            icon={
              <Hotel sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
            }
          />
        )}

        {availabilityData && !availabilityStale && (
          <RoomBlocksSection
            availability={availabilityData}
            roomTypes={apiRoomTypes}
          />
        )}

        <CustomerDetailsSection />
        {!!error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <ApiErrorDisplay
              error={error as ErrorResponse}
              getSingleErrorString={(message) =>
                `There was an error creating the group: ${message}`
              }
              multipleErrorsHeader="There were errors creating the group:"
            />
          </Alert>
        )}
        <Box
          sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}
        >
          <Button variant="outlined" onClick={handleCancelClick}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={creatingGroup}
          >
            {creatingGroup ? "Saving..." : "Save & Add Res"}
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default GroupReservationForm;
