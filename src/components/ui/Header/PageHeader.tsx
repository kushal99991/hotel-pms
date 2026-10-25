import React, { useEffect, useState } from "react";
import theme from "config/theme";
import { appConfig } from "config/app.config";
import { Box, styled, Typography, IconButton } from "@mui/material";
import useAuth from "hooks/useAuth";
import { IProperty } from "types/property";
import { getMoment } from "utils/helperFunctions/common";
import { useGetLatestNightAuditQuery } from "services/nightAuditSlice";
import moment from "moment";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"; // updated icon

interface PageHeaderProps {
  title?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const { users, properties, currentTimeZone } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const propertyID = users?.defaultPropertyId ?? 0;
  const defalutProperty = properties?.find(
    (p: IProperty) => p.id === propertyID
  );

  const [currentDateTime, setCurrentDateTime] = useState<string>(() => {
    return getMoment(null, currentTimeZone).format("MM/DD/YYYY hh:mm A");
  });

  const { data: nightAuditData, isLoading: isLatestNightAuditLoading } =
    useGetLatestNightAuditQuery({
      property_id: users?.defaultPropertyId ?? 1,
    });

  const lastAuditDate = nightAuditData?.audit_date;
  const lastAuditMoment = lastAuditDate ? moment(lastAuditDate) : null;
  const isAuditOutdated =
    lastAuditMoment &&
    lastAuditMoment.isBefore(
      getMoment(null, currentTimeZone).format(appConfig.dateApiFormat),
      "day"
    );

  const isDashboard = location.pathname.endsWith("/dashboard");

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/booking-engine/dashboard");
    }
  };

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        getMoment(now, currentTimeZone).format("MM/DD/YYYY hh:mm A")
      );
    };

    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, [currentTimeZone]);

  return (
    <MainWrapper>
      <BoxWrap>
        <LeftSection>
          {!isDashboard && (
            <IconButton
              aria-label="back"
              onClick={handleBack}
              data-testid="custom-back-button"
              sx={{
                mr: 1,
                display: isDashboard ? "none" : "inline-flex",
              }}
            >
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>
          )}
          <Title>{title ?? appConfig.appName}</Title>
        </LeftSection>

        <DateTime>
          <Box>
            {defalutProperty?.name} :{" "}
            <DateTimeWrap component="span" data-testid="house-datetime">
              {currentDateTime}
            </DateTimeWrap>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="flex-end">
            {/* Display Last Successful Night Audit */}
            {lastAuditMoment && (
              <Typography
                sx={{
                  color: isAuditOutdated ? "red" : "inherit",
                  fontWeight: 600,
                  textAlign: "end",
                }}
                component="span"
              >
                Last Successful Night Audit:{" "}
                {lastAuditMoment.format("MM/DD/YYYY")}
              </Typography>
            )}
            {/* Show loading state */}
            {isLatestNightAuditLoading && (
              <Typography color="gray" component="span">
                Loading Night Audit Data...
              </Typography>
            )}
          </Box>
        </DateTime>
      </BoxWrap>
    </MainWrapper>
  );
};

export default PageHeader;

// Styled Components
const MainWrapper = styled(Box)(() => ({
  marginBottom: "1rem",
}));

const BoxWrap = styled(Box)(() => ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
}));

const LeftSection = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
}));

const Title = styled(Typography)(() => ({
  fontSize: "20px",
  fontWeight: "700",
  lineHeight: "1",
  color: "#000000",
  [theme.breakpoints.down("lg")]: {
    fontSize: "18px",
  },
  [theme.breakpoints.down("md")]: {
    fontSize: "16px",
    width: "100%",
    textAlign: "center",
    marginBottom: "15px",
  },
}));

const DateTime = styled(Box)(() => ({
  fontSize: "20px",
  fontWeight: "400",
  lineHeight: "1.2",
  color: "#000000",
  [theme.breakpoints.down("lg")]: {
    fontSize: "18px",
  },
  [theme.breakpoints.down("md")]: {
    fontSize: "16px",
    width: "100%",
    textAlign: "center",
  },
}));

const DateTimeWrap = styled(Box)(() => ({
  fontWeight: "800",
}));
