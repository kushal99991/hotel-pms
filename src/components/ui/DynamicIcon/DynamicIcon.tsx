import { FC } from "react";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as BsIcons from "react-icons/bs";
import * as AiIcons from "react-icons/ai";
import * as GiIcons from "react-icons/gi";
import * as RiIcons from "react-icons/ri";
import * as Fa6Icons from "react-icons/fa6";
import * as HiIcons from "react-icons/hi";
import * as LiaIcons from "react-icons/lia";
import * as TbIcons from "react-icons/tb";
import * as CiIcons from "react-icons/ci";
import * as PiIcons from "react-icons/pi";
import * as IoIcons from "react-icons/io";
import * as SiIcons from "react-icons/si";
import * as LuIcons from "react-icons/lu";
import * as GrIcons from "react-icons/gr";
import * as BiIcons from "react-icons/bi";
import * as Io5Icons from "react-icons/io5";
import { TfiLayoutWidthDefaultAlt } from "react-icons/tfi";
import { Box } from "@mui/material";

export interface IconEntry {
  id: string;
  label: string;
  component: FC<T>;
  type: string;
}

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
}

const DynamicIcon: FC<DynamicIconProps> = ({
  name,
  size = 24,
  color = "black",
}) => {
  const isUrl =
    typeof name === "string" &&
    (name.startsWith("http") || name.startsWith("/"));

  if (isUrl) {
    return (
      <Box
        component="img"
        src={name}
        alt="icon"
        width={size}
        height={size}
        sx={{ objectFit: "contain" }}
      />
    );
  }

  const allIcons = getAllReactIcons();
  const prefix = allIcons.find((a) => a.id === name);
  if (!prefix) {
    return <TfiLayoutWidthDefaultAlt size={size} color={color} />;
  }
  const IconComponent = prefix.component;
  return <IconComponent size={size} color={color} />;
};

export default DynamicIcon;

export const allowedIconsByPropertyAmenity: Record<
  string,
  { name: string; icon: string }[]
