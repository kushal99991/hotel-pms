import React, { useState, useRef, ReactElement } from "react";
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  ButtonGroupProps,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export interface SplitButtonOption {
  isMainOption?: boolean;
  isDisabled?: boolean;
  text: string;
  key: string;
  onClick?: (...args: any[]) => void;
}

interface SplitButtonProps {
  options: SplitButtonOption[];
  buttonGroupProps?: ButtonGroupProps;
}

export default function SplitButton(props: SplitButtonProps): ReactElement {
  const { options, buttonGroupProps } = props;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleMainClick = () => {
    const mainOption = options.find((opt) => opt.isMainOption);
    mainOption?.onClick?.();
  };

  const handleMenuItemClick = (key: string) => {
    const option = options.find((opt) => opt.key === key);
    if (option) {
      const handler = option.onClick;
      handler?.();
    }
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };
  const mainOption = options.find((opt) => opt.isMainOption) ?? options[0];
  const dropdownOptions = options.filter((opt) => !opt.isMainOption);
  return (
    <React.Fragment>
      <ButtonGroup
        variant="contained"
        ref={anchorRef}
        aria-label="Split-Button"
        {...buttonGroupProps}
      >
        <Button onClick={handleMainClick}>{mainOption?.text}</Button>
        <Button
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
          sx={{
            minWidth: "30px",
          }}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{
          zIndex: 1,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {dropdownOptions.map((option, index) => (
                    <MenuItem
                      key={`${option.text}_${index}`}
                      disabled={option.isDisabled}
                      onClick={() => handleMenuItemClick(option.key)}
                    >
                      {option.text}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
}
