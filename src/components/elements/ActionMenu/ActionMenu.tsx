import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const ITEM_HEIGHT = 48;

export type ActionMenuOption = {
  disabled?: boolean;
  key: string | number;
  text: string;
  onClick?: (...args: any[]) => void;
  selected?: boolean;
};

interface ActionMenuProps {
  options: ActionMenuOption[];
  id?: string;
  itemHeight?: number;
  stopPropagation?: boolean;
}

export default function ActionMenu({
  id,
  options,
  itemHeight,
  stopPropagation,
}: ActionMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleAnchorClick = (event: React.MouseEvent<HTMLElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClick = (option: ActionMenuOption) => {
    return () => {
      option.onClick?.();
      handleClose();
    };
  };
  const optionHeight = itemHeight ?? ITEM_HEIGHT;
  return (
    <div>
      <IconButton
        aria-label="action-menu"
        id={`action-menu${id ? `-${id}` : ""}`}
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleAnchorClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: optionHeight * 4.5,
            width: "20ch",
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.key}
            selected={option.selected}
            onClick={handleClick(option)}
            disabled={option.disabled}
          >
            {option.text}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