> = {
  Internet: [
    { name: "Free Wi-Fi in all rooms", icon: "IoWifiOutline" },
    { name: "Free Wi-Fi in public areas", icon: "IoWifi" },
  ],
  "Parking and transportation": [
    { name: "Free self-parking", icon: "FaParking" },
    { name: "Valet parking", icon: "LuSquareParking" },
    { name: "Car rental desk", icon: "MdOutlineCarRental" },
    { name: "Free self parking on site", icon: "GiDutchBike" },
    { name: "Shuttle services", icon: "MdOutlineAirportShuttle" },
  ],
  "Food and Beverage": [
    {
      name: "Daily cooked-to-order breakfast: USD 10 for adults and USD 7 for children",
      icon: "IoRestaurantSharp",
    },
    { name: "A restaurant", icon: "BiDrink" },
  ],
  "Restaurants on site": [
    { name: "Diamond Creek Restaurant", icon: "BiDrink" },
  ],
  "Things to do": [
    { name: "Gym", icon: "MdOutlineSportsGymnastics" },
    { name: "Library", icon: "MdOutlineLibraryAdd" },
    { name: "Outdoor pool", icon: "FaSwimmingPool" },
    { name: "Spa tub", icon: "GiTransparentTubes" },
  ],
  "Family friendly": [
    { name: "Crib (surcharge)", icon: "FaScribd" },
    { name: "In-room microwave", icon: "MdMicrowave" },
    { name: "In-room refrigerator", icon: "LuRefrigerator" },
    { name: "Laundry facilities", icon: "MdLocalLaundryService" },
    { name: "Outdoor pool", icon: "FaSwimmingPool" },
    {
      name: "Rollaway/extra bed (surcharge)",
      icon: "MdBed",
    },
    { name: "Soundproofed rooms", icon: "MdRoomPreferences" },
  ],
  "Recreation & Wellness": [
    { name: "Outdoor and indoor pools", icon: "FaSwimmingPool" },
    { name: "Full-service spa", icon: "FaSpa" },
    { name: "Sauna and hot tubs", icon: "MdHotTub" },
    { name: "Fitness center", icon: "IoIosFitness" },
    { name: "Yoga classes", icon: "TbYoga" },
  ],
  "Events & Business": [
    { name: "Conference rooms", icon: "GiVideoConference" },
    { name: "Ballrooms", icon: "TbBuildingCommunity" },
    { name: "Business center", icon: "HiOutlineDesktopComputer" },
    { name: "Co-working spaces", icon: "HiOutlineUserGroup" },
  ],
  Services: [
    { name: "24-hour front desk", icon: "LuConciergeBell" },
    { name: "Airport shuttle", icon: "TbBuildingAirport" },
    { name: "Luggage storage", icon: "FaLuggageCart" },
    { name: "Currency exchange", icon: "BsCurrencyExchange" },
    { name: "Laundry service", icon: "MdOutlineLocalLaundryService" },
    { name: "Mail room", icon: "BsMailboxFlag" },
  ],
  "Family-Friendly Features": [
    { name: "Kids club and activities program", icon: "TbPlayFootball" },
    { name: "Game room or arcade", icon: "TbBrandAppleArcade" },
    {
      name: "Family suites and connecting rooms",
      icon: "MdOutlineFamilyRestroom",
    },
  ],
  "Dining Options": [
    {
      name: "Multiple on-site restaurants (casual & fine dining)",
      icon: "IoRestaurantSharp",
    },
    { name: "Lobby bar and/or rooftop lounge", icon: "BiDrink" },
    { name: "Poolside bar and grill", icon: "LiaCocktailSolid" },
    { name: "24/7 coffee shop or cafe", icon: "SiBuymeacoffee" },
    { name: "Room service (24/7 availability)", icon: "MdDinnerDining" },
  ],
  Accessibility: [
    {
      name: "Accessible rooms and bathrooms (ADA-compliant)",
      icon: "MdOutlineAccessibleForward",
    },
    { name: "Elevators to all floors", icon: "MdOutlineElevator" },
    {
      name: "Wheelchair ramps and accessible public areas",
      icon: "LiaAccessibleIcon",
    },
  ],
  "Shopping & Convenience": [
    { name: "Gift shop", icon: "HiOutlineGift" },
    {
      name: "Convenience store for essentials",
      icon: "MdOutlineLocalConvenienceStore",
    },
    {
      name: "On-site luxury boutiques (optional)",
      icon: "MdOutlineShoppingBag",
    },
  ],
  "Outdoor Spaces": [
    { name: "Landscaped gardens", icon: "PiFlowerTulip" },
    { name: "Outdoor seating areas", icon: "SiBlockbench" },
    { name: "Walking trails or jogging paths", icon: "GiHiking" },
  ],
  "Security & Safety": [
    { name: "24/7 security personnel", icon: "GrUserPolice" },
    { name: "CCTV surveillance in public areas", icon: "PiSecurityCamera" },
    { name: "Keycard access to rooms and elevators", icon: "LiaIdCardSolid" },
    {
      name: "Emergency evacuation plan and first aid station",
      icon: "GiExitDoor",
    },
  ],
  "Technology & Connectivity": [
    { name: "Free Wi-Fi throughout the property", icon: "IoWifiOutline" },
    { name: "Mobile check-in/check-out options", icon: "MdMobileFriendly" },
    { name: "Digital room keys via smartphone app", icon: "MdPhonelinkLock" },
  ],
  "Luxury Extras": [
    { name: "Private pool or plunge pool (for suites)", icon: "MdPool" },
    { name: "Club lounge access (for VIP guests)", icon: "RiVipDiamondLine" },
    {
      name: "Butler service (on-demand or dedicated)",
      icon: "BsPersonRaisedHand",
    },
    { name: "Helipad (for ultra-luxury hotels)", icon: "TbHelicopter" },
  ],
  // Room Amenity Icons
  "General Comfort": [
    {
      name: "Air conditioning/Heating with individual controls",
      icon: "TbAirConditioning",
    },
    { name: "Premium bedding", icon: "MdOutlineBedroomParent" },
    { name: "Blackout curtains or motorized blinds", icon: "MdBlinds" },
    { name: "Soundproof windows and walls", icon: "AiOutlineSound" },
  ],
  "Technology & Entertainment": [
    {
      name: "6-Smart TV with streaming services and international channels",
      icon: "MdOutlineConnectedTv",
    },
    {
      name: "7-High-speed Wi-Fi (free and premium options)",
      icon: "CiWifiOn",
    },
    {
      name: "USB charging ports and universal power outlets",
      icon: "RiBatteryChargeLine",
    },
    { name: "Smart assistant", icon: "BsAlexa" },
    { name: "Bluetooth alarm clock and speakers", icon: "MdMediaBluetoothOn" },
    { name: "Work desk", icon: "MdDesk" },
  ],
  Convenience: [
    { name: "Iron and ironing board", icon: "TbIroning2" },
    { name: "Closet with hangers", icon: "BiCloset" },
    { name: "Full-length mirror", icon: "GiMirrorMirror" },
    { name: "12-Mini-bar or mini-fridge", icon: "RiFridgeLine" },
    { name: "Coffee/tea maker machine", icon: "MdOutlineCoffeeMaker" },
    { name: "In-room safe (laptop size)", icon: "BsSafe" },
  ],
  "Bathroom Features": [
    { name: "Walk-in shower and/or soaking tub", icon: "MdOutlineBathtub" },
    { name: "High-end toiletries", icon: "FaShower" },
    { name: "Hairdryer (professional-grade)", icon: "PiHairDryer" },
    {
      name: "Lighted makeup/shaving mirror (vanity area)",
      icon: "RiEyeCloseLine",
    },
    { name: "Bathrobes and slippers", icon: "GiRobe" },
    {
      name: "Bidet or Japanese-style toilet (optional for luxury)",
      icon: "PiToilet",
    },
  ],
  "Other Amenities": [
    {
      name: "Pillow menu with hypoallergenic options",
      icon: "GiPillow",
    },
    {
      name: "Turn-down service",
      icon: "BiBed",
    },
    {
      name: "Balcony or terrace (where applicable)",
      icon: "MdBalcony",
    },
    {
      name: "Complimentary bottled water",
      icon: "GiWaterBottle",
    },
    {
      name: "Room service (24/7)",
      icon: "MdDinnerDining",
    },
  ],
  // Internal icons used across UI (non-amenity specific)
  Internal: [
    { name: "VIP", icon: "RiVipCrown2Fill" },
    { name: "Incognito", icon: "BsIncognito" },
  ],
};

