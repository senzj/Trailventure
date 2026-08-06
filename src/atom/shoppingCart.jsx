import { atom } from "jotai";
import store from "./store";

const shoppingCartAtom = atom([]);

// Add product to the shopping cart
const addProduct = (product) => {
  store.set(shoppingCartAtom, (prev) => {
    // Check if the product already exists in the cart
    const existingProductIndex = prev.findIndex(
      (item) => item.productID === product.productID,
    );
    if (existingProductIndex >= 0) {
      // Product exists, increment its quantity
      return prev.map((item, index) => {
        if (index === existingProductIndex) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
    } else {
      // Product doesn't exist, add it with quantity of 1
      return [...prev, { ...product, quantity: 1 }];
    }
  });
};

// Add a specific quantity of a product to the cart
const addProductQuantity = (product, quantity = 1) => {
  if (quantity < 1) return;

  store.set(shoppingCartAtom, (prev) => {
    const existingProductIndex = prev.findIndex(
      (item) => item.productID === product.productID,
    );
    if (existingProductIndex >= 0) {
      return prev.map((item, index) =>
        index === existingProductIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      );
    }
    return [...prev, { ...product, quantity }];
  });
};

// Remove product from the shopping cart
const removeProduct = (productID) => {
  store.set(shoppingCartAtom, (prev) =>
    prev.filter((item) => item.productID !== productID),
  );
};

// Adds product quantity of the product
const addQuantity = (productID) => {
  store.set(shoppingCartAtom, (prev) =>
    prev.map((item) => {
      if (item.productID === productID) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    }),
  );
};

// Subtract product quantity of the product
const subtractQuantity = (productID) => {
  store.set(shoppingCartAtom, (prev) =>
    prev.map((item) => {
      if (item.productID === productID && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    }),
  );
};

// Empty the entire cart after an order is placed
const clearCart = () => {
  store.set(shoppingCartAtom, []);
};

export {
  shoppingCartAtom,
  addProduct,
  addProductQuantity,
  removeProduct,
  addQuantity,
  subtractQuantity,
  clearCart,
};
