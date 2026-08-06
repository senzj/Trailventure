import { useEffect, useState } from "react";
import { fetchProducts } from "../api/products";

// Randomizes array elements using the Fisher-Yates algorithm.
function shuffleArray(array) {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Sorts products by newest first.
function sortByLatest(products) {
  return [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Loads products from the local API.
 * `randomize` shuffles the result; `latest` sorts by creation date.
 */
function useProduct(randomize = false, latest = false) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchProducts()
      .then((list) => {
        if (!active) return;
        let result = list;
        if (latest) result = sortByLatest(result);
        else if (randomize) result = shuffleArray(result);
        setProducts(result);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [randomize, latest]);

  return { products, loading };
}

export default useProduct;