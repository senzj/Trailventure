import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";
import { fetchCategories } from "@/api/categories";
import { createProduct } from "@/api/products";
import ProductForm from "@/components/products/ProductForm";

function AdminAddProduct() {
  const { user, fetching } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!fetching && user?.role !== "admin" && user?.role !== "superadmin") {
      navigate("/unauthorized");
    }
  }, [user, fetching, navigate]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      await createProduct(payload);
      toast.success("Product added successfully");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.message || "Error adding product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="mb-6 text-3xl font-bold">Add Product</h1>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <ProductForm
          categories={categories}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default AdminAddProduct;