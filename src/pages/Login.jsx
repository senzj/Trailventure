import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useAuth from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, fetching, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const from = location.state?.from || "/";

  const {
    register,
    setError,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!fetching && user) {
      navigate(from, { replace: true });
    }
  }, [user, fetching, navigate, from]);

  const handleLogin = async (data) => {
    try {
      setLoading(true);
      await login(data);
      toast.success("Successfully logged in");
      navigate(from, { replace: true });
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
        Login
      </h1>

      <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
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
              required: "Please enter your email",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Please enter a valid email",
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
            placeholder="Enter your password"
            disabled={loading}
            className={inputClass}
            {...register("password", {
              required: "Please enter your password",
            })}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
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
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="font-medium text-primary hover:underline">
          Sign up here
        </Link>
      </p>
    </div>
  );
}

export default Login;