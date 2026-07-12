import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check, UserPlus, ChevronDown } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

const DEPARTMENT_OPTIONS = [
  { value: 'Finance', label: 'Finance' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'IT', label: 'IT' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Sales', label: 'Sales' },
];

const ORGANIZATION_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'asset_manager', label: 'Asset Manager' },
];

const DEPARTMENT_ROLES = [
  { value: 'department_head', label: 'Department Head' },
  { value: 'employee', label: 'Employee' },
];

function getPasswordChecks(password) {
  return {
    number: /\d/.test(password),
    length: password.length >= 6,
  };
}

export default function RegisterScreen() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'organization',
    role: 'admin',
    department: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const checks = getPasswordChecks(form.password);
  const passwordValid = Object.values(checks).every(Boolean);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAccountTypeChange = (accountType) => {
    setForm((current) => ({
      ...current,
      accountType,
      role: accountType === 'department' ? 'department_head' : 'admin',
      department: accountType === 'department' ? current.department : '',
    }));
  };

  const handleRoleSelect = (role) => {
    setForm((current) => ({
      ...current,
      role,
      accountType: role === 'department_head' || role === 'employee' ? 'department' : 'organization',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!passwordValid) {
      setError('Password does not meet all the requirements below.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }
    if ((form.role === 'department_head' || form.role === 'employee') && !form.department) {
      setError('Please select a department for department roles.');
      return;
    }

    setSubmitting(true);
    try {
      const departmentId = form.accountType === 'department' ? form.department : null;
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        department_id: departmentId,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F4F4] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {/* Icon + heading */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F4F4]">
            <UserPlus className="h-6 w-6 text-[#1D546D]" />
          </div>
          <h1 className="text-xl font-bold text-[#061E29]">Create Your Account</h1>
          <p className="mt-1 text-sm text-[#5F9598]">Join AssetFlow to start managing your organization better.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#061E29]">Full Name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                required
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-[#061E29] placeholder:text-gray-400 focus:border-[#1D546D] focus:outline-none focus:ring-1 focus:ring-[#1D546D]"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#061E29]">Email Address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="Enter your email address"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-[#061E29] placeholder:text-gray-400 focus:border-[#1D546D] focus:outline-none focus:ring-1 focus:ring-[#1D546D]"
              />
            </div>
          </div>

          {/* Account type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#061E29]">Account Type</label>
            <div className="relative">
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                name="accountType"
                value={form.accountType}
                onChange={(e) => handleAccountTypeChange(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm text-[#061E29] focus:border-[#1D546D] focus:outline-none focus:ring-1 focus:ring-[#1D546D]"
              >
                <option value="organization">Organization</option>
                <option value="department">Department</option>
              </select>
            </div>

            {form.accountType === 'organization' && (
              <div className="mt-3">
                <label className="mb-1 block text-sm font-medium text-[#061E29]">Role</label>
                <div className="relative">
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    name="role"
                    value={form.role}
                    onChange={(e) => handleRoleSelect(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm text-[#061E29] focus:border-[#1D546D] focus:outline-none focus:ring-1 focus:ring-[#1D546D]"
                  >
                    {ORGANIZATION_ROLES.map((roleOption) => (
                      <option key={roleOption.value} value={roleOption.value}>
                        {roleOption.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {form.accountType === 'department' && (
              <>
                <div className="mt-3">
                  <label className="mb-1 block text-sm font-medium text-[#061E29]">Department</label>
                  <div className="relative">
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <select
                      name="department"
                      required
                      value={form.department}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm text-[#061E29] focus:border-[#1D546D] focus:outline-none focus:ring-1 focus:ring-[#1D546D]"
                    >
                      <option value="">Select department</option>
                      {DEPARTMENT_OPTIONS.map((department) => (
                        <option key={department.value} value={department.value}>
                          {department.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="mb-1 block text-sm font-medium text-[#061E29]">Department Role</label>
                  <div className="relative">
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <select
                      name="role"
                      value={form.role}
                      onChange={(e) => handleRoleSelect(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm text-[#061E29] focus:border-[#1D546D] focus:outline-none focus:ring-1 focus:ring-[#1D546D]"
                    >
                      {DEPARTMENT_ROLES.map((roleOption) => (
                        <option key={roleOption.value} value={roleOption.value}>
                          {roleOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#061E29]">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm text-[#061E29] placeholder:text-gray-400 focus:border-[#1D546D] focus:outline-none focus:ring-1 focus:ring-[#1D546D]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Strength checklist */}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <StrengthItem ok={checks.length} label="6+ characters" />
              <StrengthItem ok={checks.number} label="Number" />
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#061E29]">Confirm Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                required
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm text-[#061E29] placeholder:text-gray-400 focus:border-[#1D546D] focus:outline-none focus:ring-1 focus:ring-[#1D546D]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 text-sm text-[#061E29]">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1D546D] focus:ring-[#1D546D]"
            />
            <span>
              I agree to the{' '}
              <span className="font-medium text-[#1D546D] hover:underline">Terms of Service</span> and{' '}
              <span className="font-medium text-[#1D546D] hover:underline">Privacy Policy</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1D546D] py-2.5 text-sm font-medium text-white transition hover:bg-[#061E29] disabled:opacity-50"
          >
            {submitting ? 'Creating account...' : (
              <>
                Create Account <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#1D546D] hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <p className="absolute bottom-6 text-xs text-gray-400">© 2026 AssetFlow. All rights reserved.</p>
    </div>
  );
}

function StrengthItem({ ok, label }) {
  return (
    <span className={`flex items-center gap-1 text-xs ${ok ? 'text-[#1D546D]' : 'text-gray-400'}`}>
      <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${ok ? 'bg-[#1D546D]' : 'bg-gray-200'}`}>
        <Check className="h-2.5 w-2.5 text-white" />
      </span>
      {label}
    </span>
  );
}
