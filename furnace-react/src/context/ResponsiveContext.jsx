import { createContext, useState, useEffect, useContext } from "react";

const ResponsiveContext = createContext();

export const ResponsiveProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 769);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 769);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ResponsiveContext.Provider value={{ isMobile }}>
      {children}
    </ResponsiveContext.Provider>
  );
};

// A context file conventionally exports its hook next to the provider
// eslint-disable-next-line react-refresh/only-export-components
export const useResponsive = () => useContext(ResponsiveContext);
export { ResponsiveContext };
