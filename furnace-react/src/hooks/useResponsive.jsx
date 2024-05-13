import { useContext } from "react";
import { ResponsiveContext } from "/src/context/ResponsiveContext";

const useResponsive = () => {
  return useContext(ResponsiveContext);
};

export default useResponsive;