const getCategoryWiseIconList = (): Record<string, string[]> => {
  return Object.fromEntries(
    Object.entries(allowedIconsByPropertyAmenity).map(
      ([category, amenities]) => [category, amenities.map(({ icon }) => icon)]
    )
  );
};

export const allowedIconsByCategory: Record<string, string[]> =
  getCategoryWiseIconList();

export const getAllReactIcons = (): IconEntry[] => {
  const iconSets: Record<string, Record<string, FC<any>>> = {
    Fa: FaIcons,
    Md: MdIcons,
    Bs: BsIcons,
    Ai: AiIcons,
    Gi: GiIcons,
    Ri: RiIcons,
    Fa6: Fa6Icons,
    Hi: HiIcons,
    Lia: LiaIcons,
    Tb: TbIcons,
    Ci: CiIcons,
    Pi: PiIcons,
    Io: IoIcons,
    Si: SiIcons,
    Lu: LuIcons,
    Gr: GrIcons,
    Bi: BiIcons,
    Io5: Io5Icons,
  };
  // Create a mapping of icon name to label (amenity name)
  const iconNameToLabelMap = new Map<string, string>();

  Object.values(allowedIconsByPropertyAmenity)
    .flat()
    .forEach(({ name, icon }) => {
      iconNameToLabelMap.set(icon, name);
    });

  // Filter and return icons with the correct labels
  const allowedIcons = Object.values(allowedIconsByCategory).flat();

  const iconList = Object.entries(iconSets).flatMap(([prefix, icons]) =>
    Object.keys(icons).map((iconName) => ({
      id: iconName,
      label: iconNameToLabelMap.get(iconName) ?? iconName,
      component: icons[iconName as keyof typeof icons],
      type: prefix,
    }))
  );
  const filterIconList = iconList.filter((icon) =>
    allowedIcons.includes(icon.id)
  );

  return filterIconList;
};
