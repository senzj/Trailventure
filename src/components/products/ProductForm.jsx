import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60";

function ProductForm({ product = null, categories = [], submitting = false, onSubmit }) {
  const [values, setValues] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    stock: product?.stock ?? "",
    discount: product?.discount ?? "",
    categoryId: product?.categoryId ?? "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(product?.image ?? "");
  const previewUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const set = (key) => (event) => setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    if (file) {
      previewUrlRef.current = URL.createObjectURL(file);
    }
    setImage(file);
    setPreview(file ? previewUrlRef.current : product?.image ?? "");
  };

  const clearImage = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImage(null);
    setPreview("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!values.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (values.price === "" || Number.isNaN(Number(values.price))) {
      toast.error("A valid price is required");
      return;
    }
    onSubmit({ ...values, image });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="pf-name" className="mb-1.5 block">
          Product Name
        </Label>
        <Input
          id="pf-name"
          value={values.name}
          onChange={set("name")}
          placeholder="e.g. Summit Ridge Tent"
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="pf-category" className="mb-1.5 block">
            Category
          </Label>
          <select
            id="pf-category"
            value={values.categoryId}
            onChange={set("categoryId")}
            className={inputClass}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="pf-image" className="mb-1.5 block">
            Product Image
          </Label>
          <div className="flex items-start gap-4">
            <div className="relative h-24 w-24 flex-none overflow-hidden rounded-xl border border-border bg-muted">
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    aria-label="Remove image"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ImagePlus className="h-7 w-7" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Input
                id="pf-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {product?.image && !preview
                  ? "Current image will be kept if you don't choose a new one."
                  : "JPG, PNG, WebP or GIF up to 5MB."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <Label htmlFor="pf-price" className="mb-1.5 block">
            Price ($)
          </Label>
          <Input
            id="pf-price"
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={set("price")}
            placeholder="0.00"
            className={inputClass}
          />
        </div>

        <div>
          <Label htmlFor="pf-discount" className="mb-1.5 block">
            Discount (%)
          </Label>
          <Input
            id="pf-discount"
            type="number"
            min="0"
            max="100"
            step="1"
            value={values.discount}
            onChange={set("discount")}
            placeholder="0"
            className={inputClass}
          />
        </div>

        <div>
          <Label htmlFor="pf-stock" className="mb-1.5 block">
            Stock
          </Label>
          <Input
            id="pf-stock"
            type="number"
            min="0"
            step="1"
            value={values.stock}
            onChange={set("stock")}
            placeholder="0"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="pf-description" className="mb-1.5 block">
          Description
        </Label>
        <textarea
          id="pf-description"
          rows={4}
          value={values.description}
          onChange={set("description")}
          placeholder="Describe the product..."
          className={inputClass}
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Saving..." : product ? "Save Changes" : "Add Product"}
      </Button>
    </form>
  );
}

export default ProductForm;