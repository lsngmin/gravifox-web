import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import signupAPI from "../../../../features/login/api/signupAPI";
import { useTranslation } from 'react-i18next';

const RegisterBox = ({ variant = 'default' }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const termsCookieParam = searchParams.get("termsCookie");
  const termsMarketingParam = searchParams.get("termsMarketing");

  const [showPassword, setShowPassword] = useState(false);

  const [formState, setFormState] = useState({
    email: "",
    password: "",
    name: "",
    dob: "",
    termsCookie: "",
    termsMarketing: "",
  });
  const [errors, setErrors] = useState({
    email: null,
    password: null,
    name: null,
    dob: null,
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    name: false,
    dob: false,
  });
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    if (termsCookieParam == null && termsMarketingParam == null) {
      navigate("/agree", { replace: true });
      return;
    }
    setFormState((prev) => ({
      ...prev,
      termsCookie: termsCookieParam ?? "",
      termsMarketing: termsMarketingParam ?? "",
    }));
  }, [termsCookieParam, termsMarketingParam, navigate]);

  const { signup } = signupAPI();

  const validateEmail = (value) => {
    if (!value) return t('registerPage.errors.emailRequired', 'Email is required.');
    const re = /^\S+@\S+\.\S+$/;
    return re.test(value) ? null : t('registerPage.errors.invalidEmail', 'Invalid email format.');
  };

  const validatePassword = (value) => {
    if (!value) return t('registerPage.errors.passwordRequired', 'Password is required.');
    const re = /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]:";'<>?,./]).{8,20}$/;
    return re.test(value)
      ? null
      : t('registerPage.errors.passwordPolicy', '8–20 chars incl. uppercase, letter, number, special');
  };

  const validateName = (value) => {
    return value.trim() ? null : t('registerPage.errors.nameRequired', 'Name is required.');
  };

  const validateDob = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return t('registerPage.errors.dobRequired', 'Date of Birth is required.');
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 8) return t('registerPage.errors.dobFormat', 'Use YYYYMMDD format.');
    const yyyy = Number(digits.slice(0, 4));
    const mm = Number(digits.slice(4, 6));
    const dd = Number(digits.slice(6, 8));
    if (Number.isNaN(yyyy) || Number.isNaN(mm) || Number.isNaN(dd)) return t('registerPage.errors.dobFormat', 'Use YYYYMMDD format.');
    if (mm < 1 || mm > 12) return t('registerPage.errors.dobFormat', 'Use YYYYMMDD format.');
    const daysInMonth = [31, (yyyy % 4 === 0 && yyyy % 100 !== 0) || (yyyy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (dd < 1 || dd > daysInMonth[mm - 1]) return t('registerPage.errors.dobFormat', 'Use YYYYMMDD format.');
    return null;
  };

  const handleInputChange = (field) => (e) => {
    const newValue = e.target.value;
    if (field === 'dob') {
      const digits = String(newValue || '').replace(/\D/g, '').slice(0, 8);
      setFormState((prev) => ({ ...prev, [field]: digits }));
    } else {
      setFormState((prev) => ({ ...prev, [field]: newValue }));
    }

    let errorMsg = null;
    switch (field) {
      case "email":
        errorMsg = touched.email ? validateEmail(newValue) : null;
        setErrors((prev) => ({ ...prev, email: errorMsg }));
        return;
      case "password":
        errorMsg = touched.password ? validatePassword(newValue) : null;
        setErrors((prev) => ({ ...prev, password: errorMsg }));
        return;
      case "name":
        errorMsg = touched.name ? validateName(newValue) : null;
        setErrors((prev) => ({ ...prev, name: errorMsg }));
        return;
      case "dob":
        errorMsg = touched.dob && newValue.length === 8 ? validateDob(newValue) : null;
        setErrors((prev) => ({ ...prev, dob: errorMsg }));
        return;
      default:
        return;
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let errorMsg = null;
    const value = formState[field] || "";
    switch (field) {
      case "email":
        errorMsg = validateEmail(value);
        break;
      case "password":
        errorMsg = validatePassword(value);
        break;
      case "name":
        errorMsg = validateName(value);
        break;
      case "dob":
        if (value.length === 8) errorMsg = validateDob(value);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  useEffect(() => {
    const ok = !validateEmail(formState.email)
      && !validatePassword(formState.password)
      && !validateName(formState.name)
      && formState.dob && formState.dob.length === 8 && !validateDob(formState.dob);
    setCanSubmit(ok);
  }, [formState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await signup({
        email: formState.email,
        password: formState.password,
        name: formState.name,
        dob: formState.dob,
        termsCookie: formState.termsCookie,
        termsMarketing: formState.termsMarketing,
      });
      navigate('/verify', { state: { email: formState.email } });
    } catch (err) {
      // TODO: server error handling
    }
  };

  const isMobileDark = variant === 'mobile-dark';

  return (
    <div className="mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className={`${isMobileDark ? 'mb-2 block text-slate-200' : 'mb-2 block text-gray-700'}`}>{t('registerPage.emailLabel', 'Email')}</label>
          <input
            type="email"
            id="email"
            value={formState.email}
            onChange={handleInputChange("email")}
            onBlur={handleBlur("email")}
            autoComplete="email"
            enterKeyHint="next"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={`${isMobileDark
              ? 'block w-full rounded-2xl bg-slate-900/60 px-3 py-3 text-sm text-slate-100 ring-1 ring-slate-700 transition placeholder:text-slate-500 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-400/30'
              : 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
            placeholder={t('registerPage.placeholders.email', 'you@example.com')}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className={`${isMobileDark ? 'mb-2 block text-slate-200' : 'mb-2 block text-gray-700'}`}>{t('registerPage.passwordLabel', 'Password')}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formState.password}
              onChange={handleInputChange("password")}
              onBlur={handleBlur("password")}
              autoComplete="new-password"
              enterKeyHint="next"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`${isMobileDark
                ? 'block w-full rounded-2xl bg-slate-900/60 px-3 py-3 text-sm text-slate-100 ring-1 ring-slate-700 transition placeholder:text-slate-500 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-400/30'
                : 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
              placeholder={t('registerPage.placeholders.password', '8–20 chars incl. uppercase, letter, number, special')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center"
              aria-label={showPassword ? t('registerPage.actions.hidePassword', 'Hide password') : t('registerPage.actions.showPassword', 'Show password')}
            >
              {showPassword ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="#3e3e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="#3e3e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z" stroke="#3e3e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className={`${isMobileDark ? 'mb-2 block text-slate-100' : 'mb-2 block text-gray-700'}`}>{t('registerPage.nameLabel', 'Name')}</label>
          <input
            type="text"
            id="name"
            value={formState.name}
            onChange={handleInputChange("name")}
            onBlur={handleBlur("name")}
            autoComplete="name"
            enterKeyHint="next"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={`${isMobileDark
              ? 'block w-full rounded-2xl bg-slate-900/55 px-3 py-3 text-sm text-slate-100 ring-1 ring-slate-600 transition placeholder:text-slate-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-400/40'
              : 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
            placeholder={t('registerPage.placeholders.name', 'Your name')}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dob" className={`${isMobileDark ? 'mb-2 block text-slate-200' : 'mb-2 block text-gray-700'}`}>{t('registerPage.dobLabel', 'Date of Birth (YYYYMMDD)')}</label>
          <input
            type="text"
            id="dob"
            value={formState.dob}
            onChange={handleInputChange("dob")}
            onBlur={handleBlur("dob")}
            maxLength={8}
            inputMode="numeric"
            pattern="[0-9]{8}"
            autoComplete="bday"
            enterKeyHint="done"
            aria-invalid={!!errors.dob}
            aria-describedby={errors.dob ? 'dob-error' : undefined}
            className={`${isMobileDark
              ? 'block w-full rounded-2xl bg-slate-900/60 px-3 py-3 text-sm text-slate-100 ring-1 ring-slate-700 transition placeholder:text-slate-500 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-400/30'
              : 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
            placeholder={t('registerPage.placeholders.dob', 'YYYYMMDD')}
          />
          {errors.dob && (
            <p id="dob-error" className="mt-1 text-xs text-red-500">{errors.dob}</p>
          )}
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`flex h-12 w-full items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
              canSubmit
                ? 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-sky-400 text-white shadow-[0_18px_36px_-22px_rgba(59,130,246,0.55)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400/40'
                : 'cursor-not-allowed ring-1 ring-slate-300 bg-slate-100 text-slate-400 dark:bg-slate-800/70 dark:text-slate-200/90 dark:ring-slate-600/60'
            }`}
          >
            {t('registerPage.submit', 'Sign Up')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterBox;
