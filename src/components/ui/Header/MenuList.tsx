// "use client";

import React from "react";
import { RouteList as IMenuItem } from "config/sidebarmenu.config";

import MenuListItem from "./MenuListItem"; // Adjust the path as needed

interface MenuListProps {
  menuItems: IMenuItem[];
  activePath: string[];

  handleActivePath: (href: string, uniqueKey?: string) => void;
}

const MenuList: React.FC<MenuListProps> = ({
  activePath,
  handleActivePath,
  menuItems,
}) => {
  return (
    <>
      {menuItems?.map((item, index) => (
        <MenuListItem
          key={index}
          href={item?.path ?? "#"}
          label={item?.menuTitle ?? ""}
          subMenuItems={(item.subMenu ?? []).filter((a) => a?.isShowSidebar)}
          activePath={activePath}
          handleActivePath={handleActivePath}
          menuItems={menuItems}
        />
      ))}
    </>
  );
};

export default MenuList;
