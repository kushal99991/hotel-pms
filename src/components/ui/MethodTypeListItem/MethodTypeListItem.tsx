import { Box, ButtonBase, Typography, SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { ArrowForward } from "@mui/icons-material";

const MethodTypeListItem: React.FC<{
  onClick?: () => void;
  icon?: OverridableComponent<SvgIconTypeMap<object, "svg">>;
  iconColor?: string;
  text?: string;
  disabled?: boolean;
  secondaryText?: string;
  secondaryTextColor?: string;
}> = ({
  onClick,
  icon: IconComponent,
  iconColor,
  text,
  secondaryText,
  secondaryTextColor,
  disabled,
}) => {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      sx={{ "&:only-child .MuiBox-root": { borderBottom: "none" } }}
    >
      <Box width="80%" borderBottom="1px solid" borderColor="grey.500" py={2}>
        <Box display="flex" alignItems="center">
          <Box display="flex" alignItems="center">
            {IconComponent && (
              <IconComponent
                fontSize="large"
                sx={{ color: iconColor, mr: 1 }}
              />
            )}
            <Typography
              fontSize="1.15rem"
              sx={{ color: disabled ? "text.disabled" : "" }}
            >
              {text ?? ""}
            </Typography>
          </Box>
          <Box flex={1} textAlign="right">
            <ArrowForward
              sx={{ color: disabled ? "text.disabled" : "grey.600" }}
            />
          </Box>
        </Box>
        {secondaryText && (
          <Typography fontSize="0.875rem" sx={{ color: secondaryTextColor }}>
            {secondaryText}
          </Typography>
        )}
      </Box>
    </ButtonBase>
  );
};

export default MethodTypeListItem;
