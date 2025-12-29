import { coursesData } from "@/data/courses";
import { events } from "@/data/events";
import { productData } from "@/data/products";
import React from "react";
import { useContext, useState, useEffect } from "react";
const dataContext = React.createContext();
export const useContextElement = () => {
  return useContext(dataContext);
};

export default function Context({ children }) {
  const [cartProducts, setCartProducts] = useState([]);

  const [cartCourses, setCartCourses] = useState([]);
  const [cartEvents, setCartEvents] = useState([]);

  // Auth state - initialize from localStorage if available
  const [auth, setAuth] = useState(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        return JSON.parse(storedAuth);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Save auth to localStorage whenever it changes
  useEffect(() => {
    if (auth) {
      localStorage.setItem("auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("auth");
    }
  }, [auth]);

  const setAuthData = (authData) => {
    setAuth(authData);
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
  };
  const addCourseToCart = (id) => {
    if (!cartCourses.filter((elm) => elm.id == id)[0]) {
      const item = {
        ...coursesData.filter((elm) => elm.id == id)[0],
        quantity: 1,
      };
      setCartCourses((pre) => [...pre, item]);
    }
  };
  const isAddedToCartCourses = (id) => {
    if (cartCourses.filter((elm) => elm.id == id)[0]) {
      return true;
    }
    return false;
  };
  const addProductToCart = (id) => {
    if (!cartProducts.filter((elm) => elm.id == id)[0]) {
      const item = {
        ...productData.filter((elm) => elm.id == id)[0],
        quantity: 1,
      };
      setCartProducts((pre) => [...pre, item]);
    }
  };
  const isAddedToCartProducts = (id) => {
    if (cartProducts.filter((elm) => elm.id == id)[0]) {
      return true;
    }
    return false;
  };
  const addEventToCart = (id) => {
    if (!cartEvents.filter((elm) => elm.id == id)[0]) {
      const item = { ...events.filter((elm) => elm.id == id)[0], quantity: 1 };
      setCartEvents((pre) => [...pre, item]);
    }
  };
  const isAddedToCartEvents = (id) => {
    if (cartEvents.filter((elm) => elm.id == id)[0]) {
      return true;
    }
    return false;
  };

  const contextElement = {
    cartProducts,
    setCartProducts,
    addProductToCart,
    isAddedToCartProducts,

    addCourseToCart,
    isAddedToCartCourses,
    cartCourses,
    setCartCourses,

    cartEvents,
    setCartEvents,
    addEventToCart,
    isAddedToCartEvents,

    auth,
    setAuthData,
    logout,
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
