import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../hooks/useAuth";

function Signup() {
  const navigate = useNavigate();
  const { user, fetching, signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    watch,
    setError,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      username: "",
      name: "",
      phone: "",
      address: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!fetching && user) {
      navigate("/");
    }
  }, [user, fetching, navigate]);

  const handleSignup = async (data) => {
    try {
      setLoading(true);
      await signup({
        username: data.username,
        name: data.name,
        phone: data.phone,
        address: data.address,
        email: data.email,
        password: data.password,
      });
      toast.success("Account created successfully");
    } catch (error) {
      setError("root", {
        type: "custom",
        message: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60";

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-soft">
      <h1 className="mb-6 text-center text-3xl font-bold text-foreground">
        Create an Account
      </h1>

      <form onSubmit={handleSubmit(handleSignup)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Jane Doe"
              disabled={loading}
              className={inputClass}
              {...register("name")}
            />
          </div>
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
              Username <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              id="username"
              type="text"
              placeholder="trail_blazer"
              disabled={loading}
              className={inputClass}
              {...register("username", {
                pattern: {
                  value: /^[a-zA-Z0-9_]{3,30}$/,
                  message: "Use 3-30 letters, numbers, or underscores",
                },
              })}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              disabled={loading}
              className={inputClass}
              {...register("phone")}
            />
          </div>
          <div>
            <label htmlFor="address" className="mb-1.5 block text-sm font-medium">
              Address
            </label>
            <input
              id="address"
              type="text"
              placeholder="123 Summit Trail, Aspen, CO 81611"
              disabled={loading}
              className={inputClass}
              {...register("address")}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            disabled={loading}
            className={inputClass}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            disabled={loading}
            className={inputClass}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\s\S]{8,}$/,
                message:
                  "Password must contain at least one uppercase letter, one lowercase letter, and one number",
              },
            })}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            disabled={loading}
            className={inputClass}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                watch("password") === value || "Your passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {errors.root && (
          <p className="text-sm text-destructive">{errors.root.message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Log in here
        </Link>
      </p>
    </div>
  );
}

export default Signup;