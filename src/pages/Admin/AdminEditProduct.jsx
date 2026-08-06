import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";
import { fetchCategories } from "@/api/categories";
import { fetchProduct, updateProduct } from "@/api/products";
import ProductForm from "@/components/products/ProductForm";
import { Button } from "@/components/ui/button";
import ConditionalState from "@/components/ui/ConditionalState";

function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetching } = useAuth();
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!fetching && user?.role !== "admin" && user?.role !== "superadmin") {
      navigate("/unauthorized");
    }
  }, [user, fetching, navigate]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchProduct(id)
      .then((item) => active && setProduct(item))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      await updateProduct(id, payload);
      toast.success("Product updated successfully");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.message || "Error updating product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl py-10">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4"
        onClick={() => navigate("/admin/dashboard")}
      >
        <span className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </span>
      </Button>
      <h1 className="mb-6 text-3xl font-bold">Edit Product</h1>

      <ConditionalState loading={loading} error={error} onRetry={() => setReloadKey((k) => k + 1)}>
        {product && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <ProductForm
              product={product}
              categories={categories}
              submitting={submitting}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </ConditionalState>
    </div>
  );
}

export default AdminEditProduct;